from app.models.note_model import Note
from app.schemas.media_schema import IMediaCreate
from app.schemas.note_schema import INoteCreate, INoteUpdate
from app.models.user_model import User
from app.models.media_model import Media
from app.models.image_media_model import ImageMedia
from app.core.security import verify_password
from pydantic.networks import EmailStr
from app.crud.base_crud import CRUDBase


class CRUDNote(CRUDBase[Note, INoteCreate, INoteUpdate]):

    async def update_photo(
        self,
        *,
        note: Note,
        image: IMediaCreate,
        height: int,
        width: int,
        file_format: str,
    ) -> Note:
        db_session = super().get_db().session
        note.image = ImageMedia(
            media=Media.from_orm(image),
            height=height,
            width=width,
            file_format=file_format,
        )
        db_session.add(note)
        await db_session.commit()
        await db_session.refresh(note)
        return note


note = CRUDNote(Note)