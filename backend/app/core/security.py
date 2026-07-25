"""
CodeSage AI - Security Module
Handles authentication, authorization, password hashing, and JWT operations.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings


class TokenPayload(BaseModel):
    """JWT token payload model."""

    sub: str  # User ID
    exp: datetime  # Expiration
    iat: datetime  # Issued at
    type: str  # "access" or "refresh"
    roles: list[str] = []


class TokenResponse(BaseModel):
    """Token response model."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


# Password hashing context using bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    roles: Optional[list[str]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        subject: User identifier (typically user ID)
        roles: List of user roles
        expires_delta: Token expiration time

    Returns:
        Encoded JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "exp": now + expires_delta,
        "iat": now,
        "type": "access",
        "roles": roles or [],
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT refresh token.

    Args:
        subject: User identifier
        expires_delta: Token expiration time

    Returns:
        Encoded JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "exp": now + expires_delta,
        "iat": now,
        "type": "refresh",
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> TokenPayload:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT token string

    Returns:
        TokenPayload if valid

    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return TokenPayload(
            sub=payload["sub"],
            exp=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
            iat=datetime.fromtimestamp(payload["iat"], tz=timezone.utc),
            type=payload.get("type", "access"),
            roles=payload.get("roles", []),
        )
    except JWTError as e:
        raise JWTError(f"Invalid token: {e}") from e


def create_token_pair(user_id: str, roles: Optional[list[str]] = None) -> TokenResponse:
    """
    Create both access and refresh tokens.

    Args:
        user_id: User identifier
        roles: List of user roles

    Returns:
        TokenResponse with both tokens
    """
    access_token = create_access_token(subject=user_id, roles=roles)
    refresh_token = create_refresh_token(subject=user_id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def verify_token(token: str, expected_type: str = "access") -> TokenPayload:
    """
    Verify a token and optionally check its type.

    Args:
        token: JWT token string
        expected_type: Expected token type ("access" or "refresh")

    Returns:
        TokenPayload if valid

    Raises:
        JWTError: If token is invalid
    """
    payload = decode_token(token)

    if payload.type != expected_type:
        raise JWTError(f"Invalid token type. Expected {expected_type}, got {payload.type}")

    if payload.exp < datetime.now(timezone.utc):
        raise JWTError("Token has expired")

    return payload


def generate_secure_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure random token.

    Args:
        length: Token length in bytes

    Returns:
        Hex-encoded token string
    """
    import secrets

    return secrets.token_hex(length)


def sanitize_input(value: str) -> str:
    """
    Sanitize user input to prevent injection attacks.

    Args:
        value: Input string to sanitize

    Returns:
        Sanitized string
    """
    import html

    return html.escape(value.strip())


def validate_url(url: str) -> bool:
    """
    Validate a URL to prevent SSRF attacks.

    Args:
        url: URL to validate

    Returns:
        True if URL is safe, False otherwise
    """
    from urllib.parse import urlparse

    try:
        parsed = urlparse(url)
        # Only allow http and https schemes
        if parsed.scheme not in ("http", "https"):
            return False
        # Block private IPs and localhost
        hostname = parsed.hostname or ""
        blocked_hosts = {
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "::1",
            "169.254.169.254",  # AWS metadata
        }
        if hostname in blocked_hosts:
            return False
        # Block private IP ranges
        if hostname.startswith(("10.", "172.16.", "172.17.", "192.168.")):
            return False
        return True
    except (ValueError, AttributeError):
        return False

