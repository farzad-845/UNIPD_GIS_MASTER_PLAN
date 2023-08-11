from typing import Any

from geoalchemy2 import Geometry
from sqlalchemy import String
from sqlalchemy_utils import ChoiceType
from sqlmodel import SQLModel, Field, Relationship, Column
from app.models.base_uuid_model import BaseUUIDModel
from sqlalchemy_history import make_versioned

from app.schemas.common_schema import IPrgStatusEnum, IPrgTypeEnum


class PrgBase(SQLModel):
    status: IPrgStatusEnum = Field(
        default=IPrgStatusEnum.in_progress,
        sa_column=Column(ChoiceType(IPrgStatusEnum, impl=String())),
    )

    land_type: IPrgTypeEnum | None = Field(
        sa_column=Column(ChoiceType(IPrgTypeEnum, impl=String()))
    )

    geom: Any = Field(sa_column=Column(Geometry("MULTIPOLYGON")))

class Prg(BaseUUIDModel, PrgBase, table=True):
    notes: list["Note"] = Relationship(  # noqa: F821
        back_populates="note", sa_relationship_kwargs={"lazy": "selectin"}
    )

