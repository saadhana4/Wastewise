from typing import List, Optional
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
import shapely.geometry
from app.models.zone import Zone
from app.schemas.zone import ZoneCreate


class ZoneService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Zone]:
        return db.query(Zone).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, zone_id: int) -> Optional[Zone]:
        return db.query(Zone).filter(Zone.id == zone_id).first()

    @staticmethod
    def create(db: Session, data: ZoneCreate) -> Zone:
        # Convert GeoJSON coordinates to Shapely Polygon, then WKTElement for PostGIS
        poly = shapely.geometry.Polygon(data.boundary.coordinates[0])
        wkt = WKTElement(poly.wkt, srid=4326)
        
        zone = Zone(
            name=data.name,
            description=data.description,
            boundary=wkt,
        )
        db.add(zone)
        db.commit()
        db.refresh(zone)
        return zone
