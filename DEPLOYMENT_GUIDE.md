# Guide de Déploiement InvexQR avec Docker

## Vue d'ensemble

Ce guide détaille le déploiement de l'application InvexQR en utilisant Docker Compose avec le réseau `invexapps_net`. L'architecture comprend :

- **Application InvexQR** : Interface React + Backend Express
- **PostgreSQL** : Base de données principale
- **Redis** : Cache et gestion des sessions
- **Nginx** : Reverse proxy avec SSL et rate limiting
- **Portainer** : Interface de gestion Docker (optionnel)
- **Watchtower** : Mises à jour automatiques (optionnel)

## Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+
- Nom de domaine configuré
- Certificats SSL

## Structure des fichiers

```
invexqr/
├── docker-compose.yml          # Configuration des services
├── Dockerfile                  # Image de l'application
├── nginx.conf                  # Configuration Nginx
├── .env                        # Variables d'environnement
├── .env.example               # Template de configuration
├── deploy.sh                  # Script de déploiement
├── init.sql                   # Initialisation de la base
└── ssl/                       # Certificats SSL
    ├── cert.pem
    └── key.pem
```

## Configuration

### 1. Variables d'environnement

Copiez et configurez le fichier d'environnement :

```bash
cp .env.example .env
nano .env
```

Variables essentielles à configurer :

```env
# Base de données
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# Redis
REDIS_PASSWORD=votre_mot_de_passe_redis

# Application
SESSION_SECRET=cle_session_tres_longue_et_aleatoire

# Replit Auth
REPL_ID=votre_replit_app_id
REPLIT_DOMAINS=votre-domaine.com,www.votre-domaine.com

# Firebase
VITE_FIREBASE_API_KEY=votre_cle_firebase
VITE_FIREBASE_PROJECT_ID=votre_projet_firebase
VITE_FIREBASE_APP_ID=votre_app_firebase

# PayPal
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_secret_paypal

# Email
SMTP_USER=votre_email@domaine.com
SMTP_PASS=votre_mot_de_passe_email
```

### 2. Certificats SSL

Placez vos certificats SSL dans le dossier `ssl/` :

```bash
mkdir -p ssl
# Copiez vos certificats
cp votre-certificat.pem ssl/cert.pem
cp votre-cle-privee.pem ssl/key.pem
```

### 3. Configuration Nginx

Modifiez `nginx.conf` pour votre domaine :

```nginx
server_name votre-domaine.com www.votre-domaine.com;
```

## Déploiement

### Méthode automatique (recommandée)

Utilisez le script de déploiement interactif :

```bash
chmod +x deploy.sh
./deploy.sh
```

Options disponibles :
1. **Déployer** : Installation complète
2. **Redémarrer** : Redémarrage des services
3. **Mettre à jour** : Mise à jour avec sauvegarde
4. **Sauvegarder** : Sauvegarde de la base de données
5. **Logs** : Affichage des logs en temps réel
6. **Santé** : Vérification des services
7. **Nettoyer** : Nettoyage du système Docker

### Méthode manuelle

#### 1. Créer le réseau

```bash
docker network create invexapps_net --driver bridge --subnet=172.20.0.0/16
```

#### 2. Démarrer les services

```bash
# Construire et démarrer
docker-compose up -d --build

# Vérifier le statut
docker-compose ps
```

#### 3. Vérifier les services

```bash
# Logs de l'application
docker-compose logs -f invexqr

# Santé de PostgreSQL
docker-compose exec postgres pg_isready -U invexqr_user -d invexqr

# Test Redis
docker-compose exec redis redis-cli ping
```

## Services et Ports

| Service | Port interne | Port externe | Description |
|---------|-------------|-------------|-------------|
| InvexQR | 5000 | 3000 | Application principale |
| PostgreSQL | 5432 | 5432 | Base de données |
| Redis | 6379 | 6379 | Cache et sessions |
| Nginx | 80, 443 | 80, 443 | Reverse proxy |
| Portainer | 9000 | 9000 | Gestion Docker |

## Gestion des données

### Volumes persistants

- `postgres_data` : Données PostgreSQL
- `redis_data` : Données Redis
- `nginx_logs` : Logs Nginx
- `portainer_data` : Configuration Portainer

### Sauvegarde

```bash
# Sauvegarde automatique
./deploy.sh backup

# Sauvegarde manuelle
docker-compose exec postgres pg_dump -U invexqr_user invexqr > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
# Restaurer depuis une sauvegarde
cat backup_file.sql | docker-compose exec -T postgres psql -U invexqr_user -d invexqr
```

## Monitoring et Maintenance

### Health Checks

L'application inclut des vérifications de santé automatiques :

- **Application** : `http://localhost:3000/api/health`
- **PostgreSQL** : `pg_isready`
- **Redis** : `redis-cli ping`
- **Nginx** : `wget /health`

### Logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f invexqr

# Logs Nginx
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

### Mise à jour

```bash
# Mise à jour avec sauvegarde automatique
./deploy.sh update

# Mise à jour manuelle
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Sécurité

### Configuration SSL

Le fichier `nginx.conf` inclut :
- Redirection HTTP vers HTTPS
- Protocoles TLS 1.2 et 1.3
- Ciphers sécurisés
- Headers de sécurité

### Rate Limiting

- API générale : 10 req/s
- Authentification : 5 req/min
- Burst autorisé : 20 requêtes

### Headers de sécurité

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## Dépannage

### Problèmes courants

**Service ne démarre pas :**
```bash
# Vérifier les logs
docker-compose logs service_name

# Redémarrer un service
docker-compose restart service_name
```

**Base de données inaccessible :**
```bash
# Vérifier PostgreSQL
docker-compose exec postgres pg_isready -U invexqr_user

# Recréer la base si nécessaire
docker-compose down
docker volume rm invexqr_postgres_data
docker-compose up -d
```

**Problème de permissions :**
```bash
# Vérifier l'utilisateur dans le conteneur
docker-compose exec invexqr whoami

# Corriger les permissions des logs
sudo chown -R 1001:1001 logs/
```

### Commandes utiles

```bash
# Statut des services
docker-compose ps

# Utilisation des ressources
docker stats

# Nettoyage complet
docker-compose down -v
docker system prune -a

# Rebuild complet
docker-compose down
docker-compose build --no-cache --pull
docker-compose up -d
```

## Performance

### Optimisations incluses

- **Compression gzip** dans Nginx
- **Cache des fichiers statiques**
- **Connection pooling** PostgreSQL
- **Persistent connections** Redis
- **Multi-stage builds** Docker

### Monitoring recommandé

Ajoutez ces outils pour un monitoring avancé :
- Prometheus + Grafana
- ELK Stack pour les logs
- Uptime monitoring externe

## Support

Pour toute assistance technique :
1. Consultez les logs détaillés
2. Vérifiez la configuration des variables d'environnement
3. Testez la connectivité réseau entre services
4. Contactez l'équipe de support avec les logs pertinents