#!/bin/bash

# Instagram Scrapper Setup Script
# This script automates the initial project setup

set -e  # Exit on error

echo "🚀 Instagram Scrapper Setup"
echo "================================"
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
required_version="3.9"

if awk "BEGIN {exit !($python_version >= $required_version)}"; then
    echo "✅ Python $python_version found"
else
    echo "❌ Python $required_version or higher is required"
    echo "   Current version: $python_version"
    exit 1
fi

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "✅ Virtual environment found"
else
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "📦 Installing dependencies..."
read -p "Install development dependencies? (y/n) [y]: " install_dev
install_dev=${install_dev:-y}

if [ "$install_dev" = "y" ] || [ "$install_dev" = "Y" ]; then
    pip install -r requirements-dev.txt --quiet
    echo "✅ Development dependencies installed"

    # Setup pre-commit hooks
    read -p "Setup pre-commit hooks? (y/n) [y]: " setup_hooks
    setup_hooks=${setup_hooks:-y}

    if [ "$setup_hooks" = "y" ] || [ "$setup_hooks" = "Y" ]; then
        pre-commit install
        echo "✅ Pre-commit hooks installed"
    fi
else
    pip install -r requirements.txt --quiet
    echo "✅ Production dependencies installed"
fi

# Setup environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Check Redis connection
echo "🔍 Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. Please start Redis:"
        echo "   macOS: brew services start redis"
        echo "   Linux: sudo systemctl start redis"
    fi
else
    echo "⚠️  redis-cli not found. Please install Redis:"
    echo "   macOS: brew install redis"
    echo "   Linux: sudo apt-get install redis-server"
fi

# Run tests
echo ""
read -p "Run tests to verify setup? (y/n) [y]: " run_tests
run_tests=${run_tests:-y}

if [ "$run_tests" = "y" ] || [ "$run_tests" = "Y" ]; then
    echo "🧪 Running tests..."
    if pytest -v; then
        echo "✅ All tests passed!"
    else
        echo "❌ Some tests failed. Please check the errors above."
    fi
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Make sure Redis is running"
echo "   3. Activate venv: source venv/bin/activate"
echo "   4. Run the app: make run"
echo ""
echo "📖 Documentation:"
echo "   - Setup Guide: docs/SETUP_GUIDE.md"
echo "   - pyproject.toml Explained: docs/PYPROJECT_EXPLAINED.md"
echo "   - README: README.md"
echo ""
echo "🛠️  Available commands:"
echo "   make help       - Show all available commands"
echo "   make format     - Format code"
echo "   make lint       - Run linters"
echo "   make test       - Run tests"
echo "   make run        - Run the application"
echo ""
echo "Happy coding! 🎉"
