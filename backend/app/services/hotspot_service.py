from typing import List, Optional
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
import shapely.geometry
from app.models.hotspot import Hotspot
from app.schemas.hotspot import HotspotCreate


class HotspotService:
    @staticmethod
    def get_all(
        db: Session,
        zone_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Hotspot]:
        query = db.query(Hotspot)
        if zone_id is not None:
            query = query.filter(Hotspot.zone_id == zone_id)
        if status is not None:
            query = query.filter(Hotspot.status == status)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, hotspot_id: int) -> Optional[Hotspot]:
        return db.query(Hotspot).filter(Hotspot.id == hotspot_id).first()

    @staticmethod
    def create(db: Session, data: HotspotCreate) -> Hotspot:
        pt = shapely.geometry.Point(data.location.coordinates[0], data.location.coordinates[1])
        wkt = WKTElement(pt.wkt, srid=4326)

        hotspot = Hotspot(
            zone_id=data.zone_id,
            location=wkt,
            severity_score=data.severity_score,
            priority_score=data.priority_score,
            estimated_quantity=data.estimated_quantity,
            status=data.status,
        )
        db.add(hotspot)
        db.commit()
        db.refresh(hotspot)
        return hotspot
