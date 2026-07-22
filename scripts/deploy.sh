#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/meu-caminho}"
WEB_ROOT="${WEB_ROOT:-/var/www/meucaminhoapp.com.br}"
BRANCH="${BRANCH:-main}"
SERVICE_USER="${SERVICE_USER:-www-data}"

cd "$APP_DIR"

echo "==> Fetching latest code"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f .env.production ]; then
  echo "Missing $APP_DIR/.env.production"
  echo "Create it from .env.production.example with production Supabase values."
  exit 1
fi

echo "==> Installing dependencies"
npm ci

echo "==> Building frontend"
npm run build

echo "==> Publishing dist to $WEB_ROOT"
mkdir -p "$WEB_ROOT"
rsync -a --delete dist/ "$WEB_ROOT"/
chown -R "$SERVICE_USER":"$SERVICE_USER" "$WEB_ROOT"

echo "==> Reloading nginx"
nginx -t
systemctl reload nginx

echo "Deploy complete."
