from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categoria_router
from app.modules.pedidos.router import router as pedido_router
from app.modules.productos.router import router as producto_router
from app.modules.usuarios.router import router as usuario_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos de comida Food Store (TPI Programación 4).",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuario_router, prefix=API_PREFIX)
app.include_router(categoria_router, prefix=API_PREFIX)
app.include_router(producto_router, prefix=API_PREFIX)
app.include_router(pedido_router, prefix=API_PREFIX)
