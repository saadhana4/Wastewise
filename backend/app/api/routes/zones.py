import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.zone import ZoneRead, ZoneCreate
from app.services.zone_service import ZoneService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/zones", response_model=List[ZoneRead])
def list_zones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all municipal zones and boundaries.
    """
    try:
        return ZoneService.get_all(db, skip=skip, limit=limit)
    except Exception as exc:
        logger.error(f"Database query failed in list_zones: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database offline: Unable to query zones ({exc})",
        )


@router.post("/zones", response_model=ZoneRead, status_code=status.HTTP_201_CREATED)
def create_zone(payload: ZoneCreate, db: Session = Depends(get_db)):
    """
    Create a new operational zone with PostGIS boundary polygon.
    """
    try:
        return ZoneService.create(db, payload)
    except Exception as exc:
        logger.error(f"Error creating zone: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create zone: {str(exc)}",
        )
