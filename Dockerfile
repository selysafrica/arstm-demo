# syntax=docker/dockerfile:1.7
# =============================================================================
# ARSTM demo — image de production
#   1. build  : Node 22 compile l’application Angular
#   2. runtime: nginx non root sert le build sur le port 3439
# =============================================================================

# ---- 1. Build -------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Dépendances d’abord, pour profiter du cache Docker
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
RUN npx ng build --configuration production \
 && test -f dist/arstm-demo/browser/index.html

# ---- 2. Runtime -----------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="arstm-demo" \
      org.opencontainers.image.description="Démo du site de l’ARSTM (Angular + Tailwind)" \
      org.opencontainers.image.source="https://github.com/selysafrica/arstm-demo"

COPY deploy/nginx/arstm-docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist/arstm-demo/browser /usr/share/nginx/html

EXPOSE 3439
USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3439/healthz || exit 1
