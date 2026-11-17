# Déploiement Docker sur arstm.selys.app (VPS Hostinger, nginx + certbot)

## Architecture

```
Internet ──► nginx de l’hôte :80 / :443   arstm.selys.app   (certbot, TLS, en-têtes de sécurité)
                └─ proxy_pass ──► 127.0.0.1:3439 ──► conteneur arstm-web (nginx non root + build Angular)
```

- L’application est construite **dans Docker** : Node.js n’est pas nécessaire sur le serveur.
- Le port **3439** n’est publié que sur `127.0.0.1` : il n’est pas exposé sur Internet et n’a pas besoin d’être ouvert dans le pare-feu.
- Seuls **80** et **443** doivent être ouverts (certbot a besoin du port 80).

| Fichier | Rôle |
|---|---|
| `../Dockerfile` | Build multi-étapes : Node 22 compile Angular, puis `nginx-unprivileged` sert le résultat sur le port 3439 (image ~80 Mo) |
| `../docker-compose.yml` | Service `web` publié uniquement sur `127.0.0.1:3439`, redémarrage automatique, healthcheck, système de fichiers en lecture seule, aucune capability, logs limités à 3 × 10 Mo |
| `nginx/arstm-docker.conf` | nginx du conteneur : fallback SPA (`/admin`, `/espace`…), cache long des fichiers hachés, `index.html` jamais en cache, gzip, `/healthz` |
| `nginx/arstm.selys.app.http.conf` | Vhost public de l’hôte, phase 1 : HTTP + challenge ACME, avant le certificat |
| `nginx/arstm.selys.app.conf` | Vhost public de l’hôte, phase 2 : redirection HTTP → HTTPS, TLS, HTTP/2, HSTS |

Les gabarits du vhost contiennent `__DOMAIN__`, `__PORT__` et `__ACME_ROOT__`, remplacés par le `Makefile`.

## Prérequis

1. Un enregistrement DNS **A** `arstm.selys.app` → IP publique du VPS.
2. Ports 80 et 443 ouverts (pare-feu Hostinger et `ufw` si actif : `sudo ufw allow 'Nginx Full'`).
3. Sur le serveur : `git` et `make` (nginx, certbot et Docker sont installés par `make server-deps`).

## Premier déploiement (sur le VPS)

```bash
git clone https://github.com/selysafrica/arstm-demo.git /var/www/arstm-demo
cd /var/www/arstm-demo
make server-deps                 # nginx, certbot, Docker Engine + Compose v2
make doctor                      # versions, port 3439, DNS
make setup EMAIL=vous@domaine    # vhost → conteneur → certificat → HTTPS
```

`make setup` enchaîne :

1. `nginx-init` : installe le vhost public de l’hôte (HTTP, ou HTTPS si un certificat existe déjà), `nginx -t`, reload ;
2. `up` : construit l’image, démarre le conteneur et attend qu’il soit `healthy` ;
3. `certbot` puis `nginx-ssl` : certificat Let’s Encrypt (méthode webroot, sans coupure) et vhost HTTPS ;
4. `status` : contrôle du conteneur, du HTTP et du HTTPS.

## Mises à jour

```bash
cd /var/www/arstm-demo && make deploy    # git pull → reconstruction → redémarrage → nettoyage des anciennes images
```

Depuis votre poste : `make remote-deploy SSH=user@ip-du-vps` lance `make deploy` sur le serveur.

## Commandes

| Commande | Effet |
|---|---|
| `make help` | Liste toutes les cibles |
| `make build` | Construit l’image Docker |
| `make up` | Construit si besoin, démarre ou met à jour le conteneur et attend qu’il soit `healthy` |
| `make down` | Arrête le conteneur (l’image est conservée) |
| `make restart` | Redémarre le conteneur |
| `make logs` | Logs du conteneur en continu |
| `make ps` | État du conteneur |
| `make prune` | Supprime les images obsolètes |
| `make status` | Codes HTTP du conteneur, du HTTP et du HTTPS public |
| `make nginx-logs` | Dernières erreurs nginx du domaine |
| `make nginx-test` / `make nginx-reload` | Vérifier / recharger le nginx de l’hôte |
| `make certbot-renew-test` | Simuler le renouvellement du certificat |
| `make nginx-remove` | Retirer le vhost du domaine (conteneur et certificat conservés) |

Variables surchargeables : `DOMAIN`, `PORT`, `EMAIL`, `BRANCH`, `ACME_ROOT`, `NGINX_AVAILABLE`, `NGINX_ENABLED`, `SSH`, `REMOTE_DIR`,
et pour Docker Compose `IMAGE_TAG` (tag de l’image, `latest` par défaut). Exemple : `make deploy BRANCH=dev`.

## En local

```bash
make build && make up    # puis http://127.0.0.1:3439
make down
```

## Renouvellement du certificat

Le paquet `certbot` installe un timer systemd qui renouvelle automatiquement. Le certificat est obtenu avec
`--deploy-hook "systemctl reload nginx"` : nginx recharge le nouveau certificat après chaque renouvellement.
Le vhost HTTPS garde `/.well-known/acme-challenge/` accessible en HTTP pour que ce renouvellement fonctionne.
