from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.email == email.lower())
        return self.session.exec(statement).first()

    def list_ordenados(self) -> list[Usuario]:
        statement = select(Usuario).order_by(col(Usuario.id))
        return list(self.session.exec(statement).all())
