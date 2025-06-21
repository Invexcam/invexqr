#!/bin/bash

# ===========================================
# SCRIPT DE DÉPLOIEMENT INVEXQR
# ===========================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_NAME="invexqr"
NETWORK_NAME="invexapps_net"
BACKUP_DIR="/backup/invexqr"
LOG_FILE="/var/log/invexqr_deploy.log"

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
    fi
    
    if [ ! -f ".env" ]; then
        warning "Fichier .env non trouvé, copie de .env.example"
        cp .env.example .env
        warning "Veuillez configurer le fichier .env avant de continuer"
        exit 1
    fi
    
    success "Prérequis validés"
}

# Créer le réseau Docker
create_network() {
    log "Création du réseau Docker '$NETWORK_NAME'..."
    
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        docker network create "$NETWORK_NAME" --driver bridge --subnet=172.20.0.0/16
        success "Réseau '$NETWORK_NAME' créé"
    else
        log "Réseau '$NETWORK_NAME' existe déjà"
    fi
}

# Sauvegarder la base de données
backup_database() {
    if [ "$1" = "--backup" ]; then
        log "Sauvegarde de la base de données..."
        
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/invexqr_$(date +%Y%m%d_%H%M%S).sql"
        
        docker-compose exec -T postgres pg_dump -U invexqr_user invexqr > "$BACKUP_FILE"
        success "Sauvegarde créée: $BACKUP_FILE"
    fi
}

# Construire et démarrer les services
deploy() {
    log "Déploiement d'InvexQR..."
    
    # Arrêter les services existants
    log "Arrêt des services existants..."
    docker-compose down
    
    # Construire les images
    log "Construction des images Docker..."
    docker-compose build --no-cache
    
    # Démarrer les services
    log "Démarrage des services..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    log "Attente du démarrage des services..."
    sleep 30
    
    # Vérifier la santé des services
    check_health
}

# Vérifier la santé des services
check_health() {
    log "Vérification de la santé des services..."
    
    # Vérifier PostgreSQL
    if docker-compose exec postgres pg_isready -U invexqr_user -d invexqr; then
        success "PostgreSQL est opérationnel"
    else
        error "PostgreSQL n'est pas accessible"
    fi
    
    # Vérifier Redis
    if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
        success "Redis est opérationnel"
    else
        error "Redis n'est pas accessible"
    fi
    
    # Vérifier l'application
    sleep 10
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "Application InvexQR est opérationnelle"
    else
        warning "Application pas encore prête, vérifiez les logs"
    fi
}

# Afficher les logs
show_logs() {
    log "Affichage des logs des services..."
    docker-compose logs -f --tail=50
}

# Nettoyer le système
cleanup() {
    log "Nettoyage du système Docker..."
    docker system prune -f
    docker volume prune -f
    success "Nettoyage terminé"
}

# Mise à jour
update() {
    log "Mise à jour d'InvexQR..."
    
    # Sauvegarder avant la mise à jour
    backup_database --backup
    
    # Télécharger les dernières modifications
    git pull origin main
    
    # Redéployer
    deploy
}

# Menu principal
show_menu() {
    echo "================================="
    echo "   DÉPLOIEMENT INVEXQR"
    echo "================================="
    echo "1. Déployer (première installation)"
    echo "2. Redémarrer les services"
    echo "3. Mettre à jour"
    echo "4. Sauvegarder la base de données"
    echo "5. Afficher les logs"
    echo "6. Vérifier la santé"
    echo "7. Nettoyer le système"
    echo "8. Arrêter tous les services"
    echo "9. Quitter"
    echo "================================="
    read -p "Choisissez une option (1-9): " choice
}

# Fonction principale
main() {
    case "${1:-menu}" in
        "deploy")
            check_prerequisites
            create_network
            deploy
            ;;
        "restart")
            docker-compose restart
            check_health
            ;;
        "update")
            update
            ;;
        "backup")
            backup_database --backup
            ;;
        "logs")
            show_logs
            ;;
        "health")
            check_health
            ;;
        "cleanup")
            cleanup
            ;;
        "stop")
            docker-compose down
            success "Services arrêtés"
            ;;
        "menu"|*)
            while true; do
                show_menu
                case $choice in
                    1) main deploy ;;
                    2) main restart ;;
                    3) main update ;;
                    4) main backup ;;
                    5) main logs ;;
                    6) main health ;;
                    7) main cleanup ;;
                    8) main stop ;;
                    9) exit 0 ;;
                    *) warning "Option invalide" ;;
                esac
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
            done
            ;;
    esac
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi