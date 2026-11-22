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
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Card from '@/shared/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '../types/usuario.types'

const columnHelper = createColumnHelper<UserPublic>()

function AdminUsuariosPage() {
  const { usuarios, isLoading, isError, error, refetch, activarMutation, desactivarMutation } = useUsuarios()
  const usuarioSesion = useAuthStore((state) => state.usuario)

  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState('')

  const handleToggleEstado = (usuario: UserPublic) => {
    const accion = usuario.disabled ? 'Activar' : 'Desactivar'
    if (!window.confirm(`¿${accion} a ${usuario.username}?`)) return
    activarMutation.reset()
    desactivarMutation.reset()
    if (usuario.disabled) activarMutation.mutate(usuario.id)
    else desactivarMutation.mutate(usuario.id)
  }

  const usuarioColumns = [
    columnHelper.accessor('username', {
      header: 'Usuario',
      cell: (info) => <span className="font-medium text-slate-800">{info.getValue()}</span>,
    }),
    columnHelper.accessor('full_name', { header: 'Nombre' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', {
      header: 'Rol',
      cell: (info) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            info.getValue() === 'admin' ? 'bg-orange-100 text-brand' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('disabled', {
      header: 'Estado',
      enableGlobalFilter: false,
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-error">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-success">Activo</span>
        ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row, table }) => {
        const usuario = row.original
        
        if (!usuario.disabled && usuario.id === usuarioSesion?.id) {
          return <p className="text-right text-xs text-slate-400">Tu cuenta</p>
        }
        return (
          <div className="flex justify-end">
            <button
              type="button"
              className={`font-medium ${
                usuario.disabled ? 'text-success hover:text-green-900' : 'text-error hover:text-red-900'
              }`}
              onClick={() => table.options.meta?.onToggleEstado?.(usuario)}
            >
              {usuario.disabled ? 'Activar' : 'Desactivar'}
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: usuarios,
    columns: usuarioColumns,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
    meta: { onToggleEstado: handleToggleEstado },
  })

  const errorEstado = activarMutation.error ?? desactivarMutation.error

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="titulo-pagina mb-4">Usuarios</h1>

      {errorEstado && <p className="alert-error mb-4">{handleApiError(errorEstado)}</p>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <Skeleton mensaje="Cargando usuarios..." />
        ) : isError ? (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        ) : usuarios.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay usuarios" descripcion="Los usuarios registrados aparecerán acá." />
        ) : (
          <DataTable table={table} placeholderBusqueda="Buscar usuario..." />
        )}
      </Card>
    </main>
  )
}

export default AdminUsuariosPage
