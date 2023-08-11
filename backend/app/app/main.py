import gc
from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    status,
)
from app.core import security
from app.api.deps import get_redis_client
from fastapi_pagination import add_pagination
from pydantic import ValidationError
from starlette.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router as api_router_v1
from app.core.config import ModeEnum, settings
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_async_sqlalchemy import SQLAlchemyMiddleware, db
from contextlib import asynccontextmanager
from app.utils.fastapi_globals import g, GlobalsMiddleware
from fastapi_limiter import FastAPILimiter
from jose import jwt
from sqlalchemy.pool import NullPool, QueuePool


async def user_id_identifier(request: Request):
    if request.scope["type"] == "http":
        # Retrieve the Authorization header from the request
        auth_header = request.headers.get("Authorization")

        if auth_header is not None:
            # Check that the header is in the correct format
            header_parts = auth_header.split()
            if len(header_parts) == 2 and header_parts[0].lower() == "bearer":
                token = header_parts[1]
                try:
                    payload = jwt.decode(
                        token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
                    )
                except (jwt.JWTError, ValidationError) as e:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Could not validate credentials",
                    ) from e
                return payload["sub"]
    if request.scope["type"] == "websocket":
        return request.scope["path"]

    if forwarded := request.headers.get("X-Forwarded-For"):
        return forwarded.split(",")[0]

    ip = request.client.host
    return f"{ip}:" + request.scope["path"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    redis_client = await get_redis_client()
    FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")
    await FastAPILimiter.init(redis_client, identifier=user_id_identifier)

    # Load a pre-trained sentiment analysis model as a dictionary to an easy cleanup

    # g.set_default("sentiment_model", models["sentiment_model"])
    print("startup fastapi")
    yield
    # shutdown
    await FastAPICache.clear()
    await FastAPILimiter.close()

    g.cleanup()
    gc.collect()


# Core Application Instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)


app.add_middleware(
    SQLAlchemyMiddleware,
    db_url=settings.ASYNC_DATABASE_URI,
    engine_args={
        "echo": False,
        # "pool_pre_ping": True,
        # "pool_size": settings.POOL_SIZE,
        # "max_overflow": 64,
        "poolclass": NullPool
        if settings.MODE == ModeEnum.testing
        else QueuePool,  # Asincio pytest works with NullPool
    },
)
app.add_middleware(GlobalsMiddleware)

# Set all CORS origins enabled
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


class CustomException(Exception):
    http_code: int
    code: str
    message: str

    def __init__(self, http_code: int = None, code: str = None, message: str = None):
        self.http_code = http_code or 500
        self.code = code or str(self.http_code)
        self.message = message


@app.get("/")
async def root():
    """
    An example "Hello world" FastAPI route.
    """
    # if oso.is_allowed(user, "read", message):
    return {"message": "Hello World"}


# Add Routers
app.include_router(api_router_v1, prefix=settings.API_V1_STR)
add_pagination(app)

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
#
#
#
#
# UPDATE
# prg
# SET
# geom = ST_MULTI(ST_Difference(geom, (SELECT ST_UNION(geom) FROM prg WHERE gid = 1)))
# WHERE
# ST_Intersects(geom, (SELECT geom FROM prg WHERE gid = 1)) and zona != 'strada' and gid != 1;
#
#
# SELECT ST_ASTEXT(geom) FROM public.prg
# ORDER BY gid ASC
#
# ALTER TABLE prg ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326) USING ST_Force2D(geom);
