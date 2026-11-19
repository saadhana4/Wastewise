from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.ADMIN
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
