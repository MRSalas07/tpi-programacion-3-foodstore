from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MensajeResponse, UserCreate
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    UsuarioDesactivado,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    summary="Registrar usuario",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def registrar(
    datos: UserCreate,
    service: AuthService = Depends(get_auth_service),
):
    """Registro público. Crea el usuario con rol user y guarda la contraseña con hash bcrypt.

    - 201: usuario creado (sin hashed_password)
    - 409: el username o el email ya están registrados
    - 422: datos inválidos (email mal formado o contraseña de menos de 8 caracteres)
    """
    try:
        return service.registrar(datos)
    except UsuarioDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error))


@router.post(
    "/token",
    summary="Iniciar sesión",
    response_model=MensajeResponse,
)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: AuthService = Depends(get_auth_service),
):
    """Recibe un formulario OAuth2 (username y password). Entrega el JWT en la cookie HttpOnly access_token; el cuerpo no incluye el token.

    - 200: sesión iniciada (Set-Cookie access_token)
    - 400: cuenta de usuario desactivada
    - 401: credenciales incorrectas
    - 422: faltan campos del formulario
    """
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as error:
        raise HTTPException(
            status_code=401,
            detail=str(error),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except UsuarioDesactivado as error:
        raise HTTPException(status_code=400, detail=str(error))

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    return MensajeResponse(message="Login exitoso")


@router.post(
    "/logout",
    summary="Cerrar sesión",
    response_model=MensajeResponse,
)
def logout(response: Response):
    """Borra la cookie access_token del navegador.

    - 200: sesión cerrada (Set-Cookie que borra la cookie)
    """
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return MensajeResponse(message="Sesión cerrada")


@router.get(
    "/me",
    summary="Usuario autenticado",
    response_model=UserPublic,
)
def leer_usuario_actual(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
):
    """Devuelve los datos del usuario de la sesión. Requiere sesión.

    - 200: datos del usuario
    - 400: cuenta de usuario desactivada
    - 401: sin sesión o token inválido/vencido
    """
    return current_user
