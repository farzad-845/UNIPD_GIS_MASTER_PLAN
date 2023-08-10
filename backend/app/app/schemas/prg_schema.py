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


class IPrgStatusEnum(str, Enum):
    planned = "planned"
    approved = "approved"
    rejected = "rejected"
    in_progress = "in_progress"
