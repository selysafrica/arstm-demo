# =============================================================================
# ARSTM demo — déploiement sur VPS (Hostinger) avec nginx + certbot
#
# Architecture :
#   Internet ──► nginx :80/:443 (arstm.selys.app, TLS Let's Encrypt)
#                   └─► proxy ──► nginx 127.0.0.1:3439 (build Angular statique)
#
# Premier déploiement (sur le serveur, dans le clone du dépôt) :
#   make doctor                       # vérifie nginx, certbot, node, DNS, port
#   make setup EMAIL=vous@domaine     # nginx-init + build-static + publish + certbot + https
#
# Mises à jour suivantes :
#   make deploy                       # git pull + build-static + publish + reload
#
# Variante Docker (le build tourne dans un conteneur nginx sur 127.0.0.1:3439) :
#   make build                        # construit l’image Docker
#   make up                           # démarre / met à jour le conteneur
#   make docker-install               # Docker Engine + Compose v2 (si absents)
#   make docker-setup EMAIL=vous@domaine
#   make docker-deploy                # mises à jour
#
# Toutes les variables sont surchargeables : make deploy BRANCH=dev PORT=3440
# =============================================================================

# ---- Paramètres ------------------------------------------------------------
DOMAIN          ?= arstm.selys.app
PORT            ?= 3439
EMAIL           ?=
BRANCH          ?= main

APP_NAME        := arstm-app
DIST_DIR        := dist/arstm-demo/browser
WEB_ROOT        ?= /var/www/$(DOMAIN)
ACME_ROOT       ?= /var/www/certbot

NGINX_DIR       ?= /etc/nginx
NGINX_AVAILABLE ?= $(NGINX_DIR)/sites-available
NGINX_ENABLED   ?= $(NGINX_DIR)/sites-enabled
TPL_DIR         := deploy/nginx
BUILD_TMP       := .deploy-tmp

# Déploiement à distance depuis votre poste (facultatif) : make upload SSH=user@ip
SSH             ?=
REMOTE_DIR      ?= /var/www/arstm-demo

# sudo uniquement si on n’est pas root
SUDO            := $(shell [ "$$(id -u)" = "0" ] || echo sudo)

# Docker : sudo seulement si l’utilisateur ne peut pas parler au démon
DOCKER_SUDO     := $(shell docker info >/dev/null 2>&1 || ([ "$$(id -u)" = "0" ] || echo sudo))
COMPOSE         ?= $(DOCKER_SUDO) docker compose
CONTAINER       := arstm-web
HEALTH_TIMEOUT  ?= 60

# Rendu des gabarits nginx
RENDER = sed -e 's|__DOMAIN__|$(DOMAIN)|g' \
             -e 's|__PORT__|$(PORT)|g' \
             -e 's|__WEB_ROOT__|$(WEB_ROOT)|g' \
             -e 's|__ACME_ROOT__|$(ACME_ROOT)|g'

.DEFAULT_GOAL := help
.PHONY: help doctor server-deps install build up build-static publish deploy setup \
        nginx-init nginx-ssl nginx-test nginx-reload nginx-remove \
        certbot certbot-renew-test status logs check-dns upload remote-deploy clean \
        nginx-proxy-init docker-install docker-build docker-up docker-down docker-restart \
        docker-logs docker-ps docker-wait docker-deploy docker-setup docker-prune

# ---- Aide ------------------------------------------------------------------
help: ## Affiche cette aide
	@echo "ARSTM demo — déploiement sur $(DOMAIN) (app interne : 127.0.0.1:$(PORT))"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Premier déploiement : make setup EMAIL=vous@domaine     (Docker : make docker-setup EMAIL=…)"
	@echo "Mise à jour         : make deploy                       (Docker : make docker-deploy)"

# ---- Vérifications serveur -------------------------------------------------
doctor: ## Vérifie les prérequis (nginx, certbot, node, port, DNS)
	@printf "nginx    : "; (nginx -v 2>&1 || echo "ABSENT → make server-deps")
	@printf "certbot  : "; (certbot --version 2>&1 || echo "ABSENT → make server-deps")
	@printf "rsync    : "; (rsync --version 2>/dev/null | head -1 || echo "ABSENT → make server-deps")
	@printf "node     : "; (node -v 2>/dev/null || echo "ABSENT (Node 22 LTS requis pour le build)")
	@printf "npm      : "; (npm -v 2>/dev/null || echo "ABSENT")
	@printf "docker   : "; (docker --version 2>/dev/null || echo "ABSENT (mode Docker uniquement → make docker-install)")
	@printf "compose  : "; (docker compose version 2>/dev/null || echo "ABSENT (mode Docker uniquement)")
	@printf "port $(PORT): "; \
	  if command -v ss >/dev/null && ss -ltn 2>/dev/null | grep -q ":$(PORT) "; then \
	    echo "déjà en écoute (normal si nginx-init a été lancé, sinon conflit)"; \
	  else echo "libre"; fi
	@$(MAKE) --no-print-directory check-dns

check-dns: ## Vérifie que le domaine pointe vers ce serveur
	@printf "DNS $(DOMAIN) : "; \
	  ip_dns=$$(getent hosts $(DOMAIN) | awk '{print $$1}' | head -1); \
	  ip_srv=$$(curl -s -4 --max-time 5 https://api.ipify.org || echo "?"); \
	  echo "$${ip_dns:-non résolu} (IP publique du serveur : $$ip_srv)"; \
	  if [ -n "$$ip_dns" ] && [ "$$ip_dns" != "$$ip_srv" ]; then \
	    echo "  ⚠ le domaine ne pointe pas vers ce serveur : certbot échouera."; fi

server-deps: ## Installe nginx, certbot et rsync (Ubuntu/Debian)
	$(SUDO) apt-get update
	$(SUDO) apt-get install -y nginx certbot rsync curl
	@echo "Node.js n’est pas installé par cette cible. Ex. Node 22 LTS :"
	@echo "  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"

# ---- Build -----------------------------------------------------------------
install: ## Installe les dépendances npm (npm ci)
	npm ci --no-audit --no-fund

build-static: install ## Mode sans Docker : build Angular → dist/arstm-demo/browser
	npx ng build --configuration production
	@test -f $(DIST_DIR)/index.html || (echo "Build introuvable dans $(DIST_DIR)" && exit 1)
	@echo "✓ Build prêt : $(DIST_DIR)"

publish: ## Copie le build dans le dossier web servi par le port interne
	@test -f $(DIST_DIR)/index.html || (echo "Lancez d’abord : make build-static" && exit 1)
	$(SUDO) mkdir -p $(WEB_ROOT)
	$(SUDO) rsync -a --delete $(DIST_DIR)/ $(WEB_ROOT)/
	$(SUDO) find $(WEB_ROOT) -type d -exec chmod 755 {} +
	$(SUDO) find $(WEB_ROOT) -type f -exec chmod 644 {} +
	@echo "✓ Publié dans $(WEB_ROOT)"

# ---- nginx -----------------------------------------------------------------
nginx-init: ## Installe le serveur interne (port 3439) et le vhost HTTP du domaine
	@test -d $(NGINX_AVAILABLE) || (echo "$(NGINX_AVAILABLE) introuvable : nginx est-il installé ?" && exit 1)
	$(SUDO) mkdir -p $(WEB_ROOT) $(ACME_ROOT)/.well-known/acme-challenge
	@if [ ! -f $(WEB_ROOT)/index.html ]; then \
	  echo '<!doctype html><meta charset="utf-8"><title>ARSTM</title><p>Déploiement en cours…</p>' | $(SUDO) tee $(WEB_ROOT)/index.html >/dev/null; fi
	@mkdir -p $(BUILD_TMP)
	$(RENDER) $(TPL_DIR)/arstm-app.conf > $(BUILD_TMP)/$(APP_NAME).conf
	@if [ -f /etc/letsencrypt/live/$(DOMAIN)/fullchain.pem ]; then \
	  echo "Certificat déjà présent : installation du vhost HTTPS"; \
	  $(RENDER) $(TPL_DIR)/arstm.selys.app.conf > $(BUILD_TMP)/$(DOMAIN).conf; \
	else \
	  $(RENDER) $(TPL_DIR)/arstm.selys.app.http.conf > $(BUILD_TMP)/$(DOMAIN).conf; \
	fi
	$(SUDO) install -m 644 $(BUILD_TMP)/$(APP_NAME).conf $(NGINX_AVAILABLE)/$(APP_NAME).conf
	$(SUDO) install -m 644 $(BUILD_TMP)/$(DOMAIN).conf $(NGINX_AVAILABLE)/$(DOMAIN).conf
	$(SUDO) ln -sf $(NGINX_AVAILABLE)/$(APP_NAME).conf $(NGINX_ENABLED)/$(APP_NAME).conf
	$(SUDO) ln -sf $(NGINX_AVAILABLE)/$(DOMAIN).conf $(NGINX_ENABLED)/$(DOMAIN).conf
	@rm -rf $(BUILD_TMP)
	@$(MAKE) --no-print-directory nginx-test nginx-reload
	@echo "✓ nginx configuré : http://$(DOMAIN) → 127.0.0.1:$(PORT)"

nginx-ssl: ## Installe le vhost HTTPS (après make certbot)
	@$(SUDO) test -f /etc/letsencrypt/live/$(DOMAIN)/fullchain.pem || \
	  (echo "Aucun certificat pour $(DOMAIN) : lancez make certbot EMAIL=…" && exit 1)
	@mkdir -p $(BUILD_TMP)
	$(RENDER) $(TPL_DIR)/arstm.selys.app.conf > $(BUILD_TMP)/$(DOMAIN).conf
	$(SUDO) install -m 644 $(BUILD_TMP)/$(DOMAIN).conf $(NGINX_AVAILABLE)/$(DOMAIN).conf
	@rm -rf $(BUILD_TMP)
	@$(MAKE) --no-print-directory nginx-test nginx-reload
	@echo "✓ HTTPS actif : https://$(DOMAIN)"

nginx-test: ## Vérifie la syntaxe de la configuration nginx
	$(SUDO) nginx -t

nginx-reload: ## Recharge nginx sans coupure
	$(SUDO) systemctl reload nginx

nginx-remove: ## Retire les vhosts ARSTM de nginx (ne touche ni au build ni aux certificats)
	$(SUDO) rm -f $(NGINX_ENABLED)/$(APP_NAME).conf $(NGINX_ENABLED)/$(DOMAIN).conf
	$(SUDO) rm -f $(NGINX_AVAILABLE)/$(APP_NAME).conf $(NGINX_AVAILABLE)/$(DOMAIN).conf
	@$(MAKE) --no-print-directory nginx-test nginx-reload

# ---- Certificat TLS --------------------------------------------------------
certbot: ## Obtient le certificat Let's Encrypt (EMAIL=… requis) puis active HTTPS
	@test -n "$(EMAIL)" || (echo "Précisez un e-mail : make certbot EMAIL=vous@domaine" && exit 1)
	$(SUDO) certbot certonly --webroot -w $(ACME_ROOT) -d $(DOMAIN) \
	  --email $(EMAIL) --agree-tos --no-eff-email --non-interactive --keep-until-expiring \
	  --deploy-hook "systemctl reload nginx"
	@$(MAKE) --no-print-directory nginx-ssl

certbot-renew-test: ## Simule le renouvellement automatique du certificat
	$(SUDO) certbot renew --dry-run
	@systemctl list-timers 2>/dev/null | grep -i certbot || echo "Astuce : vérifiez le timer/cron certbot (renouvellement auto)."

# ---- Enchaînements ---------------------------------------------------------
setup: ## Premier déploiement complet (EMAIL=… requis)
	@test -n "$(EMAIL)" || (echo "Précisez un e-mail : make setup EMAIL=vous@domaine" && exit 1)
	@$(MAKE) --no-print-directory nginx-init
	@$(MAKE) --no-print-directory build-static
	@$(MAKE) --no-print-directory publish
	@$(MAKE) --no-print-directory certbot EMAIL=$(EMAIL)
	@$(MAKE) --no-print-directory status

deploy: ## Mise à jour sans Docker : git pull + build-static + publish + reload
	git fetch origin $(BRANCH)
	git checkout $(BRANCH)
	git pull --ff-only origin $(BRANCH)
	@$(MAKE) --no-print-directory build-static
	@$(MAKE) --no-print-directory publish
	@$(MAKE) --no-print-directory nginx-reload
	@$(MAKE) --no-print-directory status

status: ## Teste l’app interne, le HTTP et le HTTPS public
	@printf "interne  http://127.0.0.1:$(PORT)/        → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 http://127.0.0.1:$(PORT)/ || echo "injoignable"
	@printf "SPA      http://127.0.0.1:$(PORT)/admin   → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 http://127.0.0.1:$(PORT)/admin || echo "injoignable"
	@printf "public   http://$(DOMAIN)/          → "; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" --max-time 8 http://$(DOMAIN)/ || echo "injoignable"
	@printf "public   https://$(DOMAIN)/         → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 8 https://$(DOMAIN)/ || echo "pas encore de HTTPS"

logs: ## Affiche les dernières erreurs nginx du site
	$(SUDO) tail -n 50 /var/log/nginx/$(DOMAIN).error.log /var/log/nginx/arstm-app.error.log 2>/dev/null || true

# ---- Docker ----------------------------------------------------------------
build: docker-build ## Construit l’image Docker (alias de docker-build)

up: docker-up ## Démarre ou met à jour le conteneur sur 127.0.0.1:3439 (alias de docker-up)

docker-install: ## Installe Docker Engine et Compose v2 (Ubuntu/Debian)
	$(SUDO) apt-get update
	$(SUDO) apt-get install -y docker.io docker-compose-v2
	$(SUDO) systemctl enable --now docker
	@echo "✓ Docker installé. Sans sudo : sudo usermod -aG docker $$USER (puis reconnectez-vous)."

nginx-proxy-init: ## Mode Docker : vhost public seul (désactive le serveur interne de l’hôte)
	@test -d $(NGINX_AVAILABLE) || (echo "$(NGINX_AVAILABLE) introuvable : nginx est-il installé ?" && exit 1)
	$(SUDO) mkdir -p $(ACME_ROOT)/.well-known/acme-challenge
	@if [ -e $(NGINX_ENABLED)/$(APP_NAME).conf ]; then \
	  echo "Désactivation du serveur interne de l’hôte ($(APP_NAME).conf) : le conteneur prend le port $(PORT)"; \
	  $(SUDO) unlink $(NGINX_ENABLED)/$(APP_NAME).conf; fi
	@mkdir -p $(BUILD_TMP)
	@if [ -f /etc/letsencrypt/live/$(DOMAIN)/fullchain.pem ]; then \
	  echo "Certificat déjà présent : installation du vhost HTTPS"; \
	  $(RENDER) $(TPL_DIR)/arstm.selys.app.conf > $(BUILD_TMP)/$(DOMAIN).conf; \
	else \
	  $(RENDER) $(TPL_DIR)/arstm.selys.app.http.conf > $(BUILD_TMP)/$(DOMAIN).conf; \
	fi
	$(SUDO) install -m 644 $(BUILD_TMP)/$(DOMAIN).conf $(NGINX_AVAILABLE)/$(DOMAIN).conf
	$(SUDO) ln -sf $(NGINX_AVAILABLE)/$(DOMAIN).conf $(NGINX_ENABLED)/$(DOMAIN).conf
	@$(MAKE) --no-print-directory nginx-test nginx-reload
	@echo "✓ nginx de l’hôte : $(DOMAIN) → conteneur 127.0.0.1:$(PORT)"

docker-build: ## Construit l’image Docker (build Angular inclus)
	$(COMPOSE) build

docker-up: ## Démarre ou met à jour le conteneur (127.0.0.1:3439)
	@if [ -e $(NGINX_ENABLED)/$(APP_NAME).conf ]; then \
	  echo "Le nginx de l’hôte sert déjà le port $(PORT) (mode sans Docker)."; \
	  echo "Lancez d’abord : make nginx-proxy-init"; exit 1; fi
	PORT=$(PORT) $(COMPOSE) up -d --build --remove-orphans
	@$(MAKE) --no-print-directory docker-wait

docker-wait: ## Attend que le conteneur soit « healthy »
	@printf "Attente du conteneur $(CONTAINER)"; i=0; st=""; \
	while [ $$i -lt $(HEALTH_TIMEOUT) ]; do \
	  st=$$($(DOCKER_SUDO) docker inspect -f '{{.State.Health.Status}}' $(CONTAINER) 2>/dev/null); \
	  if [ "$$st" = "healthy" ]; then echo " ✓ healthy"; exit 0; fi; \
	  printf "."; sleep 2; i=$$((i+2)); \
	done; \
	echo " ✗ état : $${st:-inconnu}"; $(COMPOSE) logs --tail 30 web; exit 1

docker-down: ## Arrête et retire le conteneur (l’image est conservée)
	$(COMPOSE) down

docker-restart: ## Redémarre le conteneur
	$(COMPOSE) restart web
	@$(MAKE) --no-print-directory docker-wait

docker-logs: ## Suit les logs du conteneur (Ctrl+C pour quitter)
	$(COMPOSE) logs -f --tail 100 web

docker-ps: ## État du conteneur
	$(COMPOSE) ps

docker-prune: ## Supprime les anciennes images non utilisées
	$(DOCKER_SUDO) docker image prune -f

docker-setup: ## Mode Docker : premier déploiement complet (EMAIL=… requis)
	@test -n "$(EMAIL)" || (echo "Précisez un e-mail : make docker-setup EMAIL=vous@domaine" && exit 1)
	@$(MAKE) --no-print-directory nginx-proxy-init
	@$(MAKE) --no-print-directory docker-up
	@$(MAKE) --no-print-directory certbot EMAIL=$(EMAIL)
	@$(MAKE) --no-print-directory status

docker-deploy: ## Mode Docker : git pull + reconstruction de l’image + redémarrage
	git fetch origin $(BRANCH)
	git checkout $(BRANCH)
	git pull --ff-only origin $(BRANCH)
	@$(MAKE) --no-print-directory docker-up
	@$(MAKE) --no-print-directory docker-prune
	@$(MAKE) --no-print-directory status

# ---- Depuis votre poste (facultatif) ---------------------------------------
upload: build-static ## Build en local puis envoi du build sur le serveur (SSH=user@ip)
	@test -n "$(SSH)" || (echo "Précisez la cible : make upload SSH=user@ip" && exit 1)
	rsync -az --delete --rsync-path="sudo rsync" $(DIST_DIR)/ $(SSH):$(WEB_ROOT)/
	ssh $(SSH) "sudo systemctl reload nginx"
	@echo "✓ Build envoyé sur $(SSH):$(WEB_ROOT)"

remote-deploy: ## Lance « make deploy » sur le serveur via SSH (SSH=user@ip)
	@test -n "$(SSH)" || (echo "Précisez la cible : make remote-deploy SSH=user@ip" && exit 1)
	ssh -t $(SSH) "cd $(REMOTE_DIR) && make deploy BRANCH=$(BRANCH)"

clean: ## Supprime le build local
	rm -rf dist $(BUILD_TMP)
