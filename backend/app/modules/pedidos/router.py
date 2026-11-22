from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post(
    "",
    summary="Crear pedido",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    datos: PedidoCreate,
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    service: PedidoService = Depends(get_pedido_service),
):
    """Crea el pedido desde el carrito en una sola transacción. Requiere usuario logeado.

    - 201: pedido creado en estado PENDIENTE, con el stock descontado
    - 400: stock insuficiente, producto no disponible o producto repetido
    - 401: sin sesión
    - 404: algún producto no existe o está dado de baja
    - 422: sin ítems, cantidad menor a 1, forma de pago o dirección inválidas
    """
    try:
        return service.crear(datos, usuario.id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido) as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get(
    "",
    summary="Listar pedidos",
    response_model=PedidosPaginados,
)
def listar_pedidos(
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
    service: PedidoService = Depends(get_pedido_service),
):
    """Pedidos propios (user) o todos (admin), con sus líneas. Requiere usuario logeado.

    - 200: { total, items }
    - 401: sin sesión
    """
    return service.listar(usuario.id, usuario.role == "admin", estado, skip, limit)



@router.get(
    "/resumen",
    summary="Resumen del panel",
    response_model=ResumenPedidos,
)
def resumen_pedidos(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: PedidoService = Depends(get_pedido_service),
):
    """Indicadores del panel de administración. Requiere rol admin.

    - 200: conteos por estado, pedidos de hoy e ingresos de los entregados
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    """
    return service.resumen()


@router.get(
    "/{pedido_id}",
    summary="Obtener pedido",
    response_model=PedidoRead,
)
def obtener_pedido(
    pedido_id: int,
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    service: PedidoService = Depends(get_pedido_service),
):
    """Detalle con sus líneas. Dueño del pedido o rol admin.

    - 200: pedido encontrado
    - 401: sin sesión
    - 403: el pedido es de otro usuario
    - 404: el pedido no existe
    """
    try:
        return service.obtener(pedido_id, usuario.id, usuario.role == "admin")
    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
    except PedidoAjeno as error:
        raise HTTPException(status_code=403, detail=str(error))


@router.patch(
    "/{pedido_id}/estado",
    summary="Cambiar estado del pedido",
    response_model=PedidoRead,
)
def cambiar_estado_pedido(
    pedido_id: int,
    datos: CambioEstado,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: PedidoService = Depends(get_pedido_service),
):
    """Avanza o cancela según la máquina de estados; al cancelar restituye el stock. Requiere rol admin.

    - 200: estado actualizado
    - 400: transición inválida (incluye cualquier cambio desde un estado terminal)
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: el pedido no existe
    - 422: estado fuera de los cuatro permitidos
    """
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
    except TransicionInvalida as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.patch(
    "/{pedido_id}/cancelar",
    summary="Cancelar pedido propio",
    response_model=PedidoRead,
)
def cancelar_pedido(
    pedido_id: int,
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    service: PedidoService = Depends(get_pedido_service),
):
    """El dueño cancela su pedido en PENDIENTE; se restituye el stock.

    - 200: pedido cancelado
    - 400: el pedido no está en PENDIENTE
    - 401: sin sesión
    - 403: el pedido es de otro usuario
    - 404: el pedido no existe
    """
    try:
        return service.cancelar(pedido_id, usuario.id)
    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
    except PedidoAjeno as error:
        raise HTTPException(status_code=403, detail=str(error))
    except TransicionInvalida as error:
        raise HTTPException(status_code=400, detail=str(error))
