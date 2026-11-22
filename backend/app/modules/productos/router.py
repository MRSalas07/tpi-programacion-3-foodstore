from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get(
    "",
    summary="Listar productos",
    response_model=ProductosPaginados,
)
def listar_productos(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(description="Busca sobre el nombre")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
):
    """Productos activos, paginados. Búsqueda por nombre sin distinguir mayúsculas y filtros por categoría y disponibilidad. Público.

    - 200: { total, items }
    - 422: parámetros inválidos (por ejemplo, limit mayor a 100)
    """
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get(
    "/{producto_id}",
    summary="Obtener producto",
    response_model=ProductoRead,
)
def obtener_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
):
    """Detalle con su categoría. Público.

    - 200: producto encontrado
    - 404: el producto no existe o está dado de baja
    """
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    summary="Crear producto",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    datos: ProductoCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: ProductoService = Depends(get_producto_service),
):
    """Creación de Producto. Requiere rol admin.

    - 201: producto creado
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: la categoría no existe o está dada de baja
    - 422: datos inválidos (precio o stock negativos)
    """
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put(
    "/{producto_id}",
    summary="Actualizar producto",
    response_model=ProductoRead,
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: ProductoService = Depends(get_producto_service),
):
    """Actualización parcial: modifica unicamente campos enviados. Requiere rol admin.

    - 200: producto actualizado
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: el producto no existe, o la nueva categoría no existe o está dada de baja
    - 422: datos inválidos
    """
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.patch(
    "/{producto_id}/stock",
    summary="Actualizar stock y disponibilidad",
    response_model=ProductoRead,
)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: ProductoService = Depends(get_producto_service),
):
    """Requiere rol admin.

    - 200: stock y disponibilidad actualizados
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: el producto no existe o está dado de baja
    - 422: stock negativo
    """
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.delete(
    "/{producto_id}",
    summary="Eliminar producto",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_producto(
    producto_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: ProductoService = Depends(get_producto_service),
):
    """Baja lógica. Requiere rol admin.

    - 204: producto dado de baja
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: el producto no existe o ya está dado de baja
    """
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
