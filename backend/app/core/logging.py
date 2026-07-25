"""
CodeSage AI - Structured Logging Configuration
JSON-based logging with correlation IDs and structured context.
"""

from __future__ import annotations

import logging
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import structlog
from structlog.processors import JSONRenderer, TimeStamper

from app.core.config import settings


def add_correlation_id(
    logger: logging.Logger,
    method_name: str,
    event_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Add or retrieve correlation ID for request tracing.

    Args:
        logger: Logger instance
        method_name: Method name
        event_dict: Event dictionary

    Returns:
        Updated event dictionary with correlation_id
    """
    correlation_id = event_dict.pop("correlation_id", None)
    if not correlation_id:
        correlation_id = str(uuid.uuid4())
    event_dict["correlation_id"] = correlation_id
    return event_dict


def add_environment_info(
    logger: logging.Logger,
    method_name: str,
    event_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Add environment and service metadata to log entries.

    Args:
        logger: Logger instance
        method_name: Method name
        event_dict: Event dictionary

    Returns:
        Updated event dictionary with environment info
    """
    event_dict["environment"] = settings.ENVIRONMENT.value
    event_dict["service"] = settings.APP_NAME
    event_dict["version"] = settings.APP_VERSION
    return event_dict


def add_user_info(
    logger: logging.Logger,
    method_name: str,
    event_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Add user context to log entries if available.

    Args:
        logger: Logger instance
        method_name: Method name
        event_dict: Event dictionary

    Returns:
        Updated event dictionary with user info
    """
    user_id = event_dict.pop("user_id", None)
    if user_id:
        event_dict["user"] = {"id": user_id}
    return event_dict


def setup_logging() -> None:
    """
    Configure structured logging for the application.

    Sets up structlog with JSON formatting, timestamps, and
    structured context for production-grade observability.
    """
    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        add_correlation_id,
        add_environment_info,
        add_user_info,
        structlog.stdlib.add_log_level,
        structlog.stdlib.ExtraAdder(),
        TimeStamper(fmt="iso", utc=True),
    ]

    if settings.ENVIRONMENT.value == "development":
        # Development: colorful console output
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(
                colors=True,
                sort_keys=False,
            ),
        ]
    else:
        # Production: JSON format
        processors = shared_processors + [
            JSONRenderer(
                sort_keys=True,
            ),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure standard logging to use structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=settings.log_level_int,
    )

    # Set third-party loggers to WARNING
    for logger_name in (
        "uvicorn",
        "uvicorn.access",
        "sqlalchemy.engine",
        "httpx",
        "httpcore",
        "urllib3",
    ):
        logging.getLogger(logger_name).setLevel(logging.WARNING)


def get_logger(name: Optional[str] = None) -> structlog.stdlib.BoundLogger:
    """
    Get a structured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured structlog logger
    """
    return structlog.get_logger(name or __name__)


# Default logger instance
logger = get_logger("codesage")

