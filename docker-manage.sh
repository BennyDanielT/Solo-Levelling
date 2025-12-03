#!/bin/bash

# Docker Management Script for Solo Levelling Project
# This script helps manage all Docker services

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_warning "Please create a .env file with required variables"
    exit 1
fi

# Function to start all services
start_all() {
    print_message "Starting all services..."
    docker compose up -d
    print_success "All services started!"
    print_message "Services available at:"
    echo "  - Next.js App:    http://localhost:3000"
    echo "  - FastAPI:        http://localhost:8000"
    echo "  - MongoDB:        mongodb://localhost:27017"
    echo "  - Mongo Express:  http://localhost:8081"
}

# Function to stop all services
stop_all() {
    print_message "Stopping all services..."
    docker compose down
    print_success "All services stopped!"
}

# Function to restart all services
restart_all() {
    print_message "Restarting all services..."
    docker compose restart
    print_success "All services restarted!"
}

# Function to view logs
view_logs() {
    SERVICE=$1
    if [ -z "$SERVICE" ]; then
        print_message "Showing logs for all services..."
        docker compose logs -f
    else
        print_message "Showing logs for $SERVICE..."
        docker compose logs -f "$SERVICE"
    fi
}

# Function to show status
show_status() {
    print_message "Service Status:"
    docker compose ps
}

# Function to rebuild services
rebuild() {
    SERVICE=$1
    if [ -z "$SERVICE" ]; then
        print_message "Rebuilding all services..."
        docker compose up -d --build
    else
        print_message "Rebuilding $SERVICE..."
        docker compose up -d --build "$SERVICE"
    fi
    print_success "Rebuild complete!"
}

# Function to clean up everything
cleanup() {
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Cleaning up..."
        docker compose down -v --rmi all
        print_success "Cleanup complete!"
    else
        print_message "Cleanup cancelled"
    fi
}

# Function to access MongoDB shell
mongo_shell() {
    print_message "Connecting to MongoDB shell..."
    docker compose exec mongodb mongosh -u ${MONGO_ROOT_USER} -p ${MONGO_ROOT_PASSWORD} --authenticationDatabase admin
}

# Function to backup MongoDB
backup_db() {
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP.gz"
    
    print_message "Creating MongoDB backup..."
    docker compose exec -T mongodb mongodump --username ${MONGO_ROOT_USER} --password ${MONGO_ROOT_PASSWORD} --authenticationDatabase admin --archive --gzip > "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
}

# Function to restore MongoDB
restore_db() {
    BACKUP_FILE=$1
    if [ -z "$BACKUP_FILE" ]; then
        print_error "Please provide backup file path"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_message "Restoring MongoDB from backup..."
    docker compose exec -T mongodb mongorestore --username ${MONGO_ROOT_USER} --password ${MONGO_ROOT_PASSWORD} --authenticationDatabase admin --archive --gzip < "$BACKUP_FILE"
    print_success "Database restored!"
}

# Main script logic
case "${1:-}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    logs)
        view_logs "${2:-}"
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild "${2:-}"
        ;;
    cleanup)
        cleanup
        ;;
    mongo-shell)
        mongo_shell
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "${2:-}"
        ;;
    *)
        echo "Solo Levelling Docker Management Script"
        echo ""
        echo "Usage: $0 {command} [options]"
        echo ""
        echo "Commands:"
        echo "  start              Start all services"
        echo "  stop               Stop all services"
        echo "  restart            Restart all services"
        echo "  logs [service]     View logs (optional: specific service)"
        echo "  status             Show service status"
        echo "  rebuild [service]  Rebuild services (optional: specific service)"
        echo "  cleanup            Remove all containers, volumes, and images"
        echo "  mongo-shell        Access MongoDB shell"
        echo "  backup             Create MongoDB backup"
        echo "  restore <file>     Restore MongoDB from backup"
        echo ""
        echo "Service names: mongodb, mongo-express, fastapi, app"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs fastapi"
        echo "  $0 rebuild app"
        echo "  $0 backup"
        exit 1
        ;;
esac
