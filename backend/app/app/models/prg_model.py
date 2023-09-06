from typing import Any
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import String
from sqlalchemy_utils import ChoiceType
from sqlmodel import SQLModel, Field, Relationship, Column
from app.models.base_uuid_model import BaseUUIDModel

from app.schemas.common_schema import IPrgStatusEnum, IPrgTypeEnum
from app.utils.uuid6 import UUID


class PrgBase(SQLModel):
    db_id: int

    area: int
    id_area :int
    comparto: str

    sul: int = Field(default=0)

    scheda: str | None = None
    frazione:str | None = None
    articolo: str | None = None
    proprieta: str | None = None
    end_date: datetime | None = None


    status: IPrgStatusEnum = Field(
        default=IPrgStatusEnum.in_progress,
        sa_column=Column(ChoiceType(IPrgStatusEnum, impl=String())),
    )

    zona: IPrgTypeEnum | None = Field(
        sa_column=Column(ChoiceType(IPrgTypeEnum, impl=String()))
    )

    geom: Any = Field(sa_column=Column(Geometry("MULTIPOLYGON")))
    user_id: UUID | None = Field(default=None, foreign_key="User.id")



class Prg(BaseUUIDModel, PrgBase, table=True):
    notes: list["Note"] = Relationship(  # noqa: F821
        back_populates="prg", sa_relationship_kwargs={"lazy": "selectin"}
    )