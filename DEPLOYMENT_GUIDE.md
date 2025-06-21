# Guide de Déploiement InvexQR avec Docker & Portainer

## Problème Résolu
L'erreur "cannot create subdirectories in nginx.conf: not a directory" a été corrigée en supprimant la dépendance nginx et en simplifiant la configuration Docker.

## Étapes de Déploiement

### 1. Préparation des Fichiers
Assurez-vous d'avoir ces fichiers dans votre répertoire :
- `docker-compose.simple.yml` (configuration simplifiée)
- `Dockerfile` (corrigé)
- Tous les fichiers source de l'application

### 2. Configuration via Portainer

#### Option A: Stack Portainer (Recommandée)
1. Connectez-vous à Portainer
2. Allez dans "Stacks" > "Add stack"
3. Nom: `invexqr-production`
4. Copiez le contenu de `docker-compose.simple.yml`
5. Modifiez les variables d'environnement :
   ```yaml
   - SMTP_PASS=votre_mot_de_passe_email
   - VITE_FIREBASE_API_KEY=votre_clé_firebase
   - VITE_FIREBASE_PROJECT_ID=votre_projet_firebase
   - VITE_FIREBASE_APP_ID=votre_app_firebase
   - REPL_ID=votre_replit_id
   ```

#### Option B: Ligne de Commande
```bash
# Sur votre serveur VPS
cd /chemin/vers/votre/projet
docker-compose -f docker-compose.simple.yml up -d
```

### 3. Vérification du Déploiement
1. Accédez à `http://207.180.239.163:3001`
2. Vérifiez les statistiques en temps réel sur la page d'accueil
3. Testez la création de QR codes (nécessite l'authentification)

### 4. Configuration Post-Déploiement

#### Base de Données
La base PostgreSQL sera automatiquement initialisée avec les tables nécessaires.

#### Monitoring
- Health check automatique sur `/api/public/stats`
- Logs disponibles via `docker logs invexqr-app`

### 5. Dépannage

#### Si l'application ne démarre pas :
```bash
docker logs invexqr-app
docker logs invexqr-db
```

#### Si la base de données ne se connecte pas :
Vérifiez que le container PostgreSQL est en cours d'exécution :
```bash
docker ps | grep invexqr-db
```

#### Redémarrage des services :
```bash
docker-compose -f docker-compose.simple.yml restart
```

## URLs d'Accès
- Application principale : http://207.180.239.163:3001
- API de statistiques : http://207.180.239.163:3001/api/public/stats
- Base de données : localhost:5432 (depuis le serveur)

## Sécurité
- Changez les mots de passe par défaut en production
- Configurez SSL/HTTPS avec un reverse proxy si nécessaire
- Limitez l'accès à la base de données aux containers Docker

## Support
En cas de problème persistant, vérifiez :
1. Les ports 3001 et 5432 sont disponibles
2. Docker et Docker Compose sont installés
3. L'espace disque suffisant (minimum 2GB libre)