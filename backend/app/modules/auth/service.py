from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ROL_POR_DEFECTO = "user"

#Excepciones del negocio
class UsuarioDuplicado(Exception):
    def __init__(self, campo: str, valor: str):
        super().__init__(f"El {campo} '{valor}' ya está registrado")


class CredencialesInvalidas(Exception):
    def __init__(self):
        super().__init__("Usuario o contraseña incorrectos")


class UsuarioDesactivado(Exception):
    def __init__(self):
        super().__init__("Cuenta de usuario desactivada")


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            email = data.email.lower()
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado("username", data.username)
            if uow.usuarios.get_by_email(email) is not None:
                raise UsuarioDuplicado("email", email)

            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=email,
                    hashed_password=hash_password(data.password),
                    role=ROL_POR_DEFECTO,
                )
            )
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)            
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise UsuarioDesactivado()
            return create_access_token({"sub": usuario.username})
