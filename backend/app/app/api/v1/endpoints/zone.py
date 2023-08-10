# add new zone
# edit new zone attributes -> change the status of the zone (or the geometry of the zone)
# delete zone
# see the history of the zone, who created it, when, who changed it, when, who deleted it, when
from app.deps import zone_deps
from app.models.prg_model import Prg
from app.schemas.prg_schema import IPrgRead, IPrgCreate, IPrgUpdate


from fastapi import APIRouter, Depends, status
from app import crud
from app.api import deps
from app.models.user_model import User
from app.schemas.response_schema import (
    IGetResponseBase,
    IPostResponseBase,
    IPutResponseBase,
    create_response,
)
from app.schemas.role_schema import IRoleEnum

router = APIRouter()



@router.get("/{zone_id}")
async def get_zone_by_id(
        zone: Prg = Depends(zone_deps.get_zone_by_id),
        current_user: User = Depends(deps.get_current_user()),
) -> IGetResponseBase[IPrgRead]:
    """
    Gets a role by its id
    """
    return create_response(data=zone)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_zone(
        zone: IPrgCreate,
        current_user: User = Depends(
            deps.get_current_user(required_roles=[IRoleEnum.admin])
        ),
) -> IPostResponseBase[IPrgRead]:
    """
    Create a new role

    Required roles:
    - admin
    """
    # zone_current = await crud.role.get_role_by_name(name=role.name)
    # if zone_current:
    #     raise NameExistException(Prg, name=zone_current.name)

    new_zone = await crud.prg.create_variant(obj_in=zone)
    return create_response(data=new_zone)


@router.put("/{zone_id}")
async def update_zone(
        zone: IPrgUpdate,
        current_zone: Prg = Depends(zone_deps.get_zone_by_id),
        current_user: User = Depends(
            deps.get_current_user(required_roles=[IRoleEnum.admin])
        ),
) -> IPutResponseBase[IPrgRead]:
    """
    Updates a role by its id

    Required roles:
    - admin
    """
    # if current_role.name == role.name and current_role.description == role.description:
    #     raise ContentNoChangeException()

    # exist_zone = await crud.role.get_role_by_name(name=zone.name)
    # if exist_role:
    #     raise NameExistException(Role, name=role.name)

    updated_zone = await crud.prg.update_variant(obj_current=current_zone, obj_new=zone)
    return create_response(data=updated_zone)
