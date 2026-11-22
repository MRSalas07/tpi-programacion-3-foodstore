from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def list_activas(self) -> list[Categoria]:
        statement = (
            select(Categoria)
            .where(col(Categoria.activo).is_(True))
            .order_by(col(Categoria.id))
        )
        return list(self.session.exec(statement).all())

    def get_by_nombre(
        self, nombre: str, excluir_id: int | None = None
    ) -> Categoria | None:
        statement = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.lower()
        )
        if excluir_id is not None:
            statement = statement.where(Categoria.id != excluir_id)
        return self.session.exec(statement).first()
