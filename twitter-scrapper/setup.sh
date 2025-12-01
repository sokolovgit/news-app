#!/bin/bash

# Twitter Scrapper Setup Script

set -e

echo "🐦 Setting up Twitter Scrapper..."

# Check if Python 3.10+ is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "✓ Found Python $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Twitter Account Configuration (for twscrape)
# You can add multiple accounts for better rate limits
TWITTER_ACCOUNTS_DB=accounts.db

# Worker Configuration
WORKER_CONCURRENCY=1

# Twitter Rate Limiting
TWITTER_RATE_LIMIT_DELAY=1.0

# Logging
LOG_LEVEL=INFO
EOF
    echo "✓ Created .env file. Please update with your configuration."
fi

# Create accounts database directory
mkdir -p data

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Redis URL"
echo "2. Run 'make setup-account' to add your Twitter account"
echo "3. Run 'make run' to start the scraper"

