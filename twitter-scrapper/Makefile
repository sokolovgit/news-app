.PHONY: help install install-dev format lint test clean run setup-account

# Default target
help:
	@echo "Available commands:"
	@echo "  make install       - Install production dependencies"
	@echo "  make install-dev   - Install development dependencies"
	@echo "  make format        - Format code with black and isort"
	@echo "  make lint          - Run linters (flake8, mypy)"
	@echo "  make test          - Run tests with pytest"
	@echo "  make test-cov      - Run tests with coverage report"
	@echo "  make clean         - Remove build artifacts and cache"
	@echo "  make run           - Run the scraper"
	@echo "  make check         - Run format, lint, and test"
	@echo "  make setup-account - Setup Twitter account for scraping"

# Install production dependencies
install:
	pip install -r requirements.txt

# Install development dependencies
install-dev:
	pip install -r requirements-dev.txt
	pre-commit install

# Format code
format:
	@echo "Running black..."
	black src/ tests/
	@echo "Running isort..."
	isort src/ tests/
	@echo "✓ Code formatted!"

# Run linters
lint:
	@echo "Running flake8..."
	flake8 src/ tests/
	@echo "Running mypy..."
	mypy src/
	@echo "✓ Linting passed!"

# Run tests
test:
	pytest tests/

# Run tests with coverage
test-cov:
	pytest --cov=src --cov-report=term-missing --cov-report=html

# Clean build artifacts
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete

# Run the scraper
run:
	python -m src.main

# Setup Twitter account
setup-account:
	python -m scripts.setup_account

# Run all checks
check: format lint test
	@echo "✓ All checks passed!"

