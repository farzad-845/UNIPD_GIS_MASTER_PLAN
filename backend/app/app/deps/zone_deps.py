from typing import Annotated

from fastapi import Path

from app import crud
from app.models.note_model import Note
from app.models.prg_model import Prg
from app.utils.exceptions import IdNotFoundException
from app.utils.uuid6 import UUID


async def get_zone_by_id(
        zone_id: Annotated[UUID, Path(title="The UUID id of the zone")]
) -> Prg:
    zone = await crud.note.get(id=zone_id)
    if not zone:
        raise IdNotFoundException(Note, id=zone_id)
    return zone
