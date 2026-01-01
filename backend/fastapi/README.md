# MSS Course Platform BFF

Backend for Frontend API for MSS Course Platform.

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI 0.109+
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: MySQL 8.0
- **Authentication**: JWT
- **Environment**: Docker + Docker Compose

## Quick Start

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your SECRET_KEY (min 32 characters)
# You can generate one with: openssl rand -hex 32
```

### 2. Start Services

```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### 3. Access API

- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/health

### 4. Database Management

```bash
# Run migrations (after setting up Alembic - see Ticket #002)
docker-compose exec api alembic upgrade head

# Create new migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Rollback migration
docker-compose exec api alembic downgrade -1
```

## Development

### Running Tests

```bash
# Install dev dependencies
docker-compose exec api pip install -r requirements-dev.txt

# Run all tests
docker-compose exec api pytest

# Run with coverage
docker-compose exec api pytest --cov=app --cov-report=html

# Run specific test file
docker-compose exec api pytest tests/integration/test_auth.py -v
```

### Code Quality

```bash
# Format code with Black
docker-compose exec api black app tests

# Lint with Ruff
docker-compose exec api ruff check app tests

# Type check with mypy
docker-compose exec api mypy app
```

### Access Database

```bash
# MySQL CLI
docker-compose exec db mysql -u mss_user -pmss_password mss_course_platform

# Show tables
docker-compose exec db mysql -u mss_user -pmss_password mss_course_platform -e "SHOW TABLES;"
```

## Project Structure

```
backend/fastapi/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/
│   ├── core/             # Core functionality (config, security)
│   ├── db/               # Database configuration
│   ├── models/           # SQLAlchemy models
│   ├── repositories/     # Repository pattern
│   ├── schemas/          # Pydantic schemas
│   ├── utils/            # Utilities
│   └── main.py           # Application entry point
├── tests/
│   ├── fixtures/         # Test fixtures
│   └── integration/      # Integration tests
├── migrations/           # Alembic migrations
├── scripts/              # Utility scripts
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── requirements-dev.txt
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL`: MySQL connection string
- `SECRET_KEY`: JWT secret key (min 32 characters)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## Next Steps

Follow the implementation tickets in order:

1. ✅ #001 Environment Setup
2. ✅ #002 Database Design
3. ✅ #003 Authentication
4. ✅ #004 Courses API
5. ✅ #005 Videos API
6. ✅ #006 Progress API
7. ✅ #007 Comments API
8. ⬜ #008 Integration Tests (current)

See `backend/docs/tickets/` for detailed implementation guides.

## Troubleshooting

### Database Connection Issues

```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Rebuild container
docker-compose up -d --build api
```

## License

Internal project - MSS Course Platform
