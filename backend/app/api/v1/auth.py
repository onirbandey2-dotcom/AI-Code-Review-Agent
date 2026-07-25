"""
Auth API router.
Handles signup, login, GitHub OAuth, password reset, token refresh, logout.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.core.security import (
    TokenResponse as SecurityTokenResponse,
    create_token_pair,
    decode_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.models.user import User, UserRole
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    GitHubAuthRequest,
    GitHubAuthUrlResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignUpRequest,
    SignUpResponse,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username."""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid authorization header")

    token = auth_header.replace("Bearer ", "")
    try:
        payload = verify_token(token, expected_type="access")
        user = await get_user_by_id(db, UUID(payload.sub))
        if not user:
            raise UnauthorizedException("User not found")
        if not user.is_active:
            raise UnauthorizedException("User account is disabled")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise UnauthorizedException(str(e))


@router.post("/signup", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignUpRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if email already exists
    existing_email = await get_user_by_email(db, request.email)
    if existing_email:
        raise ConflictException("User with this email already exists")

    # Check if username already exists
    existing_username = await get_user_by_username(db, request.username)
    if existing_username:
        raise ConflictException("Username already taken")

    # Create user
    user = User(
        email=request.email,
        username=request.username,
        display_name=request.display_name or request.username,
        hashed_password=hash_password(request.password),
        role=UserRole.DEVELOPER,
        is_active=True,
        is_email_verified=False,
    )

    db.add(user)
    await db.flush()
    await db.refresh(user)

    return SignUpResponse(
        message="Account created successfully. Please check your email to verify your account.",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user with email and password."""
    user = await get_user_by_email(db, request.email)
    if not user:
        raise UnauthorizedException("Invalid email or password")

    if not user.hashed_password:
        raise UnauthorizedException(
            "This account uses GitHub OAuth. Please sign in with GitHub."
        )

    if not verify_password(request.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedException("User account is disabled")

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()

    # Generate tokens
    tokens = create_token_pair(str(user.id), roles=[user.role.value])

    return LoginResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        expires_in=tokens.expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post("/github", response_model=LoginResponse)
async def github_login(request: GitHubAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with GitHub OAuth code."""
    # This is a placeholder - in production, exchange code for GitHub access token
    # and fetch user info from GitHub API
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth integration requires GitHub App configuration",
    )


@router.get("/github/url", response_model=GitHubAuthUrlResponse)
async def get_github_auth_url():
    """Get GitHub OAuth authorization URL."""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth is not configured",
        )

    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope=read:user,user:email,repo"
        f"&state={secrets.token_urlsafe(16)}"
    )

    return GitHubAuthUrlResponse(url=url)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    try:
        payload = verify_token(request.refresh_token, expected_type="refresh")
        user = await get_user_by_id(db, UUID(payload.sub))
        if not user or not user.is_active:
            raise UnauthorizedException("Invalid refresh token")

        tokens = create_token_pair(str(user.id), roles=[user.role.value])
        return TokenResponse(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
            expires_in=tokens.expires_in,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise UnauthorizedException(f"Invalid refresh token: {str(e)}")


@router.post("/forgot-password", response_model=AuthResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send password reset email."""
    user = await get_user_by_email(db, request.email)
    if not user:
        # Don't reveal whether the email exists or not
        return AuthResponse(
            message="If an account with that email exists, we've sent password reset instructions."
        )

    # Generate reset token (in production, store this in DB with expiry)
    reset_token = secrets.token_urlsafe(32)
    # TODO: Store reset token in database with expiry
    # TODO: Send email with reset link

    return AuthResponse(
        message="If an account with that email exists, we've sent password reset instructions."
    )


@router.post("/reset-password", response_model=AuthResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using reset token."""
    # TODO: Validate reset token from database
    # TODO: Update user password
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password reset requires email configuration",
    )


@router.post("/logout", response_model=AuthResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token invalidation)."""
    # In a stateless JWT setup, logout is handled client-side by discarding tokens.
    # For enhanced security, you could blacklist tokens here.
    return AuthResponse(message="Logged out successfully")

