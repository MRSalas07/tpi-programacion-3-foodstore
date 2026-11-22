from app.modules.categorias.models import Categoria
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork



class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"El producto con ID {producto_id} no existe")



class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def _get_or_404(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(producto_id)
        return producto

    def _get_categoria_activa(
        self, uow: ProductoUnitOfWork, categoria_id: int
    ) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                search, categoria_id, disponible, skip, limit
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(producto) for producto in productos],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_or_404(uow, producto_id)
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = self._get_categoria_activa(uow, data.categoria_id)
            producto = Producto.model_validate(data)
            producto.categoria = categoria
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_or_404(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in cambios:
                producto.categoria = self._get_categoria_activa(
                    uow, cambios["categoria_id"]
                )
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_or_404(uow, producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._get_or_404(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)
