#!/bin/bash
set -e

# Cachear configuración, rutas y vistas en primera ejecución
if [ ! -f /var/www/bootstrap/cache/config.php ]; then
    echo "Generating Laravel caches (config, routes, views)..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Ejecutar PHP-FPM
exec php-fpm
