from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int):
        super().__init__(f"El usuario con ID {usuario_id} no existe")


class DesactivacionPropia(Exception):
    def __init__(self):
        super().__init__("Un administrador no puede desactivarse a sí mismo")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def _get_or_404(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario

    def obtener_por_username(self, username: str) -> UserPublic | None:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None:
                return None
            return UserPublic.model_validate(usuario)

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [
                UserPublic.model_validate(usuario)
                for usuario in uow.usuarios.list_ordenados()
            ]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._get_or_404(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._get_or_404(uow, usuario_id)
            if usuario.id == admin_id:
                raise DesactivacionPropia()
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
