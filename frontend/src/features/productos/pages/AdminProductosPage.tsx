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
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import AccionesFila from '@/shared/components/AccionesFila'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import ProductoModal from '../components/ProductoModal'
import StockModal from '../components/StockModal'
import { productoFormVacio, useProductoForm, useStockForm } from '../hooks/useProductoForm'
import { useProductos } from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto.types'

const columnHelper = createColumnHelper<Producto>()

const productoColumns = [
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => (
      <div>
        <p className="font-medium text-slate-800">{info.getValue()}</p>
        {info.row.original.descripcion && (
          <p className="text-xs text-slate-500">{info.row.original.descripcion}</p>
        )}
      </div>
    ),
  }),
  columnHelper.accessor((producto) => producto.categoria.nombre, {
    id: 'categoria',
    header: 'Categoría',
  }),
  columnHelper.accessor('precio_base', {
    header: 'Precio',
    cell: (info) => formatearPrecio(info.getValue()),
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    cell: (info) => (
      <span className={info.getValue() === 0 ? 'font-semibold text-error' : ''}>{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('disponible', {
    header: 'Disponible',
    enableGlobalFilter: false,
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-success">Sí</span>
      ) : (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-secondary">No</span>
      ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => (
      <AccionesFila
        onEdit={() => table.options.meta?.onEdit?.(row.original)}
        onStock={() => table.options.meta?.onStock?.(row.original)}
        onDelete={() => table.options.meta?.onDelete?.(row.original)}
      />
    ),
  }),
]

function AdminProductosPage() {
  
  const {
    productos,
    isLoading,
    isError,
    error,
    refetch,
    crearMutation,
    editarMutation,
    stockMutation,
    eliminarMutation,
  } = useProductos({ skip: 0, limit: 100 })
  const { categorias } = useCategorias()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [productoStock, setProductoStock] = useState<Producto | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState('')

  const cerrarModal = () => {
    setModalAbierto(false)
    setProductoEditando(null)
  }

  const handleSubmit = (data: ProductoCreate) => {
    const peticion = productoEditando
      ? editarMutation.mutateAsync({ id: productoEditando.id, data })
      : crearMutation.mutateAsync(data)
    return peticion.then(cerrarModal).catch(() => undefined)
  }

  const handleSubmitStock = (data: ProductoStockUpdate) => {
    if (!productoStock) return Promise.resolve()
    return stockMutation
      .mutateAsync({ id: productoStock.id, data })
      .then(() => setProductoStock(null))
      .catch(() => undefined)
  }

  const form = useProductoForm(handleSubmit)
  const stockForm = useStockForm(handleSubmitStock)

  const limpiarErrores = () => {
    crearMutation.reset()
    editarMutation.reset()
    stockMutation.reset()
    eliminarMutation.reset()
  }

  const abrirParaCrear = () => {
    limpiarErrores()
    form.reset(productoFormVacio, { keepDefaultValues: true })
    setProductoEditando(null)
    setModalAbierto(true)
  }

  const abrirParaEditar = (producto: Producto) => {
    limpiarErrores()
    form.reset(
      {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_base: producto.precio_base,
        imagen_url: producto.imagen_url,
        stock: producto.stock,
        disponible: producto.disponible,
        categoria_id: producto.categoria_id,
      },
      { keepDefaultValues: true },
    )
    setProductoEditando(producto)
    setModalAbierto(true)
  }

  const abrirStock = (producto: Producto) => {
    limpiarErrores()
    stockForm.reset({ stock: producto.stock, disponible: producto.disponible }, { keepDefaultValues: true })
    setProductoStock(producto)
  }

  const handleDelete = (producto: Producto) => {
    if (!window.confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return
    eliminarMutation.mutate(producto.id)
  }

  const table = useReactTable({
    data: productos,
    columns: productoColumns,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
    meta: { onEdit: abrirParaEditar, onStock: abrirStock, onDelete: handleDelete },
  })

  const errorModal = crearMutation.error ?? editarMutation.error
  const errorEliminar = eliminarMutation.error

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="titulo-pagina">Productos</h1>
        <Button className="shrink-0" onClick={abrirParaCrear}>
          + Nuevo producto
        </Button>
      </div>

      {errorEliminar && <p className="alert-error mb-4">{handleApiError(errorEliminar)}</p>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <Skeleton mensaje="Cargando productos..." />
        ) : isError ? (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        ) : productos.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay productos"
            descripcion="Cargá el primer producto del catálogo."
            textoAccion="+ Nuevo producto"
            onAccion={abrirParaCrear}
          />
        ) : (
          <DataTable table={table} placeholderBusqueda="Buscar producto..." />
        )}
      </Card>

      <ProductoModal
        isOpen={modalAbierto}
        productoEditando={productoEditando}
        categorias={categorias}
        form={form}
        error={errorModal ? handleApiError(errorModal) : null}
        onCancel={cerrarModal}
      />

      <StockModal
        producto={productoStock}
        form={stockForm}
        error={stockMutation.error ? handleApiError(stockMutation.error) : null}
        onCancel={() => setProductoStock(null)}
      />
    </main>
  )
}

export default AdminProductosPage
