from typing import Optional, Any

from geoalchemy2 import Geometry
from sqlalchemy import Column
from sqlmodel import SQLModel, Field, Relationship

from app.utils.uuid6 import UUID
from app.models import ImageMedia
from app.models.base_uuid_model import BaseUUIDModel


class NoteBase(SQLModel):
    description: str
    is_public: bool = Field(default=False)
    user_id: UUID | None = Field(default=None, foreign_key="User.id")
    prg_id: UUID | None = Field(default=None, foreign_key="Prg.id", nullable=True)
    geom: Any | None = Field(sa_column=Column(Geometry("MULTIPOLYGON")), nullable=True)


class Note(BaseUUIDModel, NoteBase, table=True):
    prg: Optional["Prg"] = Relationship(  # noqa: F821
        back_populates="notes", sa_relationship_kwargs={"lazy": "joined"}
    )

    user: Optional["User"] = Relationship(  # noqa: F821
        back_populates="notes", sa_relationship_kwargs={"lazy": "joined"}
    )

    image_id: UUID | None = Field(default=None, foreign_key="ImageMedia.id")
    image: ImageMedia = Relationship(
        sa_relationship_kwargs={
            "lazy": "joined",
            "primaryjoin": "Note.image_id==ImageMedia.id",
        }
    )
