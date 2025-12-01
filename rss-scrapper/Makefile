.PHONY: help install install-dev run test lint format clean

# Default Python executable
PYTHON := python3

help:
	@echo "RSS Scrapper - Available commands:"
	@echo ""
	@echo "  install      Install production dependencies"
	@echo "  install-dev  Install development dependencies"
	@echo "  run          Run the RSS scrapper worker"
	@echo "  test         Run tests"
	@echo "  lint         Run linters (flake8, mypy)"
	@echo "  format       Format code with black and isort"
	@echo "  clean        Remove build artifacts and cache files"

install:
	$(PYTHON) -m pip install -r requirements.txt

install-dev:
	$(PYTHON) -m pip install -r requirements-dev.txt

run:
	$(PYTHON) -m src.main

test:
	$(PYTHON) -m pytest

lint:
	$(PYTHON) -m flake8 src tests
	$(PYTHON) -m mypy src

format:
	$(PYTHON) -m black src tests
	$(PYTHON) -m isort src tests

clean:
	rm -rf __pycache__
	rm -rf src/__pycache__
	rm -rf src/scraper/__pycache__
	rm -rf tests/__pycache__
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf htmlcov
	rm -rf .coverage
	rm -rf coverage.xml
	rm -rf dist
	rm -rf build
	rm -rf *.egg-info

