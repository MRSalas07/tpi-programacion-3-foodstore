import { useNavigate } from 'react-router-dom'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'

function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const quitar = useCartStore((state) => state.quitar)
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const vaciar = useCartStore((state) => state.vaciar)

  const handleVaciar = () => {
    if (window.confirm('¿Vaciar el carrito?')) vaciar()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <h1 className="titulo-pagina mb-4">Carrito</h1>

      {items.length === 0 ? (
        <Card>
          <EstadoVacio
            titulo="Tu carrito está vacío"
            descripcion="Agregá productos desde el catálogo para armar tu pedido."
            textoAccion="Ir al catálogo"
            onAccion={() => navigate('/')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-center">Cantidad</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr key={item.producto_id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-4 py-3 text-right">{formatearPrecio(item.precio_unitario)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="btn-page"
                          aria-label={`Restar una unidad de ${item.nombre}`}
                          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.cantidad}
                          aria-label={`Cantidad de ${item.nombre}`}
                          onChange={(event) => {
                            const cantidad = event.target.valueAsNumber
                            if (Number.isInteger(cantidad) && cantidad >= 1) {
                              cambiarCantidad(item.producto_id, cantidad)
                            }
                          }}
                          className="w-16 rounded border border-slate-300 px-2 py-1 text-center"
                        />
                        <button
                          type="button"
                          className="btn-page"
                          aria-label={`Sumar una unidad de ${item.nombre}`}
                          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatearPrecio(item.precio_unitario * item.cantidad)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="font-medium text-error hover:text-red-900"
                        onClick={() => quitar(item.producto_id)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">
              Total: <span className="font-bold">{formatearPrecio(total)}</span>
            </p>
            <div className="flex gap-2">
              <Button variante="secondary" onClick={handleVaciar}>
                Vaciar carrito
              </Button>
              <Button onClick={() => navigate('/checkout')}>Continuar con el pedido</Button>
            </div>
          </div>
        </Card>
      )}
    </main>
  )
}

export default CarritoPage
