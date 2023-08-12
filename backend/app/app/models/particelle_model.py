from typing import Any

from geoalchemy2 import Geometry
from sqlalchemy import String
from sqlalchemy_utils import ChoiceType
from sqlmodel import SQLModel, Field, Column

from app.schemas.common_schema import IParticelleLivelloEnum
from app.utils.uuid6 import UUID
from app.models.base_uuid_model import BaseUUIDModel


class ParticelleBase(SQLModel):
    comune:	str
    sezione: int | None = None
    foglio:	str | None = None
    allegato: str | None = None
    sviluppo: str | None = None
    numero:	str | None = None
    livello: IParticelleLivelloEnum = Field(
        default=IParticelleLivelloEnum.particelle,
        sa_column=Column(ChoiceType(IParticelleLivelloEnum, impl=String())),
    )
    geom: Any = Field(sa_column=Column(Geometry("MULTIPOLYGON")))


class Particelle(BaseUUIDModel, ParticelleBase, table=True):
    pass
