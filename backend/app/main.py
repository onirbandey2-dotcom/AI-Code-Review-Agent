"""
CodeSage AI - Main Application
Enterprise-grade FastAPI application with middleware, routing, and configuration.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict, Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.core.database import check_db_health, init_db
from app.core.exceptions import CodeSageException, exception_to_http
from app.core.logging import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifecycle manager.
    
    Handles startup and shutdown events for the application.
    """
    # Startup
    setup_logging()
    logger.info(
        "Starting CodeSage AI",
        extra={
            "environment": settings.ENVIRONMENT.value,
            "version": settings.APP_VERSION,
        },
    )
    
    # Initialize database
    try:
        await init_db()
        db_healthy = await check_db_health()
        logger.info("Database health check", extra={"healthy": db_healthy})
    except Exception as e:
        logger.error("Database initialization failed", extra={"error": str(e)})
    
    yield
    
    # Shutdown
    logger.info("Shutting down CodeSage AI")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    Enterprise AI-Powered Code Review Platform.
    
    ## Features
    * **Security Analysis** - OWASP Top 10, SAST, secrets detection
    * **Code Quality** - Complexity metrics, duplication, code smells
    * **AI Review** - LLM-powered code review with explanations
    * **Test Generation** - Automatic unit test generation
    * **Knowledge Base** - RAG-powered semantic search
    * **AI Chat** - Natural language codebase queries
    
    ## Authentication
    All API endpoints require JWT authentication via Bearer token.
    Use the `/auth/github` endpoint for GitHub OAuth login.
    """,
    contact={
        "name": "CodeSage AI Team",
        "url": "https://codesage.ai",
        "email": "team@codesage.ai",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs" if settings.ENVIRONMENT.value != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT.value != "production" else None,
    lifespan=lifespan,
)


# ──────────────────────────────────────────────
# Middleware Configuration
# ──────────────────────────────────────────────

# CORS
print("CORS_ORIGINS =", settings.CORS_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "X-Correlation-ID",
    ],
    expose_headers=[
        "X-Request-ID",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],
)

# Trusted Hosts
if settings.ENVIRONMENT.value == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.CORS_ORIGINS,
    )


# ──────────────────────────────────────────────
# Exception Handlers
# ──────────────────────────────────────────────

@app.exception_handler(CodeSageException)
async def codesage_exception_handler(
    request: Request,
    exc: CodeSageException,
) -> JSONResponse:
    """Handle custom application exceptions."""
    http_exc = exception_to_http(exc)
    logger.error(
        "Application error",
        extra={
            "error_code": exc.code,
            "message": exc.message,
            "path": request.url.path,
            "method": request.method,
        },
    )
    return JSONResponse(
        status_code=http_exc.status_code,
        content={
            "error": exc.code,
            "message": exc.message,
            "details": exc.details,
            "path": request.url.path,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """Handle unhandled exceptions."""
    logger.error(
        "Unhandled exception",
        extra={
            "error": str(exc),
            "path": request.url.path,
            "method": request.method,
        },
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
            "path": request.url.path,
        },
    )


# ──────────────────────────────────────────────
# Health Check Endpoints
# ──────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check() -> Dict[str, Any]:
    """Comprehensive health check endpoint."""
    db_healthy = await check_db_health()
    health_status = {
        "status": "healthy" if db_healthy else "degraded",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT.value,
        "checks": {
            "database": "healthy" if db_healthy else "unhealthy",
        },
        "uptime": None,  # TODO: Track application uptime
    }
    return health_status


@app.get("/ready", tags=["System"])
async def readiness_check() -> Dict[str, str]:
    """Readiness probe endpoint."""
    return {"status": "ready"}


@app.get("/api/v1", tags=["System"])
async def api_root() -> Dict[str, Any]:
    """API root endpoint with version info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT.value,
        "documentation": "/docs",
    }


# ──────────────────────────────────────────────
# OpenAPI Customization
# ──────────────────────────────────────────────

def custom_openapi() -> Dict[str, Any]:
    """Generate custom OpenAPI schema with security definitions."""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=app.description,
        routes=app.routes,
    )
    
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token",
        },
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key for programmatic access",
        },
    }
    
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    # Add tags
    openapi_schema["tags"] = [
        {"name": "System", "description": "System health and monitoring"},
        {"name": "Authentication", "description": "GitHub OAuth and JWT authentication"},
        {"name": "Repositories", "description": "Repository management"},
        {"name": "Reviews", "description": "Pull request reviews"},
        {"name": "Analysis", "description": "Security and quality analysis"},
        {"name": "AI", "description": "AI-powered code review and chat"},
        {"name": "Knowledge Base", "description": "Documentation and standards"},
        {"name": "Dashboard", "description": "Metrics and statistics"},
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi  # type: ignore


# ──────────────────────────────────────────────
# API Router Imports
# ──────────────────────────────────────────────

from app.api.v1.router import api_v1_router

app.include_router(api_v1_router)