#!/bin/bash

# Script de build optimisé pour InvexQR
set -e

echo "🚀 Building InvexQR Application..."

# Nettoyer les builds précédents
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/

# Installer les dépendances
echo "📦 Installing dependencies..."
npm ci

# Vérifier la syntaxe TypeScript
echo "🔍 Type checking..."
npx tsc --noEmit

# Build du frontend
echo "🎨 Building frontend..."
npm run build

# Créer le dossier dist s'il n'existe pas
mkdir -p dist

echo "✅ Build completed successfully!"

# Afficher la taille des fichiers
echo "📊 Build sizes:"
du -sh dist/ 2>/dev/null || echo "No dist folder found"