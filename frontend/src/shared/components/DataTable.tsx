import { flexRender, type Table } from '@tanstack/react-table'
import Paginacion from './Paginacion'

type DataTableProps<T> = {
  table: Table<T>
  placeholderBusqueda: string
}

const iconoOrden: Record<string, string> = { asc: '↑', desc: '↓' }

function DataTable<T>({ table, placeholderBusqueda }: DataTableProps<T>) {
  const filtro = String(table.getState().globalFilter ?? '')
  const { pageIndex } = table.getState().pagination
  const filas = table.getRowModel().rows
  const totalFiltradas = table.getFilteredRowModel().rows.length
  const columnas = table.getVisibleLeafColumns().length

  return (
    <div>
      <div className="border-b border-slate-200 p-3">
        <input
          type="search"
          value={filtro}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={placeholderBusqueda}
          aria-label={placeholderBusqueda}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const orden = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 font-semibold ${header.column.id === 'acciones' ? 'text-right' : ''}`}
                      aria-sort={
                        orden === 'asc' ? 'ascending' : orden === 'desc' ? 'descending' : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-brand"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-slate-400">{orden ? iconoOrden[orden] : '↕'}</span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas} className="px-4 py-6 text-center text-slate-500">
                  No hay resultados para "{filtro}".
                </td>
              </tr>
            ) : (
              filas.map((row) => (
                <tr key={row.id} className="text-slate-700 hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        pagina={pageIndex}
        totalPaginas={table.getPageCount()}
        totalRegistros={totalFiltradas}
        onCambiar={(pagina) => table.setPageIndex(pagina)}
      />
    </div>
  )
}

export default DataTable
