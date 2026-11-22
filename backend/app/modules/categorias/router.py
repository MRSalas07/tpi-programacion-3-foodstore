from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get(
    "",
    summary="Listar categorías",
    response_model=list[CategoriaRead],
)
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
):
    """Devuelve las categorías activas.

    - 200: listado de categorías
    """
    return service.listar()


@router.get(
    "/{categoria_id}",
    summary="Obtener categoría",
    response_model=CategoriaRead,
)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    """Buscar Categoria individual

    - 200: categoría encontrada
    - 404: la categoría no existe o está dada de baja
    """
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    summary="Crear categoría",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    datos: CategoriaCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: CategoriaService = Depends(get_categoria_service),
):
    """Crear una categoria. Requiere rol admin.

    - 201: categoría creada
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 409: ya existe una categoría con ese nombre
    - 422: datos inválidos (nombre de menos de 2 o más de 100 caracteres)
    """
    try:
        return service.crear(datos)
    except NombreDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error))


@router.put(
    "/{categoria_id}",
    summary="Actualizar categoría",
    response_model=CategoriaRead,
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: CategoriaService = Depends(get_categoria_service),
):
    """Actualización parcial: modifica los campos enviados. Requiere rol admin.

    - 200: categoría actualizada
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: la categoría no existe o está dada de baja
    - 409: ya existe una categoría con ese nombre
    - 422: datos inválidos
    """
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error))
    except NombreDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error))


@router.delete(
    "/{categoria_id}",
    summary="Eliminar categoría",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    categoria_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: CategoriaService = Depends(get_categoria_service),
):
    """Baja lógica. Requiere rol admin.

    - 204: categoría dada de baja
    - 401: sin sesión
    - 403: el usuario no tiene el rol admin
    - 404: la categoría no existe o ya está dada de baja
    """
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
