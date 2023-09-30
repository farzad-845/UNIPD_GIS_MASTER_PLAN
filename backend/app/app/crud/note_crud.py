from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.note_model import Note
from app.schemas.media_schema import IMediaCreate
from app.schemas.note_schema import INoteCreate, INoteUpdate, INoteReadWithWKT
from app.models.media_model import Media
from app.models.image_media_model import ImageMedia
from app.crud.base_crud import CRUDBase
from app.utils.minio_client import MinioClient
from app.utils.uuid6 import UUID



class CRUDNote(CRUDBase[Note, INoteCreate, INoteUpdate]):
    async def get_notes_with_geometry(
            self, *, minio: MinioClient, is_admin: bool = False, db_session: AsyncSession | None = None
    ):
        db_session = db_session or self.db.session
        if not is_admin:
            raw_query = 'SELECT "Note".*, "Media".*, "ImageMedia".*, ST_AsText("Note".geom) AS wkt FROM "Note" LEFT JOIN "ImageMedia" ON "Note".image_id = "ImageMedia".id LEFT JOIN "Media" ON "ImageMedia".media_id = "Media".id WHERE "Note".geom IS NOT NULL AND is_public IS TRUE;'
        else:
            raw_query = 'SELECT "Note".*, "Media".*, "ImageMedia".*, ST_AsText("Note".geom) AS wkt FROM "Note" LEFT JOIN "ImageMedia" ON "Note".image_id = "ImageMedia".id LEFT JOIN "Media" ON "ImageMedia".media_id = "Media".id WHERE "Note".geom IS NOT NULL;'
        response = await db_session.execute(raw_query)
        return [
            {**dict(row), 'path': minio.presigned_get_object(
                bucket_name=settings.MINIO_BUCKET, object_name=row.path
            ) if row.path else None}
            for row in response
        ]

    async def get_notes_with_geometry_by_id(
            self, *,id: UUID | str, db_session: AsyncSession | None = None
    ) -> INoteReadWithWKT:
        db_session = db_session or self.db.session
        raw_query = 'SELECT *, ST_AsText("Note".geom) AS wkt FROM "Note" WHERE id=' + f"'{id}'"
        response = await db_session.execute(raw_query)
        for row in response:
            return row

    async def make_note_public(
            self,
            *,
            note: Note,
    ) -> None:
        db_session = super().get_db().session
        note.is_public = True
        db_session.add(note)
        await db_session.commit()
        await db_session.refresh(note)
        return None

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
