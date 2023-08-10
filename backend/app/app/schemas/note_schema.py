from app.models.note_model import NoteBase
from app.schemas.image_media_schema import IImageMediaReadCombined
from app.utils.partial import optional
from uuid import UUID


class INoteCreate(NoteBase):
    pass


# All these fields are optional
@optional
class INoteUpdate(NoteBase):
    pass


class INoteRead(NoteBase):
    id: UUID
    image: IImageMediaReadCombined | None
