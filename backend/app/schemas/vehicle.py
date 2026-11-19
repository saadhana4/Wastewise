from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.common import PointGeometry, geometry_to_geojson


class VehicleBase(BaseModel):
    registration_number: str
    vehicle_type: str
    capacity_kg: float
    status: str = "available"


class VehicleCreate(VehicleBase):
    current_location: Optional[PointGeometry] = None


class VehicleRead(VehicleBase):
    id: int
    current_location: Optional[Any] = None
    created_at: datetime

    @field_validator("current_location", mode="before")
    def serialize_geometry(cls, v: Any) -> Any:
        return geometry_to_geojson(v)

    model_config = ConfigDict(from_attributes=True)
