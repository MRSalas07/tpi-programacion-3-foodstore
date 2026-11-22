import { useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Skeleton from '@/shared/components/Skeleton'
import Card from '@/shared/ui/Card'
import PedidoDetalleModal from '../components/PedidoDetalleModal'
import PedidosTabla from '../components/PedidosTabla'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO, SIGUIENTE_ESTADO, type EstadoPedido, type Pedido } from '../types/pedido.types'

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [pedidoVisto, setPedidoVisto] = useState<number | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstadoMutation = useCambiarEstadoPedido()

  const pedidos = data?.items ?? []

  const handleAvanzar = (pedido: Pedido) => {
    const siguiente = SIGUIENTE_ESTADO[pedido.estado]
    if (!siguiente) return
    if (!window.confirm(`¿Pasar el pedido #${pedido.id} a ${ETIQUETA_ESTADO[siguiente]}?`)) return
    cambiarEstadoMutation.mutate({ id: pedido.id, estado: siguiente })
  }

  const handleCancelar = (pedido: Pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devolverá el stock de sus productos.`)) return
    cambiarEstadoMutation.mutate({ id: pedido.id, estado: 'CANCELADO' })
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="titulo-pagina">Pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(event) => setEstado((event.target.value || undefined) as EstadoPedido | undefined)}
          aria-label="Filtrar por estado"
          className="input mt-0 sm:max-w-xs"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((opcion) => (
            <option key={opcion} value={opcion}>
              {ETIQUETA_ESTADO[opcion]}
            </option>
          ))}
        </select>
      </div>

      {cambiarEstadoMutation.error && (
        <p className="alert-error mb-4">{handleApiError(cambiarEstadoMutation.error)}</p>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <Skeleton mensaje="Cargando pedidos..." />
        ) : isError ? (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        ) : pedidos.length === 0 ? (
          <EstadoVacio
            titulo="No hay pedidos"
            descripcion={estado ? `No hay pedidos en estado ${ETIQUETA_ESTADO[estado]}.` : 'Todavía no se realizaron pedidos.'}
          />
        ) : (
          <PedidosTabla
            pedidos={pedidos}
            onVer={(pedido) => setPedidoVisto(pedido.id)}
            onAvanzar={handleAvanzar}
            onCancelar={handleCancelar}
          />
        )}
      </Card>

      <PedidoDetalleModal pedidoId={pedidoVisto} onClose={() => setPedidoVisto(null)} />
    </main>
  )
}

export default AdminPedidosPage
