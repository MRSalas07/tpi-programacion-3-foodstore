from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido, ahora
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

# Máquina de estados  toda transición se valida contra este mapa
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"El pedido con ID {pedido_id} no existe")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"El producto con ID {producto_id} no existe")


class PedidoAjeno(Exception):
    def __init__(self):
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(Exception):
    def __init__(self):
        super().__init__("Un mismo producto no se puede repetir entre los ítems del pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, disponible: int, pedido: int):
        super().__init__(
            f"Stock insuficiente para '{nombre}': hay {disponible} y se pidieron {pedido}"
        )


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _get_or_404(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    def _validar_transicion(self, actual: str, nuevo: str) -> None:
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(
                f"Transición inválida: un pedido {actual} no puede pasar a {nuevo}"
            )

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            productos_ids = [item.producto_id for item in data.items]
            if len(productos_ids) != len(set(productos_ids)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=(data.notas or "").strip() or None,
                    total=0.0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        estado: str | None,
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        with self.uow as uow:
            if es_admin:
                total, pedidos = uow.pedidos.list_all(estado, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(
                    usuario_id, estado, skip, limit
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(pedido) for pedido in pedidos],
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_or_404(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_or_404(uow, pedido_id)
            self._validar_transicion(pedido.estado, nuevo_estado)
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_or_404(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    f"Solo se puede cancelar un pedido PENDIENTE; este está {pedido.estado}"
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_hoy = datetime.now().astimezone().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(
                    uow.pedidos.sum_total_by_estado("ENTREGADO"), 2
                ),
            )
