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
import DataTable from '@/shared/components/DataTable'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { ETIQUETA_ESTADO, ETIQUETA_FORMA_PAGO, SIGUIENTE_ESTADO, esTerminal, type Pedido } from '../types/pedido.types'

type PedidosTablaProps = {
  pedidos: Pedido[]
  onVer: (pedido: Pedido) => void
  onAvanzar: (pedido: Pedido) => void
  onCancelar: (pedido: Pedido) => void
}

const columnHelper = createColumnHelper<Pedido>()

const pedidoColumns = [
  columnHelper.accessor('id', {
    header: 'Pedido',
    cell: (info) => <span className="font-medium text-slate-800">#{info.getValue()}</span>,
  }),
  columnHelper.accessor('usuario_id', {
    header: 'Cliente',
    cell: (info) => `Usuario #${info.getValue()}`,
  }),
  columnHelper.accessor('created_at', {
    header: 'Fecha',
    enableGlobalFilter: false,
    cell: (info) => formatearFecha(info.getValue()),
  }),
  columnHelper.accessor('forma_pago', {
    header: 'Pago',
    cell: (info) => ETIQUETA_FORMA_PAGO[info.getValue()],
  }),
  columnHelper.accessor('total', {
    header: 'Total',
    enableGlobalFilter: false,
    cell: (info) => formatearPrecio(info.getValue()),
  }),
  columnHelper.accessor('estado', {
    header: 'Estado',
    cell: (info) => <BadgeEstado estado={info.getValue()} />,
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => {
      const pedido = row.original
      const siguiente = SIGUIENTE_ESTADO[pedido.estado]
      return (
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="font-medium text-slate-600 hover:text-slate-900"
            onClick={() => table.options.meta?.onVer?.(pedido)}
          >
            Ver
          </button>
          {/* Los botones salen de la máquina de estados: los terminales no tienen acciones */}
          {siguiente && (
            <button
              type="button"
              className="font-medium text-brand hover:text-brand-hover"
              onClick={() => table.options.meta?.onAvanzar?.(pedido)}
            >
              Pasar a {ETIQUETA_ESTADO[siguiente]}
            </button>
          )}
          {!esTerminal(pedido.estado) && (
            <button
              type="button"
              className="font-medium text-error hover:text-red-900"
              onClick={() => table.options.meta?.onCancelar?.(pedido)}
            >
              Cancelar
            </button>
          )}
        </div>
      )
    },
  }),
]

function PedidosTabla({ pedidos, onVer, onAvanzar, onCancelar }: PedidosTablaProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState('')

  const table = useReactTable({
    data: pedidos,
    columns: pedidoColumns,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
    meta: { onVer, onAvanzar, onCancelar },
  })

  return <DataTable table={table} placeholderBusqueda="Buscar pedido..." />
}

export default PedidosTabla
