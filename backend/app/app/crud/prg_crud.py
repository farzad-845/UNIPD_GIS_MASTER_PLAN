from typing import Any

from fastapi.encoders import jsonable_encoder

from app.models.prg_model import Prg
from app.crud.base_crud import CRUDBase
from app.schemas.prg_schema import IPrgUpdate, IPrgCreate


class CRUDPrg(CRUDBase[Prg, IPrgCreate, IPrgUpdate]):
    async def create_variant(
        self,
        *,
        obj_in,
    ) -> Prg:
        pass

    async def update_variant(
        self,
        obj_current: Prg,
        obj_new: IPrgUpdate | dict[str, Any] | Prg,
    ) -> Prg:
        db_session = super().get_db().session
        obj_data = jsonable_encoder(obj_current)

        if isinstance(obj_new, dict):
            update_data = obj_new
        else:
            update_data = obj_new.dict(
                exclude_unset=True
            )  # This tells Pydantic to not include the values that were not sent
        for field in obj_data:
            if field in update_data:
                setattr(obj_current, field, update_data[field])

        db_session.add(obj_current)

        if obj_current.status == "approved":
            raw_query = """
                UPDATE
                    prg
                SET
                    geom = ST_MULTI(ST_Difference(geom, (SELECT ST_UNION(geom) FROM prg WHERE gid = current_prg.id)))
                WHERE
                    ST_Intersects(geom, (SELECT geom FROM prg WHERE gid = current_prg.id)) and zona != 'strada' and gid != current_prg.id;
            """
            db_session.add(raw_query)

        await db_session.commit()
        await db_session.refresh(obj_current)
        return obj_current


prg = CRUDPrg(Prg)

# SELECT
# *,
# ST_ASTEXT(ST_MULTI(ST_Difference(geom, (SELECT st_union(geom) FROM prg WHERE gid = 2)))) AS diff
# FROM
# prg
# WHERE
# ST_Intersects(geom, (SELECT geom FROM prg WHERE gid = 1))
# and zona != 'strada'
# and gid != 1
#
# SELECT ST_ASTEXT(geom) FROM public.prg
# ORDER BY gid ASC
#
# ALTER TABLE prg ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326) USING ST_Force2D(geom);
