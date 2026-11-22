const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatearPrecio = (valor: number) => formatoMoneda.format(valor)

export const formatearFecha = (iso: string) => formatoFechaHora.format(new Date(iso))
