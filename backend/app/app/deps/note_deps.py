from typing import Annotated

from fastapi import Path

from app import crud
from app.models.note_model import Note
from app.utils.exceptions import IdNotFoundException
from app.utils.uuid6 import UUID


async def get_note_by_id(
    note_id: Annotated[UUID, Path(title="The UUID id of the note")]
) -> Note:
    note = await crud.note.get(id=note_id)
    if not note:
        raise IdNotFoundException(Note, id=note_id)
    return note
