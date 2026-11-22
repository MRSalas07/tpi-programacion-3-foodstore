from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int):
        super().__init__(f"La categoría con ID {categoria_id} no existe")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")



class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def _get_or_404(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    def _assert_nombre_unico(
        self, uow: CategoriaUnitOfWork, nombre: str, excluir_id: int | None = None
    ) -> None:
        if uow.categorias.get_by_nombre(nombre, excluir_id) is not None:
            raise NombreDuplicado(nombre)

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(categoria)
                for categoria in uow.categorias.list_activas()
            ]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_or_404(uow, categoria_id)
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._assert_nombre_unico(uow, data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_or_404(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in cambios:
                self._assert_nombre_unico(uow, cambios["nombre"], categoria_id)
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._get_or_404(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
