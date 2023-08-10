from app.utils.partial import optional
from app.models.user_model import UserBase
from pydantic import BaseModel
from uuid import UUID
from enum import Enum
from .image_media_schema import IImageMediaReadCombined
from .role_schema import IRoleRead


class IUserCreate(UserBase):
    password: str | None

    class Config:
        hashed_password = None


# All these fields are optional
@optional
class IUserUpdate(UserBase):
    pass



class IUserRead(UserBase):
    id: UUID
    role: IRoleRead | None = None
    image: IImageMediaReadCombined | None


class IUserBasicInfo(BaseModel):
    id: UUID
    first_name: str
    last_name: str


class IUserStatus(str, Enum):
    active = "active"
    inactive = "inactive"
