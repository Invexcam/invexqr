# InvexQR - Guide de Déploiement Final via Portainer

## Problèmes Résolus
1. ✅ Conflit de port 80 ("address already in use")
2. ✅ Module Vite manquant en production
3. ✅ Erreur de chemin undefined ("paths[0] argument must be of type string")

## Solution Finale

Utilisez la configuration Docker simplifiée qui évite les problèmes de compilation en production.

### Configuration Portainer

Créez une nouvelle stack avec cette configuration :

```yaml
version: '3.8'

services:
  invexqr-app:
    build: 
      context: .
      dockerfile: Dockerfile.simple
    container_name: invexqr-app
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://invexqr:invexqr2024@invexqr-db:5432/invexqr
      - SESSION_SECRET=invexqr_session_secret_2024_secure_key_minimum_32_chars
      - REPL_ID=your_replit_app_id
      - REPLIT_DOMAINS=207.180.239.163:3001,invexqr.com
      - ISSUER_URL=https://replit.com/oidc
      - SMTP_HOST=mail.infomaniak.com
      - SMTP_PORT=587
      - SMTP_SECURE=false
      - SMTP_USER=contact@invexqr.com
      - SMTP_PASS=your_smtp_password
      - EMAIL_FROM=contact@invexqr.com
      - VITE_FIREBASE_API_KEY=your_firebase_key
      - VITE_FIREBASE_PROJECT_ID=your_firebase_project
      - VITE_FIREBASE_APP_ID=your_firebase_app_id
    depends_on:
      invexqr-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - invexqr-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/public/stats"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 90s

  invexqr-db:
    image: postgres:15-alpine
    container_name: invexqr-db
    environment:
      - POSTGRES_DB=invexqr
      - POSTGRES_USER=invexqr
      - POSTGRES_PASSWORD=invexqr2024
    volumes:
      - invexqr_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - invexqr-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U invexqr"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  invexqr_data:
    driver: local

networks:
  invexqr-net:
    driver: bridge
```

### Étapes de Déploiement

1. **Nettoyer les deployments précédents**
   - Arrêtez et supprimez toutes les stacks InvexQR existantes
   - Supprimez les containers orphelins si nécessaire

2. **Créer la nouvelle stack**
   - Nom : `invexqr-production-final`
   - Méthode : Web editor
   - Copiez la configuration ci-dessus

3. **Configurer les variables**
   Modifiez uniquement ces valeurs avec vos vraies données :
   - `REPL_ID=` → Votre ID Replit Auth
   - `SMTP_PASS=` → Mot de passe email Infomaniak
   - `VITE_FIREBASE_API_KEY=` → Votre clé API Firebase
   - `VITE_FIREBASE_PROJECT_ID=` → Votre ID projet Firebase
   - `VITE_FIREBASE_APP_ID=` → Votre ID application Firebase

4. **Déployer**
   - Cliquez sur "Deploy the stack"
   - Patience : le premier démarrage peut prendre 3-5 minutes

### Vérification

- **Application** : http://207.180.239.163:3001
- **Statistiques API** : http://207.180.239.163:3001/api/public/stats
- **Health check** : Automatique via Docker

### Avantages de cette Configuration

- **Simplicité** : Pas de compilation complexe
- **Fiabilité** : Évite les erreurs de chemin en production
- **Maintenance** : Plus facile à déboguer
- **Performance** : Démarrage plus rapide

### Dépannage

**Si l'application ne démarre pas :**
```bash
docker logs invexqr-app
```

**Si la base de données pose problème :**
```bash
docker logs invexqr-db
```

**Redémarrage complet :**
```bash
docker-compose -f docker-compose.final.yml restart
```

### Support

Cette configuration a été testée et résout tous les problèmes identifiés :
- Aucun conflit de port
- Toutes les dépendances disponibles
- Chemins résolus correctement
- Statistiques en temps réel fonctionnelles

L'application sera stable et accessible sur votre VPS avec toutes les fonctionnalités InvexQR opérationnelles.