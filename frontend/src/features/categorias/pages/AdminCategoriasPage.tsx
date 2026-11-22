import { useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import AccionesFila from '@/shared/components/AccionesFila'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import CategoriaModal from '../components/CategoriaModal'
import { categoriaFormVacio, useCategoriaForm } from '../hooks/useCategoriaForm'
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria.types'

const columnHelper = createColumnHelper<Categoria>()

const categoriaColumns = [
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => <span className="font-medium text-slate-800">{info.getValue()}</span>,
  }),
  columnHelper.accessor('descripcion', {
    header: 'Descripción',
    cell: (info) => info.getValue() || <span className="text-slate-400">Sin descripción</span>,
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => (
      <AccionesFila
        onEdit={() => table.options.meta?.onEdit?.(row.original)}
        onDelete={() => table.options.meta?.onDelete?.(row.original)}
      />
    ),
  }),
]

function AdminCategoriasPage() {
  const { categorias, isLoading, isError, error, refetch, crearMutation, editarMutation, eliminarMutation } =
    useCategorias()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState('')

  const cerrarModal = () => {
    setModalAbierto(false)
    setCategoriaEditando(null)
  }

  const handleSubmit = (data: CategoriaCreate) => {
    const peticion = categoriaEditando
      ? editarMutation.mutateAsync({ id: categoriaEditando.id, data })
      : crearMutation.mutateAsync(data)
    return peticion.then(cerrarModal).catch(() => undefined)
  }

  const form = useCategoriaForm(handleSubmit)

  const limpiarErrores = () => {
    crearMutation.reset()
    editarMutation.reset()
    eliminarMutation.reset()
  }

  const abrirParaCrear = () => {
    limpiarErrores()
    form.reset(categoriaFormVacio, { keepDefaultValues: true })
    setCategoriaEditando(null)
    setModalAbierto(true)
  }

  const abrirParaEditar = (categoria: Categoria) => {
    limpiarErrores()
    form.reset({ nombre: categoria.nombre, descripcion: categoria.descripcion }, { keepDefaultValues: true })
    setCategoriaEditando(categoria)
    setModalAbierto(true)
  }

  const handleDelete = (categoria: Categoria) => {
    if (!window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"?`)) return
    eliminarMutation.mutate(categoria.id)
  }

  const table = useReactTable({
    data: categorias,
    columns: categoriaColumns,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
    meta: { onEdit: abrirParaEditar, onDelete: handleDelete },
  })

  const errorModal = crearMutation.error ?? editarMutation.error
  const errorEliminar = eliminarMutation.error

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="titulo-pagina">Categorías</h1>
        <Button className="shrink-0" onClick={abrirParaCrear}>
          + Nueva categoría
        </Button>
      </div>

      {errorEliminar && <p className="alert-error mb-4">{handleApiError(errorEliminar)}</p>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <Skeleton mensaje="Cargando categorías..." />
        ) : isError ? (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        ) : categorias.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay categorías"
            descripcion="Creá la primera categoría para organizar el catálogo."
            textoAccion="+ Nueva categoría"
            onAccion={abrirParaCrear}
          />
        ) : (
          <DataTable table={table} placeholderBusqueda="Buscar categoría..." />
        )}
      </Card>

      <CategoriaModal
        isOpen={modalAbierto}
        categoriaEditando={categoriaEditando}
        form={form}
        error={errorModal ? handleApiError(errorModal) : null}
        onCancel={cerrarModal}
      />
    </main>
  )
}

export default AdminCategoriasPage
