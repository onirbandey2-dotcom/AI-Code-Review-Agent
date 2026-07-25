"""
CodeSage AI - Database Configuration
Async SQLAlchemy engine, session management, and base model.
"""

from __future__ import annotations

import uuid
from typing import Any, AsyncGenerator, AsyncIterator, Dict, Optional

from sqlalchemy import MetaData, String, text, types
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, declared_attr

from app.core.config import settings


# ──────────────────────────────────────────────
# Cross-Database Type Decorators
# Works with both PostgreSQL (native UUID/JSONB) and SQLite
# ──────────────────────────────────────────────

class GUID(types.TypeDecorator):
    """Platform-independent GUID type.
    
    Uses PostgreSQL UUID when available, otherwise uses String(32).
    """
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value: Optional[uuid.UUID], dialect: Any) -> Optional[str]:
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value: Optional[str], dialect: Any) -> Optional[uuid.UUID]:
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)

    @property
    def python_type(self) -> type:
        return uuid.UUID


class JSONType(types.TypeDecorator):
    """Platform-independent JSON type.
    
    Uses PostgreSQL JSONB when available, otherwise uses String.
    """
    impl = types.JSON
    cache_ok = True

    def process_bind_param(self, value: Optional[Any], dialect: Any) -> Optional[Any]:
        return value

    def process_result_value(self, value: Optional[Any], dialect: Any) -> Optional[Any]:
        return value or {}


# Naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    @declared_attr
    def __tablename__(cls) -> str:  # noqa: N805
        """Generate table name from class name (snake_case)."""
        import re

        name = cls.__name__
        # Convert CamelCase to snake_case
        return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


# Apply custom metadata to Base after class definition
# (Setting it at class-level conflicts with newer SQLAlchemy DeclarativeBase)
Base.metadata = metadata


# Build engine kwargs dynamically based on database type
engine_kwargs: dict = {
    "echo": settings.DATABASE_ECHO,
}

if settings.is_postgresql:
    # PostgreSQL supports connection pooling
    engine_kwargs.update({
        "pool_size": settings.DATABASE_POOL_SIZE,
        "max_overflow": settings.DATABASE_MAX_OVERFLOW,
        "pool_timeout": settings.DATABASE_POOL_TIMEOUT,
        "pool_pre_ping": True,
    })
else:
    # SQLite/aiosqlite does not support connection pooling
    # Omit pool_* parameters entirely to avoid TypeError
    engine_kwargs["pool_pre_ping"] = False

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get a database session.

    Yields:
        AsyncSession instance

    Example:
        async with get_session() as session:
            result = await session.execute(query)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.

    Yields:
        AsyncSession for dependency injection

    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database - create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db() -> None:
    """Drop all tables (for testing)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def check_db_health() -> bool:
    """Check database connection health."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


from sqlalchemy import text  # noqa: E402, F811

