from uuid import UUID
from app.utils.uuid6 import uuid7
from pydantic import BaseModel, validator
from enum import Enum
from app.schemas.role_schema import IRoleRead


class IMetaGeneral(BaseModel):
    roles: list[IRoleRead]


class IOrderEnum(str, Enum):
    ascendent = "ascendent"
    descendent = "descendent"


class TokenType(str, Enum):
    ACCESS = "access_token"
    REFRESH = "refresh_token"


class IPrgStatusEnum(str, Enum):
    planned = "planned"
    approved = "approved"
    rejected = "rejected"
    in_progress = "in_progress"


class IPrgTypeEnum(str, Enum):
    commercial = "commercial"
    industrial = "industrial"
    residential = "residential"
    public_green = "public green"


class IParticelleLivelloEnum(str, Enum):
    strade = "STRADE"
    particelle = "PARTICELLE"
