#!/bin/bash

# Script de déploiement Docker optimisé pour InvexQR
set -e

echo "🚀 Déploiement Docker InvexQR"

# Vérifier si les variables d'environnement critiques sont définies
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL n'est pas défini"
    echo "Utilisation de la configuration par défaut..."
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down --remove-orphans

# Nettoyer les images orphelines
echo "🧹 Nettoyage des images orphelines..."
docker system prune -f

# Build et démarrage des services
echo "🔨 Construction et démarrage des services..."
docker-compose up -d --build

# Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 30

# Vérifier le statut des services
echo "📊 Vérification du statut des services..."
docker-compose ps

# Test de santé de l'application
echo "🏥 Test de santé de l'application..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application déployée avec succès!"
        echo "🌐 Application accessible sur: http://localhost:3000"
        exit 0
    else
        echo "Tentative $attempt/$max_attempts - En attente de l'application..."
        sleep 10
        ((attempt++))
    fi
done

echo "❌ Échec du déploiement - L'application ne répond pas"
echo "📋 Logs des conteneurs:"
docker-compose logs --tail=50
exit 1