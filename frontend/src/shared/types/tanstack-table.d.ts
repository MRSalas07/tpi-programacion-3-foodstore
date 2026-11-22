import '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'

// Acciones de fila que cada página pasa a la tabla mediante meta
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEdit?: (fila: TData) => void
    onDelete?: (fila: TData) => void
    onStock?: (fila: TData) => void
    onToggleEstado?: (fila: TData) => void
    onVer?: (fila: TData) => void
    onAvanzar?: (fila: TData) => void
    onCancelar?: (fila: TData) => void
  }
}
