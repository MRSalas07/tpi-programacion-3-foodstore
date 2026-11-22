import Card from '@/shared/ui/Card'

type TarjetaResumenProps = {
  titulo: string
  valor: string | number
  descripcion: string
  acento: string
}

function TarjetaResumen({ titulo, valor, descripcion, acento }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 p-5 ${acento}`}>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{valor}</p>
      <p className="mt-1 text-xs text-slate-400">{descripcion}</p>
    </Card>
  )
}

export default TarjetaResumen
