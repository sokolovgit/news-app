#!/bin/bash

# Setup script for RSS Scrapper

set -e

echo "Setting up RSS Scrapper..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if dev dependencies should be installed
if [ "$1" == "--dev" ]; then
    echo "Installing development dependencies..."
    pip install -r requirements-dev.txt
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cat > .env << 'EOF'
# Redis connection URL
REDIS_URL=redis://localhost:6379

# RSS Configuration
RSS_REQUEST_TIMEOUT=30
RSS_USER_AGENT=RSSScrapperBot/1.0
RSS_MAX_ENTRIES=50

# Worker configuration
WORKER_CONCURRENCY=5

# S3/MinIO Configuration (optional, for media handling)
# S3_ENDPOINT=http://localhost:9001
# S3_ACCESS_KEY=admin
# S3_SECRET_KEY=password
# S3_BUCKET=news-app-media
EOF
    echo ".env file created. Please update with your configuration."
fi

echo ""
echo "Setup complete!"
echo ""
echo "To activate the virtual environment, run:"
echo "  source venv/bin/activate"
echo ""
echo "To run the worker, run:"
echo "  make run"
echo "  # or"
echo "  python -m src.main"

