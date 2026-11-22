import api from '@/shared/api/axiosInstance'
import type { UserPublic } from '../types/usuario.types'

const BASE_URL = '/admin/usuarios'

export async function getUsuarios(): Promise<UserPublic[]> {
  const { data } = await api.get<UserPublic[]>(BASE_URL)
  return data
}

export async function activarUsuario(id: number): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`${BASE_URL}/${id}/activar`)
  return data
}

export async function desactivarUsuario(id: number): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`${BASE_URL}/${id}/desactivar`)
  return data
}
