import { useForm } from '@tanstack/react-form'
import type { ProductoCreate, ProductoStockUpdate } from '../types/producto.types'


export const productoFormVacio: ProductoCreate = {
  nombre: '',
  descripcion: '',
  precio_base: Number.NaN,
  imagen_url: '',
  stock: 0,
  disponible: true,
  categoria_id: Number.NaN,
}

export function useProductoForm(onSubmit: (data: ProductoCreate) => Promise<unknown>) {
  return useForm({
    defaultValues: productoFormVacio,
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        imagen_url: value.imagen_url.trim(),
      })
    },
  })
}

export function useStockForm(onSubmit: (data: ProductoStockUpdate) => Promise<unknown>) {
  return useForm({
    defaultValues: { stock: 0, disponible: true } as ProductoStockUpdate,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })
}

export type ProductoFormApi = ReturnType<typeof useProductoForm>
export type StockFormApi = ReturnType<typeof useStockForm>
