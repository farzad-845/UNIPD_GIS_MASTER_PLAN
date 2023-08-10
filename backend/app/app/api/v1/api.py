from fastapi import APIRouter
from app.api.v1.endpoints import (
    user,
    hero,
    zone,
    login,
    role,
    note,
    cache,
    report,
)

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(role.router, prefix="/role", tags=["role"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(hero.router, prefix="/hero", tags=["hero"])
api_router.include_router(cache.router, prefix="/cache", tags=["cache"])
api_router.include_router(report.router, prefix="/report", tags=["report"])
api_router.include_router(zone.router, prefix="/zone", tags=["zone"])
api_router.include_router(note.router, prefix="/note", tags=["note"])