from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.common import PointGeometry, geometry_to_geojson


class HotspotBase(BaseModel):
    zone_id: Optional[int] = None
    severity_score: float = 0.0
    priority_score: float = 0.0
    estimated_quantity: float = 0.0
    status: str = "detected"


class HotspotCreate(HotspotBase):
    location: PointGeometry


class HotspotRead(HotspotBase):
    id: int
    location: Optional[Any] = None
    first_detected_at: datetime
    last_detected_at: datetime
    created_at: datetime
    updated_at: datetime

    @field_validator("location", mode="before")
    def serialize_geometry(cls, v: Any) -> Any:
        return geometry_to_geojson(v)

    model_config = ConfigDict(from_attributes=True)
