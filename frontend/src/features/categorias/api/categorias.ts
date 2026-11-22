import api from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaCreate } from '../types/categoria.types'

const BASE_URL = '/categorias'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>(BASE_URL)
  return data
}

export async function createCategoria(payload: CategoriaCreate): Promise<Categoria> {
  const { data } = await api.post<Categoria>(BASE_URL, payload)
  return data
}

export async function updateCategoria(id: number, payload: Partial<CategoriaCreate>): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`${BASE_URL}/${id}`, payload)
  return data
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`)
}
