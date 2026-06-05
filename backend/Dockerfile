# =============================================================================
#  Backend Laravel — corre SOLO PHP-FPM (un proceso por contenedor).
#  Nginx vive en otro contenedor y le pega por la red a backend:9000.
# =============================================================================
FROM php:8.2-fpm-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Dependencias del sistema para compilar las extensiones de PHP
RUN apt-get update && apt-get install -y --no-install-recommends \
      libpq-dev \
      libonig-dev \
      libzip-dev \
      libpng-dev \
      libjpeg-dev \
      libfreetype6-dev \
      libicu-dev \
      unzip \
      git \
    && rm -rf /var/lib/apt/lists/*

# Extensiones que Laravel + PostgreSQL necesitan
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql pgsql mbstring bcmath gd zip intl pcntl exif

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Instalamos dependencias primero (capa cacheable)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --prefer-dist

# Resto del código
COPY . .

# Borra cualquier cache de paquetes stale que venga de tu máquina (con dev-deps)
# y regenera el descubrimiento SIN Pail, que vive en require-dev.
RUN rm -f bootstrap/cache/*.php \
    && php artisan package:discover --ansi

# .env mínimo (solo para que key:generate tenga dónde escribir el APP_KEY).
# Las variables de DB llegan por environment desde docker-compose.
RUN cp -n .env.example .env 2>/dev/null || touch .env \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint: prepara Laravel y arranca php-fpm
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]