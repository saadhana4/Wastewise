import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.vehicle import VehicleRead, VehicleCreate
from app.services.vehicle_service import VehicleService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/vehicles", response_model=List[VehicleRead])
def list_vehicles(
    vehicle_type: Optional[str] = Query(None, description="Filter by vehicle type"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by operational status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve registered municipal waste collection vehicles and last known coordinates.
    """
    try:
        return VehicleService.get_all(db, vehicle_type=vehicle_type, status=status_filter, skip=skip, limit=limit)
    except Exception as exc:
        logger.error(f"Database query failed in list_vehicles: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database offline: Unable to query vehicles ({exc})",
        )


@router.post("/vehicles", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    """
    Register a collection vehicle.
    """
    try:
        return VehicleService.create(db, payload)
    except Exception as exc:
        logger.error(f"Error creating vehicle: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create vehicle: {str(exc)}",
        )
