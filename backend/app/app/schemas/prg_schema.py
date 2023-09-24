from enum import Enum

from app.models.prg_model import PrgBase
from app.utils.partial import optional
from uuid import UUID


class IPrgCreate(PrgBase):
    pass


# All these fields are optional
@optional
class IPrgUpdate(PrgBase):
    pass


class IPrgRead(PrgBase):
    id: UUID

class IPrgReadWithWKT(PrgBase):
    id: UUID
    wkt: str | None = None

