from datetime import datetime

from sqlmodel import Session, col, func, select
from sqlmodel.sql.expression import SelectOfScalar

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def _paginar(
        self, statement: SelectOfScalar[Pedido], skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        total = self.session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()
        items = self.session.exec(
            statement.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, list(items)

    def list_all(
        self, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        statement = select(Pedido)
        if estado is not None:
            statement = statement.where(Pedido.estado == estado)
        return self._paginar(statement, skip, limit)

    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        statement = select(Pedido).where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            statement = statement.where(Pedido.estado == estado)
        return self._paginar(statement, skip, limit)

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count(col(Pedido.id))).where(Pedido.estado == estado)
        return self.session.exec(statement).one()

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count(col(Pedido.id))).where(Pedido.created_at >= desde)
        return self.session.exec(statement).one()

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == estado
        )
        return float(self.session.exec(statement).one())
