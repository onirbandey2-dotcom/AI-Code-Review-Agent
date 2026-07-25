"""
CodeSage AI - Application Configuration
Enterprise-grade settings management using Pydantic Settings.
"""

from __future__ import annotations

import os
from enum import Enum
from pathlib import Path
from typing import List, Optional, Set

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Application environment enum."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class LogLevel(str, Enum):
    """Logging level enum."""

    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses Pydantic Settings for validation and type coercion.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ──────────────────────────────────────────────
    # Application Settings
    # ──────────────────────────────────────────────
    APP_NAME: str = Field(default="CodeSage AI", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    ENVIRONMENT: Environment = Field(
        default=Environment.DEVELOPMENT, description="Runtime environment"
    )
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    SECRET_KEY: str = Field(default="", description="Secret key for JWT signing")
    API_V1_PREFIX: str = Field(default="/api/v1", description="API version prefix")
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://192.168.0.106:5173",
        ],
        description="Allowed CORS origins",
    )

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Ensure secret key is set in non-development environments."""
        if not v:
            import secrets

            return secrets.token_urlsafe(64)
        return v

    # ──────────────────────────────────────────────
    # Database Settings
    # ──────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/codesage",
        description="PostgreSQL connection string",
    )
    DATABASE_POOL_SIZE: int = Field(default=20, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=10, description="Maximum pool overflow")
    DATABASE_ECHO: bool = Field(default=False, description="Echo SQL queries")
    DATABASE_POOL_TIMEOUT: int = Field(default=30, description="Connection pool timeout")

    # ──────────────────────────────────────────────
    # Redis Settings
    # ──────────────────────────────────────────────
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string",
    )
    REDIS_CACHE_TTL: int = Field(default=3600, description="Default cache TTL (seconds)")

    # ──────────────────────────────────────────────
    # RabbitMQ Settings
    # ──────────────────────────────────────────────
    RABBITMQ_URL: str = Field(
        default="amqp://guest:guest@localhost:5672/",
        description="RabbitMQ connection string",
    )
    RABBITMQ_DEFAULT_EXCHANGE: str = Field(
        default="codesage", description="Default exchange name"
    )

    # ──────────────────────────────────────────────
    # Celery Settings
    # ──────────────────────────────────────────────
    CELERY_BROKER_URL: str = Field(
        default="amqp://guest:guest@localhost:5672/",
        description="Celery broker URL",
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/1",
        description="Celery result backend URL",
    )
    CELERY_TASK_TRACK_STARTED: bool = Field(default=True)
    CELERY_TASK_TIME_LIMIT: int = Field(default=3600, description="Task time limit (seconds)")
    CELERY_WORKER_CONCURRENCY: int = Field(default=4, description="Worker concurrency")

    # ──────────────────────────────────────────────
    # GitHub OAuth Settings
    # ──────────────────────────────────────────────
    GITHUB_CLIENT_ID: str = Field(default="", description="GitHub OAuth App client ID")
    GITHUB_CLIENT_SECRET: str = Field(default="", description="GitHub OAuth App client secret")
    GITHUB_REDIRECT_URI: str = Field(
        default="http://localhost:8000/api/v1/auth/github/callback",
        description="GitHub OAuth callback URL",
    )
    GITHUB_APP_ID: Optional[str] = Field(default=None, description="GitHub App ID")
    GITHUB_APP_PRIVATE_KEY: Optional[str] = Field(
        default=None, description="GitHub App private key path"
    )

    # ──────────────────────────────────────────────
    # JWT Settings
    # ──────────────────────────────────────────────
    JWT_ALGORITHM: str = Field(default="RS256", description="JWT signing algorithm")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30, description="Access token expiration (minutes)"
    )
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7, description="Refresh token expiration (days)"
    )
    JWT_PUBLIC_KEY: Optional[str] = Field(default=None, description="RSA public key")
    JWT_PRIVATE_KEY: Optional[str] = Field(default=None, description="RSA private key")

    # ──────────────────────────────────────────────
    # AI / LLM Settings
    # ──────────────────────────────────────────────
    LLM_PROVIDER: str = Field(default="ollama", description="LLM provider (ollama, openai, etc.)")
    LLM_MODEL: str = Field(default="llama3:70b", description="LLM model name")
    LLM_API_KEY: Optional[str] = Field(default=None, description="LLM API key")
    LLM_API_BASE: str = Field(
        default="http://localhost:11434", description="LLM API base URL"
    )
    LLM_TEMPERATURE: float = Field(default=0.1, description="LLM temperature")
    LLM_MAX_TOKENS: int = Field(default=8192, description="Maximum tokens per response")
    LLM_REQUEST_TIMEOUT: int = Field(default=120, description="LLM request timeout (seconds)")

    EMBEDDING_MODEL: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="Embedding model name",
    )
    EMBEDDING_DIMENSION: int = Field(default=384, description="Embedding vector dimension")

    # ──────────────────────────────────────────────
    # Vector Database Settings
    # ──────────────────────────────────────────────
    VECTOR_DB_TYPE: str = Field(default="chroma", description="Vector database type")
    VECTOR_DB_PATH: str = Field(
        default="./data/vector_store", description="Vector database path"
    )
    VECTOR_DB_COLLECTION: str = Field(
        default="codesage_knowledge", description="Default collection name"
    )

    # ──────────────────────────────────────────────
    # Rate Limiting
    # ──────────────────────────────────────────────
    RATE_LIMIT_ENABLED: bool = Field(default=True, description="Enable rate limiting")
    RATE_LIMIT_DEFAULT: int = Field(
        default=100, description="Default requests per window"
    )
    RATE_LIMIT_WINDOW: int = Field(
        default=60, description="Rate limit window (seconds)"
    )
    RATE_LIMIT_AI_REQUESTS: int = Field(
        default=20, description="AI requests per window"
    )

    # ──────────────────────────────────────────────
    # Monitoring & Observability
    # ──────────────────────────────────────────────
    ENABLE_METRICS: bool = Field(default=True, description="Enable Prometheus metrics")
    ENABLE_OPEN_TELEMETRY: bool = Field(default=False, description="Enable OpenTelemetry")
    OTEL_SERVICE_NAME: str = Field(default="codesage-backend", description="OTel service name")
    OTEL_EXPORTER_ENDPOINT: Optional[str] = Field(
        default=None, description="OTel exporter endpoint"
    )
    SENTRY_DSN: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")

    # ──────────────────────────────────────────────
    # Storage
    # ──────────────────────────────────────────────
    UPLOAD_DIR: str = Field(default="./uploads", description="Upload directory")
    MAX_UPLOAD_SIZE: int = Field(
        default=10485760, description="Maximum upload size (10MB)"
    )  # 10MB
    ALLOWED_EXTENSIONS: Set[str] = Field(
        default={
            ".py",
            ".js",
            ".ts",
            ".tsx",
            ".jsx",
            ".java",
            ".go",
            ".rs",
            ".cpp",
            ".c",
            ".h",
            ".hpp",
            ".cs",
            ".rb",
            ".php",
            ".swift",
            ".kt",
            ".scala",
            ".vue",
            ".svelte",
        },
        description="Allowed file extensions for upload",
    )

    # ──────────────────────────────────────────────
    # Logging
    # ──────────────────────────────────────────────
    LOG_LEVEL: LogLevel = Field(default=LogLevel.INFO, description="Logging level")
    LOG_FORMAT: str = Field(default="json", description="Log format (json or text)")
    ENABLE_ACCESS_LOG: bool = Field(default=True, description="Enable access logs")

    # ──────────────────────────────────────────────
    # Derived Properties
    # ──────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == Environment.PRODUCTION

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == Environment.DEVELOPMENT

    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.ENVIRONMENT == Environment.TESTING

    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return "sqlite" in self.DATABASE_URL

    @property
    def is_postgresql(self) -> bool:
        """Check if using PostgreSQL database."""
        return "postgresql" in self.DATABASE_URL

    @property
    def database_url_async(self) -> str:
        """Get async database URL."""
        return self.DATABASE_URL

    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL for Alembic."""
        return self.DATABASE_URL.replace("+asyncpg", "")

    @property
    def log_level_int(self) -> int:
        """Get numeric log level."""
        import logging

        return getattr(logging, self.LOG_LEVEL.value, logging.INFO)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list.

        Handles both JSON array format:
            CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
        And comma-separated format:
            CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
        """
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("["):
                import json
                try:
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        return parsed
                except (json.JSONDecodeError, TypeError):
                    pass
            return [origin.strip().strip('"').strip("'") for origin in v.split(",")]
        return v


# Global settings instance
settings = Settings()

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent

