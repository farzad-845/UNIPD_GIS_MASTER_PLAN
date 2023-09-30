import datetime
from enum import Enum
from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.models.prg_model import Prg
from app.crud.base_crud import CRUDBase
from app.schemas.common_schema import IPrgStatusEnum, IPrgTypeEnum
from app.schemas.prg_schema import IPrgUpdate, IPrgCreate, IPrgReadWithWKT
from app.utils.uuid6 import UUID


class CRUDPrg(CRUDBase[Prg, IPrgCreate, IPrgUpdate]):
    async def create_variant(
            self,
            *,
            obj_in: IPrgCreate | dict[str, Any] | Prg,
            current_user: User,
            db_session: AsyncSession | None = None
    ) -> Prg:
        db_session = db_session or super().get_db().session
        db_obj = Prg.from_orm(obj_in)
        db_obj.status = IPrgStatusEnum.in_progress
        db_obj.user_id = current_user.id
        db_session.add(db_obj)
        await db_session.commit()
        await db_session.refresh(db_obj)

        raw_query = 'UPDATE "Prg" SET geom = ST_SetSRID(geom, 4326) WHERE ST_SRID(geom) = 0;'
        await db_session.execute(raw_query)

        return db_obj

    async def get_variant(
            self, *, id: UUID | str, db_session: AsyncSession | None = None
    ) -> IPrgReadWithWKT:
        db_session = db_session or self.db.session
        raw_query = 'SELECT *, ST_AsText("Prg".geom) AS wkt FROM "Prg" WHERE id=' + f"'{id}'"
        response = await db_session.execute(raw_query)
        for row in response:
            return row
        # return response.scalar_one_or_none()

    async def get_variant_by_particelle_numero(
            self, *, numero: str, db_session: AsyncSession | None = None
    ) -> IPrgReadWithWKT:
        db_session = db_session or self.db.session
        raw_query = 'SELECT *, ST_AsText("Prg".geom) AS wkt FROM "Prg" WHERE ST_Intersects("Prg".geom, (SELECT ST_SetSRID(geom, 4326) FROM "Particelle" WHERE numero=' + f"'{numero}'" + '))'
        response = await db_session.execute(raw_query)
        for row in response:
            return row

    async def update_variant(
            self,
            obj_current: Prg,
            obj_new: IPrgUpdate | dict[str, Any] | Prg,
    ) -> IPrgReadWithWKT:
        db_session = super().get_db().session
        if obj_new.status:
            setattr(obj_current, "status", obj_new.status)
        if obj_new.zona:
            setattr(obj_current, "zona", obj_new.zona)
        if obj_new.end_date:
            setattr(obj_current, "end_date", obj_new.end_date)
        if obj_new.articolo:
            setattr(obj_current, "articolo", obj_new.articolo)
        if obj_new.proprieta:
            setattr(obj_current, "proprieta", obj_new.proprieta)
        if obj_new.scheda:
            setattr(obj_current, "scheda", obj_new.scheda)
        if obj_new.frazione:
            setattr(obj_current, "frazione", obj_new.frazione)
        if obj_new.sul:
            setattr(obj_current, "sul", obj_new.sul)
        if obj_new.comparto:
            setattr(obj_current, "comparto", obj_new.comparto)
        if obj_new.id_area:
            setattr(obj_current, "id_area", obj_new.id_area)
        if obj_new.area:
            setattr(obj_current, "area", obj_new.area)
        if obj_new.geom:
            setattr(obj_current, "geom", obj_new.geom)
        if obj_new.user_id:
            setattr(obj_current, "user_id", obj_new.user_id)
        if obj_new.db_id:
            setattr(obj_current, "db_id", obj_new.db_id)

        db_session.add(obj_current)
        if obj_new.status == IPrgStatusEnum.approved:
            raw_query = 'UPDATE "Prg" SET geom = ST_SetSRID(geom, 4326) WHERE ST_SRID(geom) = 0;'
            await db_session.execute(raw_query)
            raw_query = 'UPDATE "Prg" SET geom = ST_MULTI(ST_CollectionExtract(ST_Difference(geom, (SELECT ST_UNION(geom) FROM "Prg" WHERE id =' + f"'{obj_current.id}'" + ')), 3)) WHERE  ST_Intersects(geom, (SELECT geom FROM "Prg" WHERE id = ' + f"'{obj_current.id}'" + ')) and zona != \'strada\' and id != ' + f"'{obj_current.id}';"
            await db_session.execute(raw_query)

        await db_session.commit()
        await db_session.refresh(obj_current)
        return await self.get_variant(id=obj_current.id)


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
