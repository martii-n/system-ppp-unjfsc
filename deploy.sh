#!/bin/bash

echo "🚀 Iniciando proceso de actualización del sistema..."

echo "📥 Trayendo cambios desde GitHub..."
git pull origin production

echo "📦 Reconstruyendo contenedor de la aplicación..."
docker compose --profile prod build app-prod

echo "🔄 Reiniciando servicios de producción..."
docker compose --profile prod up -d --remove-orphans

echo "🗄️ Ejecutando migraciones pendientes..."
docker exec -it app-prod php artisan migrate --force

echo "⚡ Optimizando cachés de Laravel..."
docker exec -it app-prod php artisan config:cache
docker exec -it app-prod php artisan route:cache
docker exec -it app-prod php artisan view:cache

echo "🔒 Asegurando permisos del storage compartido..."
docker exec -it app-prod chown -R www-data:www-data /var/www/storage

echo "✅ ¡Sistema actualizado con éxito en producción!"
