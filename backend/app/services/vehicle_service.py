from typing import List, Optional
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
import shapely.geometry
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate


class VehicleService:
    @staticmethod
    def get_all(
        db: Session,
        status: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Vehicle]:
        query = db.query(Vehicle)
        if status is not None:
            query = query.filter(Vehicle.status == status)
        if vehicle_type is not None:
            query = query.filter(Vehicle.vehicle_type == vehicle_type)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, vehicle_id: int) -> Optional[Vehicle]:
        return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    @staticmethod
    def create(db: Session, data: VehicleCreate) -> Vehicle:
        loc_wkt = None
        if data.current_location is not None:
            pt = shapely.geometry.Point(
                data.current_location.coordinates[0],
                data.current_location.coordinates[1],
            )
            loc_wkt = WKTElement(pt.wkt, srid=4326)

        vehicle = Vehicle(
            registration_number=data.registration_number,
            vehicle_type=data.vehicle_type,
            capacity_kg=data.capacity_kg,
            status=data.status,
            current_location=loc_wkt,
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle
