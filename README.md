# InvexQR - Générateur de QR Codes Dynamiques

Solution professionnelle pour créer, personnaliser et suivre vos QR codes avec analytics en temps réel. Plateforme multi-utilisateurs idéale pour les entreprises, commerces, institutions et créateurs en Afrique et à l'international.

## 🚀 Fonctionnalités

- **QR Codes Dynamiques** : Modifiez les destinations sans régénérer le code
- **Analytics en Temps Réel** : Statistiques détaillées de scans par pays, appareil, navigateur
- **Types de Contenu** : URL, Texte, Email, Téléphone, SMS, WiFi
- **Personnalisation Avancée** : Couleurs, styles, marges
- **Génération Publique** : Créez des QR codes sans inscription
- **Plateforme Multi-utilisateurs** : Comptes individuels avec authentification sécurisée
- **Exportation** : Téléchargement en PNG, SVG
- **Interface Responsive** : Optimisée mobile et desktop

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, Tailwind CSS, Vite
- **Backend** : Node.js, Express, TypeScript
- **Base de Données** : PostgreSQL avec Drizzle ORM
- **Authentification** : Replit Auth + Firebase Auth
- **Analytics** : Recharts pour visualisations
- **Email** : Infomaniak SMTP (contact@invexqr.com)
- **Déploiement** : Docker, Nginx, Docker Compose

## 📦 Installation avec Docker

### Prérequis
- Docker et Docker Compose
- Certificats SSL (optionnel pour HTTPS)

### Déploiement Rapide

1. **Cloner le projet**
```bash
git clone <repository-url>
cd invexqr
```

2. **Configuration environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

3. **Lancer le déploiement**
```bash
chmod +x deploy.sh
./deploy.sh production
```

### Configuration Manuelle

1. **Variables d'environnement (.env)**
```env
# Base de données
DATABASE_URL=postgresql://invexqr:password@postgres:5432/invexqr
POSTGRES_DB=invexqr
POSTGRES_USER=invexqr
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# Application
NODE_ENV=production
PORT=3001
SESSION_SECRET=votre_secret_session_securise

# Authentification Replit
REPL_ID=votre_replit_app_id
REPLIT_DOMAINS=207.180.239.163:3001,invexqr.com

# Email Infomaniak
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_USER=contact@invexqr.com
SMTP_PASS=votre_mot_de_passe_email
EMAIL_FROM=contact@invexqr.com

# Firebase (optionnel)
VITE_FIREBASE_API_KEY=votre_firebase_api_key
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_APP_ID=votre_app_id
```

2. **Démarrer les services**
```bash
docker-compose up -d
```

## 🌐 Accès à l'Application

- **URL Locale** : http://localhost:3001
- **URL Serveur** : http://207.180.239.163:3001
- **Domaine** : https://invexqr.com (avec SSL)

## 🔧 Scripts de Développement

```bash
# Développement local
npm run dev

# Build production
npm run build

# Tests
npm run test

# Migration base de données
npm run db:push
```

## 📊 Monitoring et Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f app

# Status des services
docker-compose ps

# Redémarrer l'application
docker-compose restart app
```

## 🔒 Sécurité

- Headers de sécurité configurés (HSTS, X-Frame-Options, etc.)
- Rate limiting sur les endpoints API
- Sessions sécurisées avec PostgreSQL
- Validation des données avec Zod
- Authentification multi-providers

## 📈 Analytics et Tracking

- Google Tag Manager intégré (GTM-M8ZG3CNR)
- Suivi des scans par géolocalisation
- Analytics par appareil et navigateur
- Métriques temps réel dans le dashboard

## 📧 Configuration Email

L'application utilise Infomaniak comme serveur SMTP :
- **Serveur** : mail.infomaniak.com
- **Port** : 587 (STARTTLS)
- **Adresse** : contact@invexqr.com

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de connexion base de données**
   - Vérifiez DATABASE_URL dans .env
   - Assurez-vous que PostgreSQL est démarré

2. **Application inaccessible**
   - Vérifiez que le port 3001 est ouvert
   - Consultez les logs : `docker-compose logs app`

3. **Problèmes d'authentification**
   - Vérifiez REPL_ID et REPLIT_DOMAINS
   - Configurez les domaines autorisés dans Replit Auth

### Health Check
```bash
curl http://localhost:3001/health
```

## 🤝 Support

Pour toute assistance :
- **Email** : contact@invexqr.com
- **Documentation** : Consultez ce README
- **Logs** : `docker-compose logs -f`

## 📄 Licence

Propriétaire - InvexQR Platform