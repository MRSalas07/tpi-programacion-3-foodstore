import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import PedidoDetalleModal from '../components/PedidoDetalleModal'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ETIQUETA_FORMA_PAGO, type Pedido } from '../types/pedido.types'

const LIMITE = 5

function MisPedidosPage() {
  const navigate = useNavigate()
  const [pagina, setPagina] = useState(0)
  const [pedidoVisto, setPedidoVisto] = useState<number | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * LIMITE, limit: LIMITE })
  const cancelarMutation = useCancelarPedido()

  const pedidos = data?.items ?? []
  const total = data?.total ?? 0

  const handleCancelar = (pedido: Pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devolverá el stock de sus productos.`)) return
    cancelarMutation.mutate(pedido.id)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <h1 className="titulo-pagina mb-4">Mis pedidos</h1>

      {cancelarMutation.error && <p className="alert-error mb-4">{handleApiError(cancelarMutation.error)}</p>}

      {isLoading ? (
        <Card>
          <Skeleton mensaje="Cargando tus pedidos..." />
        </Card>
      ) : isError ? (
        <Card>
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        </Card>
      ) : pedidos.length === 0 ? (
        <Card>
          <EstadoVacio
            titulo="Todavía no hiciste pedidos"
            descripcion="Cuando confirmes un pedido lo vas a ver acá con su estado."
            textoAccion="Ir al catálogo"
            onAccion={() => navigate('/')}
          />
        </Card>
      ) : (
        <>
          <ul className="space-y-3">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">Pedido #{pedido.id}</span>
                      <BadgeEstado estado={pedido.estado} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatearFecha(pedido.created_at)} · {pedido.items.length}{' '}
                      {pedido.items.length === 1 ? 'producto' : 'productos'} ·{' '}
                      {ETIQUETA_FORMA_PAGO[pedido.forma_pago]}
                    </p>
                    <p className="text-lg font-bold text-slate-900">{formatearPrecio(pedido.total)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variante="secondary" onClick={() => setPedidoVisto(pedido.id)}>
                      Ver detalle
                    </Button>
                    {pedido.estado === 'PENDIENTE' && (
                      <Button
                        variante="danger"
                        onClick={() => handleCancelar(pedido)}
                        disabled={cancelarMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Card className="mt-4 overflow-hidden">
            <Paginacion
              pagina={pagina}
              totalPaginas={Math.ceil(total / LIMITE)}
              totalRegistros={total}
              onCambiar={setPagina}
            />
          </Card>
        </>
      )}

      <PedidoDetalleModal pedidoId={pedidoVisto} onClose={() => setPedidoVisto(null)} />
    </main>
  )
}

export default MisPedidosPage
