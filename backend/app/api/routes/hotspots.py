import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.hotspot import HotspotRead, HotspotCreate
from app.services.hotspot_service import HotspotService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/hotspots", response_model=List[HotspotRead])
def list_hotspots(
    zone_id: Optional[int] = Query(None, description="Filter by municipal zone ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by hotspot status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve waste accumulation hotspots with geographic point coordinates and severity.
    """
    try:
        return HotspotService.get_all(db, zone_id=zone_id, status=status_filter, skip=skip, limit=limit)
    except Exception as exc:
        logger.error(f"Database query failed in list_hotspots: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database offline: Unable to query hotspots ({exc})",
        )


@router.get("/hotspots/{hotspot_id}", response_model=HotspotRead)
def get_hotspot(hotspot_id: int, db: Session = Depends(get_db)):
    """
    Retrieve single hotspot details by ID.
    """
    try:
        hotspot = HotspotService.get_by_id(db, hotspot_id)
    except Exception as exc:
        logger.error(f"Database query failed in get_hotspot: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database offline: Unable to retrieve hotspot ({exc})",
        )

    if not hotspot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hotspot with ID {hotspot_id} not found",
        )
    return hotspot


@router.post("/hotspots", response_model=HotspotRead, status_code=status.HTTP_201_CREATED)
def create_hotspot(payload: HotspotCreate, db: Session = Depends(get_db)):
    """
    Register a waste hotspot with location coordinates.
    """
    try:
        return HotspotService.create(db, payload)
    except Exception as exc:
        logger.error(f"Error creating hotspot: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create hotspot: {str(exc)}",
        )
