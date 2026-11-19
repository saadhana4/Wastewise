from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database.session import Base


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
    )
    severity_score = Column(Float, nullable=False, default=0.0)
    priority_score = Column(Float, nullable=False, default=0.0)
    estimated_quantity = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="detected")
    first_detected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_detected_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    zone = relationship("Zone", back_populates="hotspots")

    def __repr__(self) -> str:
        return f"<Hotspot id={self.id} zone_id={self.zone_id} status='{self.status}' severity={self.severity_score}>"
