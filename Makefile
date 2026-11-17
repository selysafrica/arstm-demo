# =============================================================================
# ARSTM demo — déploiement Docker sur VPS (Hostinger) avec nginx + certbot
#
# Architecture :
#   Internet ──► nginx de l’hôte :80/:443 (arstm.selys.app, TLS Let's Encrypt)
#                   └─► proxy ──► 127.0.0.1:$(PORT) ──► conteneur arstm-web :8080
#                                                    (nginx non root + build Angular)
#
# Premier déploiement (sur le serveur, dans le clone du dépôt) :
#   make server-deps                  # nginx, certbot, Docker (si absents)
#   make doctor                       # vérifie les prérequis, le port et le DNS
#   make setup EMAIL=vous@domaine     # vhost nginx → conteneur → certificat → HTTPS
#
# Au quotidien :
#   make build                        # construit l’image Docker
#   make up                           # démarre / met à jour le conteneur
#   make deploy                       # git pull + up + nettoyage + contrôle
#
# Port de l’hôte : 3440 par défaut, enregistré dans .env via « make set-port PORT=… »
# Les autres variables sont surchargeables : make deploy BRANCH=dev
# =============================================================================

# ---- Paramètres ------------------------------------------------------------
# Le port de l’hôte est lu dans .env (partagé avec docker compose) : make set-port PORT=…
-include .env
DOMAIN          ?= arstm.selys.app
PORT            ?= 3440
EMAIL           ?=
BRANCH          ?= main
ACME_ROOT       ?= /var/www/certbot

NGINX_DIR       ?= /etc/nginx
NGINX_AVAILABLE ?= $(NGINX_DIR)/sites-available
NGINX_ENABLED   ?= $(NGINX_DIR)/sites-enabled
TPL_DIR         := deploy/nginx
BUILD_TMP       := .deploy-tmp

# Lancer « make deploy » sur le serveur depuis votre poste : make remote-deploy SSH=user@ip
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
             -e 's|__ACME_ROOT__|$(ACME_ROOT)|g'

.DEFAULT_GOAL := help
.PHONY: help doctor check-dns server-deps set-port free-port check-port \
        build up down restart logs ps wait prune \
        nginx-init nginx-ssl nginx-test nginx-reload nginx-logs nginx-remove \
        certbot certbot-renew-test setup deploy status remote-deploy

# ---- Aide ------------------------------------------------------------------
help: ## Affiche cette aide
	@echo "ARSTM demo — déploiement Docker sur $(DOMAIN) (conteneur : 127.0.0.1:$(PORT))"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Premier déploiement : make setup EMAIL=vous@domaine"
	@echo "Mise à jour         : make deploy"

# ---- Serveur ---------------------------------------------------------------
server-deps: ## Installe nginx, certbot, Docker Engine et Compose v2 (Ubuntu/Debian)
	$(SUDO) apt-get update
	$(SUDO) apt-get install -y nginx certbot curl docker.io docker-compose-v2
	$(SUDO) systemctl enable --now docker nginx
	@echo "✓ Dépendances installées. Docker sans sudo : sudo usermod -aG docker $$USER (puis reconnectez-vous)."

doctor: ## Vérifie les prérequis (nginx, certbot, Docker, port, DNS)
	@printf "nginx    : "; (nginx -v 2>&1 || echo "ABSENT → make server-deps")
	@printf "certbot  : "; (certbot --version 2>&1 || echo "ABSENT → make server-deps")
	@printf "docker   : "; (docker --version 2>/dev/null || echo "ABSENT → make server-deps")
	@printf "compose  : "; ($(COMPOSE) version 2>/dev/null || echo "ABSENT → make server-deps")
	@printf "port $(PORT): "; \
	  if command -v ss >/dev/null && ss -ltn 2>/dev/null | grep -q ":$(PORT) "; then \
	    echo "déjà en écoute (normal si le conteneur tourne, sinon conflit)"; \
	  else echo "libre"; fi
	@$(MAKE) --no-print-directory check-dns

check-dns: ## Vérifie que le domaine pointe vers ce serveur
	@printf "DNS $(DOMAIN) : "; \
	  ip_dns=$$(getent hosts $(DOMAIN) | awk '{print $$1}' | head -1); \
	  ip_srv=$$(curl -s -4 --max-time 5 https://api.ipify.org || echo "?"); \
	  echo "$${ip_dns:-non résolu} (IP publique du serveur : $$ip_srv)"; \
	  if [ -n "$$ip_dns" ] && [ "$$ip_dns" != "$$ip_srv" ]; then \
	    echo "  ⚠ le domaine ne pointe pas vers ce serveur : certbot échouera."; fi

# ---- Port ------------------------------------------------------------------
set-port: ## Enregistre le port de l’hôte dans .env (ex. make set-port PORT=3450)
	@echo "PORT=$(PORT)" > .env
	@echo "✓ Port $(PORT) enregistré dans .env (docker compose + vhost nginx)."
	@echo "  Si le site est déjà en ligne : make up && make nginx-init"

free-port: ## Trouve un port libre à partir de 3440
	@p=3440; \
	while ss -ltnH "sport = :$$p" 2>/dev/null | grep -q .; do p=$$((p+1)); done; \
	echo "Port libre : $$p   →   make set-port PORT=$$p"

check-port: ## Vérifie que le port de l’hôte est libre (ou déjà pris par ce conteneur)
	@if command -v ss >/dev/null && ss -ltnH "sport = :$(PORT)" 2>/dev/null | grep -q . \
	  && ! $(DOCKER_SUDO) docker port $(CONTAINER) 2>/dev/null | grep -q ":$(PORT)$$"; then \
	  echo "✗ Le port $(PORT) est déjà utilisé par un autre service :"; \
	  $(SUDO) ss -ltnp "sport = :$(PORT)" 2>/dev/null | tail -n +2; \
	  $(MAKE) --no-print-directory free-port; exit 1; \
	fi

# ---- Docker ----------------------------------------------------------------
build: ## Construit l’image Docker (build Angular inclus)
	$(COMPOSE) build

up: check-port ## Démarre ou met à jour le conteneur sur 127.0.0.1:$(PORT) et attend qu’il réponde
	PORT=$(PORT) $(COMPOSE) up -d --build --remove-orphans
	@$(MAKE) --no-print-directory wait

wait: ## Attend que le conteneur soit « healthy »
	@printf "Attente du conteneur $(CONTAINER)"; i=0; st=""; \
	while [ $$i -lt $(HEALTH_TIMEOUT) ]; do \
	  st=$$($(DOCKER_SUDO) docker inspect -f '{{.State.Health.Status}}' $(CONTAINER) 2>/dev/null); \
	  if [ "$$st" = "healthy" ]; then echo " ✓ healthy"; exit 0; fi; \
	  printf "."; sleep 2; i=$$((i+2)); \
	done; \
	echo " ✗ état : $${st:-inconnu}"; $(COMPOSE) logs --tail 30 web; exit 1

down: ## Arrête et retire le conteneur (l’image est conservée)
	$(COMPOSE) down

restart: ## Redémarre le conteneur
	$(COMPOSE) restart web
	@$(MAKE) --no-print-directory wait

logs: ## Suit les logs du conteneur (Ctrl+C pour quitter)
	$(COMPOSE) logs -f --tail 100 web

ps: ## État du conteneur
	$(COMPOSE) ps

prune: ## Supprime les anciennes images non utilisées
	$(DOCKER_SUDO) docker image prune -f

# ---- nginx de l’hôte (reverse proxy) ---------------------------------------
nginx-init: ## Installe le vhost public du domaine (HTTP, ou HTTPS si le certificat existe)
	@test -d $(NGINX_AVAILABLE) || (echo "$(NGINX_AVAILABLE) introuvable : nginx est-il installé ?" && exit 1)
	$(SUDO) mkdir -p $(ACME_ROOT)/.well-known/acme-challenge
	@# Ancien mode sans Docker : serveur interne de l’hôte, désormais inutile
	@if [ -e $(NGINX_ENABLED)/arstm-app.conf ]; then \
	  echo "Désactivation de l’ancien serveur interne (arstm-app.conf)"; \
	  $(SUDO) unlink $(NGINX_ENABLED)/arstm-app.conf; fi
	@mkdir -p $(BUILD_TMP)
	@if [ -f /etc/letsencrypt/live/$(DOMAIN)/fullchain.pem ]; then \
	  echo "Certificat déjà présent : installation du vhost HTTPS"; \
	  $(RENDER) $(TPL_DIR)/arstm.selys.app.conf > $(BUILD_TMP)/$(DOMAIN).conf; \
	else \
	  $(RENDER) $(TPL_DIR)/arstm.selys.app.http.conf > $(BUILD_TMP)/$(DOMAIN).conf; \
	fi
	$(SUDO) install -m 644 $(BUILD_TMP)/$(DOMAIN).conf $(NGINX_AVAILABLE)/$(DOMAIN).conf
	$(SUDO) ln -sf $(NGINX_AVAILABLE)/$(DOMAIN).conf $(NGINX_ENABLED)/$(DOMAIN).conf
	@rm -rf $(BUILD_TMP)
	@$(MAKE) --no-print-directory nginx-test nginx-reload
	@echo "✓ nginx : $(DOMAIN) → conteneur 127.0.0.1:$(PORT)"

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

nginx-logs: ## Affiche les dernières erreurs nginx du domaine
	$(SUDO) tail -n 50 /var/log/nginx/$(DOMAIN).error.log 2>/dev/null || true

nginx-remove: ## Retire le vhost du domaine (conteneur et certificat conservés)
	$(SUDO) rm -f $(NGINX_ENABLED)/$(DOMAIN).conf $(NGINX_AVAILABLE)/$(DOMAIN).conf
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
	@$(MAKE) --no-print-directory up
	@$(MAKE) --no-print-directory certbot EMAIL=$(EMAIL)
	@$(MAKE) --no-print-directory status

deploy: ## Mise à jour : git pull + reconstruction + redémarrage + nettoyage
	git fetch origin $(BRANCH)
	git checkout $(BRANCH)
	git pull --ff-only origin $(BRANCH)
	@$(MAKE) --no-print-directory up
	@$(MAKE) --no-print-directory prune
	@$(MAKE) --no-print-directory status

status: ## Teste le conteneur, le HTTP et le HTTPS public
	@printf "conteneur http://127.0.0.1:$(PORT)/healthz → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 http://127.0.0.1:$(PORT)/healthz || echo "injoignable"
	@printf "SPA       http://127.0.0.1:$(PORT)/admin   → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 http://127.0.0.1:$(PORT)/admin || echo "injoignable"
	@printf "public    http://$(DOMAIN)/          → "; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" --max-time 8 http://$(DOMAIN)/ || echo "injoignable"
	@printf "public    https://$(DOMAIN)/         → "; curl -s -o /dev/null -w "%{http_code}\n" --max-time 8 https://$(DOMAIN)/ || echo "pas encore de HTTPS"

# ---- Depuis votre poste ----------------------------------------------------
remote-deploy: ## Lance « make deploy » sur le serveur via SSH (SSH=user@ip)
	@test -n "$(SSH)" || (echo "Précisez la cible : make remote-deploy SSH=user@ip" && exit 1)
	ssh -t $(SSH) "cd $(REMOTE_DIR) && make deploy BRANCH=$(BRANCH)"
