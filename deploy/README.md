# Déploiement sur arstm.selys.app (VPS Hostinger, nginx + certbot)

## Architecture

```
Internet ──► nginx :80 / :443   arstm.selys.app   (TLS Let’s Encrypt, en-têtes de sécurité)
                │
                └─ proxy_pass ──► nginx 127.0.0.1:3439   (build Angular statique, fallback SPA)
                                     └─ /var/www/arstm.selys.app
```

Le port **3439** n’écoute que sur `127.0.0.1` : il n’est pas exposé sur Internet et n’a pas besoin d’être ouvert dans le pare-feu.
Seuls **80** et **443** doivent être ouverts (certbot a besoin du port 80).

| Fichier | Rôle |
|---|---|
| `nginx/arstm-app.conf` | Serveur interne `127.0.0.1:3439` : sert le build, cache long des fichiers hachés, `index.html` jamais en cache, fallback SPA (`/admin`, `/espace`…) |
| `nginx/arstm.selys.app.http.conf` | Vhost public phase 1 : HTTP + challenge ACME, avant le certificat |
| `nginx/arstm.selys.app.conf` | Vhost public phase 2 : redirection HTTP → HTTPS, TLS, HTTP/2, HSTS |

Les gabarits contiennent `__DOMAIN__`, `__PORT__`, `__WEB_ROOT__`, `__ACME_ROOT__`, remplacés par le `Makefile`.

Deux modes au choix, avec le même vhost public et le même certificat :

- **Docker (recommandé)** : l’application tourne dans un conteneur, pas besoin de Node sur le serveur → [Déploiement avec Docker](#déploiement-avec-docker).
- **Sans Docker** : le build est copié dans `/var/www/arstm.selys.app` et servi par le nginx de l’hôte → sections suivantes.

## Déploiement avec Docker

```
Internet ──► nginx de l’hôte :80 / :443   arstm.selys.app   (certbot, TLS, en-têtes de sécurité)
                └─ proxy_pass ──► 127.0.0.1:3439 ──► conteneur arstm-web (nginx non root + build Angular)
```

| Fichier | Rôle |
|---|---|
| `../Dockerfile` | Build multi-étapes : Node 22 compile Angular, puis `nginx-unprivileged` sert le résultat sur le port 3439 (image ~80 Mo) |
| `../docker-compose.yml` | Service `web` publié **uniquement** sur `127.0.0.1:3439`, redémarrage automatique, healthcheck, système de fichiers en lecture seule, aucune capability, logs limités à 3 × 10 Mo |
| `nginx/arstm-docker.conf` | nginx du conteneur : fallback SPA, cache, gzip, `/healthz` |

Prérequis : DNS A `arstm.selys.app` → IP du VPS, ports 80/443 ouverts, `git`, `make`, nginx, certbot et Docker (Node.js inutile).

```bash
git clone https://github.com/selysafrica/arstm-demo.git /var/www/arstm-demo
cd /var/www/arstm-demo
make server-deps                         # nginx, certbot, rsync
make docker-install                      # Docker Engine + Compose v2
make doctor
make docker-setup EMAIL=vous@domaine     # vhost public → conteneur → certificat → HTTPS
```

`make docker-setup` enchaîne :

1. `nginx-proxy-init` : installe le vhost public de l’hôte (HTTP, ou HTTPS si un certificat existe déjà) et désactive `arstm-app.conf` s’il était actif, pour libérer le port 3439 ;
2. `docker-up` : construit l’image, démarre le conteneur et attend qu’il soit `healthy` ;
3. `certbot` puis `nginx-ssl` : certificat Let’s Encrypt et vhost HTTPS ;
4. `status` : contrôle interne, HTTP et HTTPS.

Mises à jour :

```bash
cd /var/www/arstm-demo && make docker-deploy   # git pull → reconstruction → redémarrage → nettoyage des anciennes images
```

| Commande | Effet |
|---|---|
| `make docker-ps` | État du conteneur (dont `healthy`) |
| `make docker-logs` | Logs nginx du conteneur en continu |
| `make docker-restart` | Redémarre le conteneur |
| `make docker-down` | Arrête le conteneur (l’image est conservée) |
| `make docker-build` | Reconstruit l’image sans la démarrer |
| `make docker-prune` | Supprime les images obsolètes |

Variables utiles : `PORT` (port publié sur 127.0.0.1, 3439 par défaut), `IMAGE_TAG` (tag de l’image, `latest` par défaut), `BRANCH`.

> Si vous passez du mode sans Docker au mode Docker, `make nginx-proxy-init` désactive le serveur interne de l’hôte ; le dossier `/var/www/arstm.selys.app` n’est plus utilisé et peut être supprimé à la main.

## Prérequis (mode sans Docker)

1. Un enregistrement DNS **A** `arstm.selys.app` → IP publique du VPS.
2. Ports 80 et 443 ouverts (pare-feu Hostinger et `ufw` si actif : `sudo ufw allow 'Nginx Full'`).
3. Sur le serveur : `git`, `make`, Node.js 22 LTS (pour le build).

## Premier déploiement sans Docker (sur le VPS)

```bash
git clone https://github.com/selysafrica/arstm-demo.git /var/www/arstm-demo
cd /var/www/arstm-demo
make server-deps                     # nginx, certbot, rsync (si absents)
make doctor                          # versions, port 3439, DNS
make setup EMAIL=vous@domaine        # nginx-init → build → publish → certbot → HTTPS
```

`make setup` enchaîne :

1. `nginx-init` : installe le serveur interne et le vhost HTTP, `nginx -t`, reload ;
2. `build` : `npm ci` puis build de production ;
3. `publish` : copie `dist/arstm-demo/browser/` dans `/var/www/arstm.selys.app` ;
4. `certbot` : certificat Let’s Encrypt (méthode webroot, aucune coupure de nginx) ;
5. `nginx-ssl` : installe le vhost HTTPS, `nginx -t`, reload ;
6. `status` : contrôle interne, HTTP et HTTPS.

## Mises à jour (mode sans Docker)

```bash
cd /var/www/arstm-demo && make deploy          # git pull + build + publish + reload
```

Depuis votre poste, sans Node sur le serveur :

```bash
make upload SSH=user@ip-du-vps                 # build local + rsync du build
make remote-deploy SSH=user@ip-du-vps          # lance « make deploy » sur le serveur
```

## Autres commandes utiles

| Commande | Effet |
|---|---|
| `make help` | Liste toutes les cibles |
| `make status` | Codes HTTP de l’app interne, du HTTP et du HTTPS |
| `make logs` | Dernières erreurs nginx du site |
| `make nginx-test` / `make nginx-reload` | Vérifier / recharger nginx |
| `make certbot-renew-test` | Simuler le renouvellement du certificat |
| `make nginx-remove` | Retirer les vhosts ARSTM (build et certificat conservés) |

Variables surchargeables : `DOMAIN`, `PORT`, `EMAIL`, `BRANCH`, `WEB_ROOT`, `ACME_ROOT`, `NGINX_AVAILABLE`, `NGINX_ENABLED`, `SSH`, `REMOTE_DIR`.
Exemple : `make deploy BRANCH=dev`.

## Renouvellement du certificat

Le paquet `certbot` installe un timer systemd qui renouvelle automatiquement. Le certificat est obtenu avec
`--deploy-hook "systemctl reload nginx"` : nginx recharge le nouveau certificat après chaque renouvellement.
Le vhost HTTPS garde `/.well-known/acme-challenge/` accessible en HTTP pour que ce renouvellement fonctionne.
