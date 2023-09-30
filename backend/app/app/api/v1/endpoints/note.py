# get notes by created_by (last year notes)
# get notes by zone_id, see all notes from this user (based on user privileges)

from io import BytesIO
from operator import and_
from typing import Dict

from app import api
from app.deps import note_deps
from app.utils.resize_image import modify_image
from fastapi import (
    Body,
    File,
    Response,
    HTTPException,
)
from app.schemas.media_schema import IMediaCreate

from sqlmodel import select
from app.models.note_model import Note
from app.schemas.note_schema import INoteRead, INoteCreate, INoteUpdate, INoteReadWithWKT

from fastapi import APIRouter, Depends, status, UploadFile
from fastapi_pagination import Params
from app import crud
from app.api import deps
from app.models.user_model import User
from app.schemas.response_schema import (
    IGetResponsePaginated,
    IPostResponseBase,
    IPutResponseBase,
    create_response,
)
from app.schemas.role_schema import IRoleEnum
from app.utils.minio_client import MinioClient
from app.utils.uuid6 import UUID

router = APIRouter()


@router.get("/prg")
async def get_notes(
        params: Params = Depends(),
        current_user: User = Depends(deps.get_current_user()),
) -> IGetResponsePaginated[INoteRead]:
    """
    Gets a paginated list of notes based on user privileges
    """
    if current_user.role.name in [IRoleEnum.admin, IRoleEnum.manager]:
        query = select(Note).where(Note.geom.is_(None))
        notes = await crud.note.get_multi_paginated(params=params, query=query)
    else:
        query = select(Note).where(Note.is_public == True and Note.geom.is_(None))
        notes = await crud.note.get_multi_paginated(params=params, query=query)
    return create_response(data=notes)

@router.get("/")
async def get_notes(
        params: Params = Depends(),
        current_user: User = Depends(deps.get_current_user()),
):
    """
    Gets a paginated list of notes based on user privileges
    """
    minio: MinioClient = api.deps.minio_auth()
    if current_user.role.name in [IRoleEnum.admin, IRoleEnum.manager]:
        notes = await crud.note.get_notes_with_geometry(minio=minio, is_admin=True)
    else:
        notes = await crud.note.get_notes_with_geometry(minio=minio, is_admin=False)
    return notes

@router.get("/user/{user_id}")
async def get_note_by_user_id(
        user_id: UUID,
        current_user: User = Depends(deps.get_current_user()),
) -> IGetResponsePaginated[INoteRead]:
    """
    Gets Notes by its user id
    """
    query = select(Note).where(Note.user_id == user_id)
    notes = await crud.note.get_multi_paginated(query=query)
    return create_response(data=notes)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_note(
        note: INoteCreate,
        current_user: User = Depends(deps.get_current_user()),
) -> IPostResponseBase[INoteRead] | IPostResponseBase[INoteReadWithWKT]:
    """
    Create a new Note
    """
    note.user_id = current_user.id
    new_note = await crud.note.create(obj_in=note)
    if new_note.geom is not None:
        response = await crud.note.get_notes_with_geometry_by_id(id=new_note.id)
        return create_response(data=response)
    return create_response(data=new_note)


@router.put("/{note_id}")
async def update_note(
        current_note: Note = Depends(note_deps.get_note_by_id),
        current_user: User = Depends(
            deps.get_current_user(required_roles=[IRoleEnum.admin, IRoleEnum.manager])
        ),
) -> dict[str, str]:
    """
    Updates a Note by its id

    Required roles:
    - admin
    - manager
    """
    await crud.note.make_note_public(note=current_note)
    return {"message": "Note updated successfully"}


@router.post("/{note_id}/image")
async def upload_note_image(
        note: Note = Depends(note_deps.get_note_by_id),
        title: str | None = Body(None),
        description: str | None = Body(None),
        image_file: UploadFile = File(...),
        current_user: User = Depends(deps.get_current_user()),
        minio_client: MinioClient = Depends(deps.minio_auth),
) -> IPostResponseBase[INoteRead]:
    """
    Uploads a note image by his/her id
    """
    if current_user.id != note.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload image for this note",
        )
    try:
        image_modified = modify_image(BytesIO(image_file.file.read()))
        data_file = minio_client.put_object(
            file_name=image_file.filename,
            file_data=BytesIO(image_modified.file_data),
            content_type=image_file.content_type,
        )
        media = IMediaCreate(
            title=title, description=description, path=data_file.file_name
        )
        note = await crud.note.update_photo(
            note=note,
            image=media,
            height=image_modified.height,
            width=image_modified.width,
            file_format=image_modified.file_format,
        )
        note.geom = None
        return create_response(data=note)
    except Exception as e:
        print(e)
        return Response("Internal server error", status_code=500)


@router.get("/zone/{zone_id}")
async def get_notes(
        zone_id: UUID,
        params: Params = Depends(),
        current_user: User = Depends(deps.get_current_user()),
) -> IGetResponsePaginated[INoteRead]:
    """
    Gets a paginated list of notes based on zone_id
    """
    query = select(Note).where(Note.prg_id == zone_id)
    if current_user.role.name in [IRoleEnum.admin, IRoleEnum.manager]:
        notes = await crud.note.get_multi_paginated(params=params, query=query)
    else:
        query = select(Note).where(and_(Note.is_public == True, Note.prg_id == zone_id))
        notes = await crud.note.get_multi_paginated(params=params, query=query)
    return create_response(data=notes)
