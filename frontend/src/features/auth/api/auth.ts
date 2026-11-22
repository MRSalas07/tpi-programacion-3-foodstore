import api from '@/shared/api/axiosInstance'
import type { MensajeResponse, UserCreate, UserPublic } from '../types/auth.types'

export async function login(username: string, password: string): Promise<MensajeResponse> {
  const body = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeResponse>('/auth/token', body)
  return data
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await api.post<MensajeResponse>('/auth/logout')
  return data
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>('/auth/me')
  return data
}

export async function register(payload: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>('/auth/register', payload)
  return data
}
