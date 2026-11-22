import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL_POR_DEFECTO = 'http://localhost:8000/api/v1'

const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? API_URL_POR_DEFECTO).replace(/\/$/, ''),
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail

    const sesionInvalida =
      status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.startsWith(ruta))
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA

    if (sesionInvalida || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)

export default api
