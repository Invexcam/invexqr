# Système de Notifications InvexQR

## Vue d'ensemble

Le système de notifications InvexQR envoie automatiquement des emails pour toutes les actions utilisateur importantes et affiche des messages de bienvenue lors de la connexion.

## Fonctionnalités Implémentées

### 1. Message de Bienvenue à la Connexion
- Affichage automatique d'un toast de bienvenue lors de l'authentification
- Message personnalisé avec le prénom de l'utilisateur
- Durée d'affichage de 5 secondes
- Réinitialisation automatique lors de la déconnexion

### 2. Notifications Email Automatiques

#### A. Email de Bienvenue
- **Déclencheur** : Première connexion d'un nouvel utilisateur
- **Contenu** : Présentation d'InvexQR et de ses fonctionnalités
- **Inclut** : Guide de démarrage et lien vers le dashboard

#### B. Notifications de Création de QR Code
- **Déclencheur** : Création d'un nouveau QR Code
- **Contenu** : Détails du QR Code créé (nom, URL, date)
- **Double notification** : Email spécialisé + notification d'action générale

#### C. Notifications de Modification
- **Déclencheur** : Modification d'un QR Code existant
- **Contenu** : Confirmation de la modification avec détails

#### D. Notifications de Suppression
- **Déclencheur** : Suppression d'un QR Code
- **Contenu** : Confirmation de la suppression

#### E. Notifications de Scan en Temps Réel
- **Déclencheur** : Scan d'un QR Code par un utilisateur
- **Contenu** : Détails du scan (localisation, date/heure)
- **Filtrage** : Exclusion automatique des bots et crawlers

#### F. Notifications d'Actions Générales
- **Déclencheur** : Toute action importante sur le compte
- **Contenu** : Description de l'action et horodatage

## Architecture Technique

### Services Email
- **Service principal** : `emailService` dans `server/emailService.ts`
- **Configuration SMTP** : Infomaniak (mail.infomaniak.com:587)
- **Templates** : HTML + texte brut pour compatibilité maximale

### Méthodes Disponibles
```typescript
- sendWelcomeEmail(email, userName)
- sendQRCodeCreatedEmail(email, userName, qrName, qrUrl)
- sendQRCodeScannedEmail(email, userName, qrName, location)
- sendActionNotificationEmail(email, userName, action, details)
```

### Intégration dans les Routes
- **Création QR** : `/api/qr-codes` (POST)
- **Modification QR** : `/api/qr-codes/:id` (PUT)
- **Suppression QR** : `/api/qr-codes/:id` (DELETE)
- **Scan QR** : `/r/:code` (GET)
- **Authentification** : `/api/auth/user` (GET)

### Gestion des Erreurs
- Emails non bloquants : échec d'envoi n'interrompt pas les opérations
- Logs détaillés pour debugging
- Fallbacks gracieux en cas de problème SMTP

## Configuration Requise

### Variables d'Environnement
```bash
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@invexqr.com
SMTP_PASS=your_password
EMAIL_FROM=contact@invexqr.com
```

### Base de Données
- Table `users` avec champs email, firstName, lastName
- Table `qr_codes` pour les données des QR codes
- Table `qr_scans` pour le tracking des scans

## Sécurité et Performance

### Anti-Bot
- Détection automatique des bots via User-Agent
- Filtrage des scans non-humains
- Prévention du spam email

### Optimisation
- Emails asynchrones (non-bloquants)
- Timeout sur les requêtes de géolocalisation
- Cache des données utilisateur

### Personnalisation
- Messages en français
- Branding InvexQR
- Templates responsive HTML

## Monitoring

### Logs Disponibles
- Succès d'envoi d'emails
- Échecs avec détails d'erreur
- Actions utilisateur horodatées

### Métriques Trackées
- Nombre d'emails envoyés par type
- Taux de succès d'envoi
- Actions utilisateur par période

## Utilisation

Le système fonctionne automatiquement sans intervention :

1. **Utilisateur se connecte** → Message de bienvenue + email
2. **Utilisateur crée un QR** → Email de confirmation + notification
3. **QR Code scanné** → Email de notification en temps réel
4. **Modifications** → Emails automatiques de suivi

Tous les emails incluent des liens vers le dashboard et maintiennent la cohérence de la marque InvexQR.