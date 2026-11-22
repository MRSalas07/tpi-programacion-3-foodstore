import { useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import CheckoutForm from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/useCrearPedido'
import type { CheckoutFormData } from '../types/pedido.types'

function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const vaciar = useCartStore((state) => state.vaciar)
  const crearMutation = useCrearPedido()

  const handleConfirmar = (data: CheckoutFormData) =>
    crearMutation
      .mutateAsync({
        items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
        forma_pago: data.forma_pago,
        direccion_entrega: data.direccion_entrega,
        notas: data.notas || null,
      })
      .then(() => {
        vaciar()
        navigate('/mis-pedidos', { replace: true })
      })
      .catch(() => undefined)

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <h1 className="titulo-pagina mb-4">Confirmar pedido</h1>
        <Card>
          <EstadoVacio
            titulo="No hay productos para confirmar"
            descripcion="Tu carrito está vacío."
            textoAccion="Ir al catálogo"
            onAccion={() => navigate('/')}
          />
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <h1 className="titulo-pagina mb-4">Confirmar pedido</h1>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="p-6 md:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Datos de entrega</h2>
          <CheckoutForm
            onSubmit={handleConfirmar}
            error={crearMutation.error ? handleApiError(crearMutation.error) : null}
          />
        </Card>

        <Card className="h-fit p-6 md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Tu pedido</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-2 py-2">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </p>
        </Card>
      </div>
    </main>
  )
}

export default CheckoutPage
