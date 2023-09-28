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
    strada = "strada"
    B12 = "B1.2"
    P2_es = "P2_es"
    F1 = "F1"
    B11 = "B1.1"
    D1 = "D1"
    P6 = "P6"
    Dsna = "Dsna"
    B31 = "B3.1"
    F3 = "F3"
    P4 = "P4"
    P4_es = "P4_es"
    ferrovia = "ferrovia"
    D3 = "D3"
    P5 = "P5"
    F5_IC = "F5_IC"
    cal = "canale albani"
    F5_M = "F5_M"
    A = "A"
    D5 = "D5"
    B23 = "B2.3"
    STRADE = "STRADE"
    PARTICELLE = "PARTICELLE"


class IParticelleLivelloEnum(str, Enum):
    strade = "STRADE"
    particelle = "PARTICELLE"
