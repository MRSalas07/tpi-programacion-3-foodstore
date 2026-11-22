from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    DesactivacionPropia,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get(
    "",
    summary="Listar usuarios",
    response_model=list[UserPublic],
)
def listar_usuarios(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: UsuarioService = Depends(get_usuario_service),
):
    """Incluye a los usuarios desactivados e indica su estado. Requiere rol admin.

    - 200: listado de usuarios
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    """
    return service.listar()


@router.post(
    "/{usuario_id}/activar",
    summary="Activar usuario",
    response_model=UserPublic,
)
def activar_usuario(
    usuario_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: UsuarioService = Depends(get_usuario_service),
):
    """Alta lógica. Requiere rol admin.

    - 200: usuario activo
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: el usuario no existe
    """
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "/{usuario_id}/desactivar",
    summary="Desactivar usuario",
    response_model=UserPublic,
)
def desactivar_usuario(
    usuario_id: int,
    admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: UsuarioService = Depends(get_usuario_service),
):
    """Baja lógica. Requiere rol admin.

    - 200: usuario desactivado
    - 400: el admin intenta desactivarse a sí mismo
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: el usuario no existe
    """
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
    except DesactivacionPropia as error:
        raise HTTPException(status_code=400, detail=str(error))
