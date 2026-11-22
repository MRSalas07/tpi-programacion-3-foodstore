type BadgeEstadoProps = {
  estado: string
}

const estilos: Record<string, { etiqueta: string; clase: string }> = {
  PENDIENTE: { etiqueta: 'Pendiente', clase: 'bg-amber-100 text-amber-800' },
  EN_PREPARACION: { etiqueta: 'En preparación', clase: 'bg-blue-100 text-blue-800' },
  ENTREGADO: { etiqueta: 'Entregado', clase: 'bg-green-100 text-green-800' },
  CANCELADO: { etiqueta: 'Cancelado', clase: 'bg-red-100 text-red-800' },
}

function BadgeEstado({ estado }: BadgeEstadoProps) {
  const estilo = estilos[estado] ?? { etiqueta: estado, clase: 'bg-slate-100 text-slate-700' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${estilo.clase}`}>
      {estilo.etiqueta}
    </span>
  )
}

export default BadgeEstado
