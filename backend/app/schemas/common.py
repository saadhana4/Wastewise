from typing import List, Tuple, Optional, Any, Literal
from pydantic import BaseModel, Field
from geoalchemy2.shape import to_shape
import shapely.geometry


class PointGeometry(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: List[float] = Field(
        ...,
        description="Geographic coordinates in [longitude, latitude] order (WGS84 EPSG:4326)",
        examples=[[77.5946, 12.9716]],
    )


class PolygonGeometry(BaseModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: List[List[List[float]]] = Field(
        ...,
        description="List of linear rings where first and last coordinate must match (WGS84 EPSG:4326)",
    )


def geometry_to_geojson(geom: Any) -> Optional[dict]:
    """
    Safely converts a GeoAlchemy2 WKBElement or Shapely object to a GeoJSON dict.
    """
    if geom is None:
        return None
    try:
        if hasattr(geom, "data"):
            # GeoAlchemy2 WKBElement
            shape = to_shape(geom)
            return shapely.geometry.mapping(shape)
        elif hasattr(geom, "geom_type"):
            return shapely.geometry.mapping(geom)
        elif isinstance(geom, dict):
            return geom
    except Exception:
        pass
    return None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: Optional[str] = "1.0.0"
    environment: Optional[str] = "development"
    database: Optional[dict] = None
