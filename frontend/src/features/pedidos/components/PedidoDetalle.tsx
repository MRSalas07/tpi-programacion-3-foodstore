import BadgeEstado from '@/shared/ui/BadgeEstado'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { ETIQUETA_FORMA_PAGO, type Pedido } from '../types/pedido.types'

type PedidoDetalleProps = {
  pedido: Pedido
}

function PedidoDetalle({ pedido }: PedidoDetalleProps) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <dt className="text-slate-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        <dt className="text-slate-500">Fecha</dt>
        <dd>{formatearFecha(pedido.created_at)}</dd>
        <dt className="text-slate-500">Forma de pago</dt>
        <dd>{ETIQUETA_FORMA_PAGO[pedido.forma_pago]}</dd>
        <dt className="text-slate-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        {pedido.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>

      <table className="w-full border-collapse text-left">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 font-bold">
            <td className="py-2" colSpan={3}>
              Total
            </td>
            <td className="py-2 text-right">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default PedidoDetalle
