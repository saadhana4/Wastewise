from fastapi import APIRouter
from app.api.routes import health, zones, hotspots, vehicles, waste_categories

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(zones.router, tags=["Zones"])
api_router.include_router(hotspots.router, tags=["Hotspots"])
api_router.include_router(vehicles.router, tags=["Vehicles"])
api_router.include_router(waste_categories.router, tags=["Waste Categories"])
