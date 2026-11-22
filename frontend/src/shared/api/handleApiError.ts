import axios from 'axios'

type ErrorValidacion = { msg?: unknown; loc?: unknown }

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.'
    }
    const { detail } = (error.response.data ?? {}) as { detail?: unknown }

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
      const mensajes = detail
        .map((item: ErrorValidacion) => {
          const campo = Array.isArray(item.loc) ? item.loc.at(-1) : null
          const mensaje = typeof item.msg === 'string' ? item.msg : null
          if (!mensaje) return null
          return campo ? `${String(campo)}: ${mensaje}` : mensaje
        })
        .filter((mensaje): mensaje is string => mensaje !== null)
      if (mensajes.length > 0) return mensajes.join(' · ')
    }
    return `Error ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Error inesperado'
}
