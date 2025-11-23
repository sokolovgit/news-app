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

### Environment Variables

See the [Environment Variables](#environment-variables) section below for all available options.

### Instagram Session File (Optional but Recommended)

The session file allows the scraper to make authenticated requests to Instagram, which:
- ✅ Reduces rate limiting issues
- ✅ Allows access to more profiles
- ✅ Improves reliability

**Without a session file:** The scraper works but may hit rate limits more frequently and has limited access.

**Creating a Session File:**

1. **Using the helper script** (recommended):
   ```bash
   python scripts/create_session.py
   ```
   This will prompt you for your Instagram username and password, then create a session file.

2. **Using instaloader CLI directly**:
   ```bash
   instaloader --login YOUR_USERNAME
   ```
   This will create a `YOUR_USERNAME.session` file in the current directory.

3. **Set the session path in `.env`**:
   ```bash
   INSTAGRAM_SESSION_PATH=/path/to/your-username.session
   ```

**Important Notes:**
- ⚠️ Session files are already in `.gitignore` - they won't be committed
- ⚠️ Your password is NOT stored - only the session token
- ⚠️ Session files expire after some time - recreate if authentication fails
- ⚠️ If you have 2FA enabled, temporarily disable it or use a different account
- ⚠️ Keep session files secure and private

### Environment Variables

**Required:**
- `REDIS_URL` - Redis connection URL (must match NestJS app)

**Optional:**
- `INSTAGRAM_SESSION_PATH` - Path to Instagram session file
- `INSTAGRAM_RATE_LIMIT_DELAY` - Delay between requests in seconds (default: 1.0)
- `INSTAGRAM_DOWNLOAD_VIDEOS` - Download videos (default: false)
- `INSTAGRAM_DOWNLOAD_PICTURES` - Download pictures (default: false)
- `WORKER_CONCURRENCY` - Number of concurrent jobs (default: 1)

## License

MIT
