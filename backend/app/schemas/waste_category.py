from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class WasteCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    recyclable: bool = False
    handling_type: str = "standard"


class WasteCategoryCreate(WasteCategoryBase):
    pass


class WasteCategoryRead(WasteCategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
