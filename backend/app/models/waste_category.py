from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.session import Base


class WasteCategory(Base):
    __tablename__ = "waste_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    recyclable = Column(Boolean, default=False, nullable=False)
    handling_type = Column(String(50), nullable=False, default="standard")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<WasteCategory id={self.id} name='{self.name}' recyclable={self.recyclable}>"
