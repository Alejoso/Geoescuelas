#!/usr/bin/env bash
set -e

cd /var/www

# Generar APP_KEY si todavía no existe
if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
    echo "[backend] Generando APP_KEY..."
    php artisan key:generate --force
fi

# Reconstruir el package manifest (lo saltamos en build con --no-scripts)
php artisan package:discover --ansi || true

# Sin config:cache: dejamos que env() lea las variables en vivo
php artisan config:clear || true
php artisan route:clear  || true
php artisan view:clear   || true

# Permisos por las dudas (el volumen puede traer otros uids)
chown -R www-data:www-data storage bootstrap/cache || true

echo "[backend] Arrancando PHP-FPM..."
exec php-fpm -F
