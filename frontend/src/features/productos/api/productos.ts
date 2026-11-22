import api from '@/shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
} from '../types/producto.types'

const BASE_URL = '/productos'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>(BASE_URL, { params: filtros })
  return data
}

export async function createProducto(payload: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>(BASE_URL, payload)
  return data
}

export async function updateProducto(id: number, payload: Partial<ProductoCreate>): Promise<Producto> {
  const { data } = await api.put<Producto>(`${BASE_URL}/${id}`, payload)
  return data
}

export async function updateStock(id: number, payload: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`${BASE_URL}/${id}/stock`, payload)
  return data
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`)
}
