"""Quick test script to verify database configuration and full app startup."""
import sys
sys.path.insert(0, '.')

from app.core.config import settings

print(f"is_postgresql: {settings.is_postgresql}")
print(f"is_sqlite: {settings.is_sqlite}")
print(f"DATABASE_URL: {settings.DATABASE_URL}")
print(f"DATABASE_POOL_SIZE: {settings.DATABASE_POOL_SIZE}")
print(f"DATABASE_MAX_OVERFLOW: {settings.DATABASE_MAX_OVERFLOW}")
print(f"DATABASE_POOL_TIMEOUT: {settings.DATABASE_POOL_TIMEOUT}")
print(f"DATABASE_ECHO: {settings.DATABASE_ECHO}")

# Test engine creation
from app.core.database import engine
print(f"Engine: {engine}")

# Test full app import
from app.main import app
print(f"FastAPI app: {app.title} v{app.version}")
print(f"Routes: {len(app.routes)}")

print("\nAll tests passed! Backend starts successfully without errors.")

