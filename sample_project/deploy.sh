#!/bin/bash

# Sample deployment script for the sample project
# This script demonstrates shell script inclusion in snapshots

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sample-project"
DEPLOY_ENV="${1:-development}"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARNING: $1"
}

# Main deployment function
deploy() {
    log "Starting deployment of $APP_NAME to $DEPLOY_ENV environment"

    # Pre-deployment checks
    check_dependencies
    create_backup
    validate_config

    # Deployment steps
    install_dependencies
    run_migrations
    build_assets
    restart_services

    # Post-deployment
    run_tests
    cleanup

    success "Deployment completed successfully!"
}

# Check system dependencies
check_dependencies() {
    log "Checking system dependencies..."

    command -v node >/dev/null 2>&1 || error_exit "Node.js is required but not installed"
    command -v python3 >/dev/null 2>&1 || error_exit "Python 3 is required but not installed"
    command -v pip >/dev/null 2>&1 || error_exit "pip is required but not installed"

    success "All dependencies are available"
}

# Create backup
create_backup() {
    log "Creating backup..."

    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    if [ -d "data" ]; then
        tar -czf "$BACKUP_FILE" data/ 2>/dev/null || warning "No data directory to backup"
    else
        warning "No data directory found, skipping backup"
    fi

    success "Backup created: $BACKUP_FILE"
}

# Validate configuration
validate_config() {
    log "Validating configuration..."

    if [ ! -f "config.json" ]; then
        error_exit "config.json not found"
    fi

    # Basic JSON validation
    python3 -m json.tool config.json >/dev/null 2>&1 || error_exit "config.json is not valid JSON"

    success "Configuration validated"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."

    if [ -f "package.json" ]; then
        npm install || error_exit "Failed to install Node.js dependencies"
    fi

    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt || error_exit "Failed to install Python dependencies"
    fi

    success "Dependencies installed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."

    # This would typically run actual migration commands
    # For demo purposes, we'll just simulate it
    if [ "$DEPLOY_ENV" = "production" ]; then
        warning "Production deployment detected - running full migration suite"
        # In real scenario: python manage.py migrate
        sleep 1
    else
        warning "Development deployment - skipping heavy migrations"
    fi

    success "Migrations completed"
}

# Build assets
build_assets() {
    log "Building assets..."

    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        npm run build || error_exit "Failed to build assets"
    fi

    success "Assets built"
}

# Restart services
restart_services() {
    log "Restarting services..."

    # In a real scenario, this might restart systemd services, Docker containers, etc.
    # For demo, we'll just simulate
    if pgrep -f "node.*app.js" >/dev/null; then
        warning "Found running Node.js process, restarting..."
        # pkill -f "node.*app.js"
        # npm start &
    fi

    success "Services restarted"
}

# Run tests
run_tests() {
    log "Running tests..."

    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test || warning "Some tests failed"
    fi

    if [ -d "tests" ] && [ -f "requirements.txt" ]; then
        python3 -m pytest tests/ -v || warning "Some Python tests failed"
    fi

    success "Tests completed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."

    # Remove temporary files, clear caches, etc.
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true

    success "Cleanup completed"
}

# Health check
health_check() {
    log "Performing health check..."

    # Check if services are responding
    # curl -f http://localhost:3000/health >/dev/null 2>&1 || warning "Health check failed"

    success "Health check passed"
}

# Main execution
main() {
    echo "🚀 $APP_NAME Deployment Script"
    echo "Environment: $DEPLOY_ENV"
    echo "Log file: $LOG_FILE"
    echo

    deploy
    health_check

    echo
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo "Check $LOG_FILE for detailed logs"
}

# Run main function with all arguments
main "$@"