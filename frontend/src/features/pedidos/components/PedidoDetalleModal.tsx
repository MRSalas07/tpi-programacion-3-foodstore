import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import Modal from '@/shared/ui/Modal'
import { usePedido } from '../hooks/usePedido'
import PedidoDetalle from './PedidoDetalle'

type PedidoDetalleModalProps = {
  pedidoId: number | null
  onClose: () => void
}

function PedidoDetalleModal({ pedidoId, onClose }: PedidoDetalleModalProps) {
  const { data: pedido, isLoading, isError, error, refetch } = usePedido(pedidoId)

  return (
    <Modal isOpen={pedidoId !== null} titulo={`Pedido #${pedidoId ?? ''}`} onClose={onClose} ancho="lg">
      {isLoading ? (
        <Skeleton mensaje="Cargando detalle..." cantidad={3} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : pedido ? (
        <PedidoDetalle pedido={pedido} />
      ) : null}
      <div className="mt-6 flex justify-end">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  )
}

export default PedidoDetalleModal
