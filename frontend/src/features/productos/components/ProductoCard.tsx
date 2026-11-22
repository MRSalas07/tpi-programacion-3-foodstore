import { useState } from 'react'
import { formatearPrecio } from '@/shared/utils/formato'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { useCartStore } from '@/store/cartStore'
import type { Producto } from '../types/producto.types'

type ProductoCardProps = {
  producto: Producto
}

function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar)
  const enCarrito = useCartStore(
    (state) => state.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock === 0
  
  const puedeAgregar = producto.disponible && !sinStock && enCarrito < producto.stock

  const handleAgregar = () =>
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
    })

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-40 bg-slate-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-slate-300">
            {producto.nombre.charAt(0)}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-brand">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-slate-800">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-sm text-slate-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs font-medium ${sinStock || !producto.disponible ? 'text-error' : 'text-slate-500'}`}>
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button onClick={handleAgregar} disabled={!puedeAgregar}>
          {enCarrito > 0 ? `Agregar al carrito (${enCarrito})` : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}

export default ProductoCard
