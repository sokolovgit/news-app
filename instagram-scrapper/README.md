# Instagram Scrapper

A Python-based Instagram public profile scraper with BullMQ integration for job queue management.

## Features

- 📸 Scrape public Instagram profiles
- 🔄 BullMQ integration for distributed job processing
- 🚀 Asynchronous processing
- 🛡️ Type-safe with Pydantic models
- 🧪 Comprehensive testing suite
- 🎨 Code formatting with Black and isort

## Prerequisites

- Python 3.9 or higher
- Redis server (for BullMQ)

## Installation

### 1. Clone and setup virtual environment

```bash
cd instagram-scrapper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

**Production:**
```bash
make install
# or
pip install -r requirements.txt
```

**Development:**
```bash
make install-dev
# or
pip install -r requirements-dev.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Project Structure

```
instagram-scrapper/
├── src/
│   └── instagram_scrapper/
│       ├── __init__.py
│       ├── main.py              # Entry point
│       ├── config.py            # Configuration management
│       ├── scraper/             # Scraping logic
│       ├── queue/               # BullMQ integration
│       └── models/              # Data models
├── tests/                       # Test suite
├── pyproject.toml              # Project configuration
├── requirements.txt            # Production dependencies
├── requirements-dev.txt        # Development dependencies
├── Makefile                    # Common commands
└── README.md
```

## Usage

### Running the scraper

```bash
make run
# or
python -m instagram_scrapper.main
```

### Development Commands

```bash
# Format code
make format

# Run linters
make lint

# Run tests
make test

# Run tests with coverage
make test-cov

# Run all checks (format + lint + test)
make check

# Clean build artifacts
make clean
```

## Development

### Code Style

This project uses:
- **Black** for code formatting (line length: 100)
- **isort** for import sorting
- **flake8** for linting
- **mypy** for type checking

### Pre-commit Hooks

Install pre-commit hooks to automatically format and lint code before commits:

```bash
pre-commit install
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/instagram_scrapper

# Run specific test file
pytest tests/test_scraper.py

# Run with markers
pytest -m unit          # Run only unit tests
pytest -m integration   # Run only integration tests
```

## Configuration

See `.env.example` for available configuration options.

### Key Configuration Items:

- **REDIS_HOST**: Redis server host (default: localhost)
- **REDIS_PORT**: Redis server port (default: 6379)
- **QUEUE_NAME**: BullMQ queue name
- **CONCURRENCY**: Number of concurrent workers
- **LOG_LEVEL**: Logging level (DEBUG, INFO, WARNING, ERROR)

## License

MIT
