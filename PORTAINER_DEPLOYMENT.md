# Déploiement InvexQR via Portainer - Solution Complète

## Problèmes Résolus
1. ✅ Erreur "address already in use" sur le port 80 corrigée
2. ✅ Erreur "Cannot find package 'vite'" en production corrigée
3. ✅ Configuration Docker optimisée pour Portainer

## Étapes de Déploiement

### 1. Arrêter les Stacks Existantes (Si Applicable)
Dans Portainer, arrêtez et supprimez toute stack InvexQR existante pour éviter les conflits.

### 2. Créer une Nouvelle Stack

1. **Accédez à Portainer** → Stacks → Add stack
2. **Nom de la stack** : `invexqr-production-v2`
3. **Méthode** : Web editor
4. **Copiez cette configuration** :

```yaml
version: '3.8'

services:
  invexqr-app:
    build: .
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
      start_period: 40s

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

### 3. Configuration des Variables d'Environnement

Modifiez ces valeurs dans la configuration avant le déploiement :

- `REPL_ID=` → Votre ID Replit Auth
- `SMTP_PASS=` → Mot de passe email Infomaniak
- `VITE_FIREBASE_API_KEY=` → Clé API Firebase
- `VITE_FIREBASE_PROJECT_ID=` → ID projet Firebase
- `VITE_FIREBASE_APP_ID=` → ID application Firebase

### 4. Déployer la Stack

1. Cliquez sur **Deploy the stack**
2. Attendez que les containers se lancent (2-3 minutes)
3. Vérifiez les logs si nécessaire

### 5. Vérification

- **URL d'accès** : http://207.180.239.163:3001
- **API de statistiques** : http://207.180.239.163:3001/api/public/stats
- **Status containers** : Portainer → Containers

### 6. Vérification des Ports Utilisés

Si vous avez encore des conflits, vérifiez les ports utilisés :

```bash
# Sur votre serveur VPS
netstat -tulpn | grep :80
netstat -tulpn | grep :3001
```

### 7. Alternative avec Port Personnalisé

Si le port 3001 est aussi occupé, utilisez un port différent :

```yaml
ports:
  - "8080:3001"  # Utilise le port 8080 à la place
```

Puis accédez via : http://207.180.239.163:8080

## Support Technique

**Erreurs communes** :
- Port occupé → Changer le port externe
- Container qui redémarre → Vérifier les logs
- Base de données inaccessible → Attendre l'initialisation (2-3 min)

**Commandes utiles** :
```bash
# Voir les logs de l'application
docker logs invexqr-app

# Voir les logs de la base
docker logs invexqr-db

# Redémarrer la stack
docker-compose restart
```