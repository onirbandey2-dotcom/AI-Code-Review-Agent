"""
CodeSage AI - Custom Exception Hierarchy
Enterprise-grade exception handling with HTTP status codes.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status


class CodeSageException(Exception):
    """Base exception for all CodeSage AI custom exceptions."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundException(CodeSageException):
    """Resource not found exception."""

    def __init__(
        self,
        resource: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        message = f"{resource} not found"
        if resource_id:
            message += f": {resource_id}"
        super().__init__(
            message=message,
            code="NOT_FOUND",
            details=details,
        )


class ValidationException(CodeSageException):
    """Data validation exception."""

    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            details={"field": field, **(details or {})},
        )


class UnauthorizedException(CodeSageException):
    """Authentication/authorization exception."""

    def __init__(
        self,
        message: str = "Not authorized",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            details=details,
        )


class ForbiddenException(CodeSageException):
    """Access forbidden exception."""

    def __init__(
        self,
        message: str = "Access forbidden",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            code="FORBIDDEN",
            details=details,
        )


class ConflictException(CodeSageException):
    """Resource conflict exception."""

    def __init__(
        self,
        resource: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=f"{resource} already exists",
            code="CONFLICT",
            details=details,
        )


class RateLimitException(CodeSageException):
    """Rate limit exceeded exception."""

    def __init__(
        self,
        retry_after: int = 60,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message="Rate limit exceeded",
            code="RATE_LIMIT_EXCEEDED",
            details={"retry_after": retry_after, **(details or {})},
        )


class ExternalServiceException(CodeSageException):
    """External service failure exception."""

    def __init__(
        self,
        service: str,
        message: str = "External service error",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            code=f"{service.upper()}_ERROR",
            details={"service": service, **(details or {})},
        )


class AIException(CodeSageException):
    """AI/LLM related exception."""

    def __init__(
        self,
        message: str = "AI service error",
        provider: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            code="AI_ERROR",
            details={"provider": provider, **(details or {})},
        )


class DatabaseException(CodeSageException):
    """Database operation exception."""

    def __init__(
        self,
        message: str = "Database error",
        operation: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            code="DATABASE_ERROR",
            details={"operation": operation, **(details or {})},
        )


def exception_to_http(exc: CodeSageException) -> HTTPException:
    """
    Convert a CodeSageException to an HTTPException.

    Args:
        exc: CodeSageException instance

    Returns:
        Corresponding HTTPException with appropriate status code
    """
    status_code_map: Dict[str, int] = {
        "NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "UNAUTHORIZED": status.HTTP_401_UNAUTHORIZED,
        "FORBIDDEN": status.HTTP_403_FORBIDDEN,
        "CONFLICT": status.HTTP_409_CONFLICT,
        "RATE_LIMIT_EXCEEDED": status.HTTP_429_TOO_MANY_REQUESTS,
        "AI_ERROR": status.HTTP_502_BAD_GATEWAY,
    }

    http_status = status_code_map.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    return HTTPException(
        status_code=http_status,
        detail={
            "error": exc.code,
            "message": exc.message,
            "details": exc.details,
        },
    )


# Standard error response model
class ErrorResponse:
    """Standardized error response format."""

    def __init__(
        self,
        status_code: int,
        error: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.status_code = status_code
        self.error = error
        self.message = message
        self.details = details or {}

    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "error": self.error,
            "message": self.message,
            "details": self.details,
            "status_code": self.status_code,
        }

