from fastapi import APIRouter

from app.api.routes import auth, health, items, routes

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router)
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(routes.router, prefix="/routes", tags=["routes"])


