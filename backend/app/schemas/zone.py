from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.common import PolygonGeometry, geometry_to_geojson


class ZoneBase(BaseModel):
    name: str
    description: Optional[str] = None


class ZoneCreate(ZoneBase):
    boundary: PolygonGeometry


class ZoneRead(ZoneBase):
    id: int
    boundary: Optional[Any] = None
    created_at: datetime

    @field_validator("boundary", mode="before")
    def serialize_geometry(cls, v: Any) -> Any:
        return geometry_to_geojson(v)

    model_config = ConfigDict(from_attributes=True)
