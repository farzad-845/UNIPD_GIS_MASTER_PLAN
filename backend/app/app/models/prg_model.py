from typing import Any

from geoalchemy2 import Geometry
from pydantic import Field
from sqlalchemy import Column
from sqlmodel import SQLModel
from app.models.base_uuid_model import BaseUUIDModel
from sqlalchemy_history import make_versioned

from app.schemas.prg_schema import IPrgStatusEnum


class PrgBase(SQLModel):
    status: str = Field(default=IPrgStatusEnum.in_progress)
    geom: Any = Field(sa_column=Column(Geometry("MULTIPOLYGON")))


make_versioned(user_cls=None)


class Prg(BaseUUIDModel, PrgBase, table=True):
    __versioned__ = {}
