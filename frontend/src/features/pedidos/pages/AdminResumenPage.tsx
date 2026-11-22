import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import TarjetaResumen from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

function AdminResumenPage() {
  const { data: resumen, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="titulo-pagina mb-4">Resumen del negocio</h1>

      {isLoading ? (
        <Card>
          <Skeleton mensaje="Cargando indicadores..." cantidad={3} />
        </Card>
      ) : isError || !resumen ? (
        <Card>
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen
            titulo="Pendientes"
            valor={resumen.pendientes}
            descripcion="Pedidos esperando preparación"
            acento="border-l-amber-500"
          />
          <TarjetaResumen
            titulo="En preparación"
            valor={resumen.en_preparacion}
            descripcion="Pedidos que se están preparando"
            acento="border-l-blue-500"
          />
          <TarjetaResumen
            titulo="Entregados"
            valor={resumen.entregados}
            descripcion="Pedidos finalizados"
            acento="border-l-green-600"
          />
          <TarjetaResumen
            titulo="Cancelados"
            valor={resumen.cancelados}
            descripcion="Pedidos cancelados (stock restituido)"
            acento="border-l-red-600"
          />
          <TarjetaResumen
            titulo="Pedidos de hoy"
            valor={resumen.pedidos_hoy}
            descripcion="Creados desde la medianoche"
            acento="border-l-slate-500"
          />
          <TarjetaResumen
            titulo="Ingresos"
            valor={formatearPrecio(resumen.ingresos_entregados)}
            descripcion="Suma de los pedidos entregados"
            acento="border-l-brand"
          />
        </div>
      )}
    </main>
  )
}

export default AdminResumenPage
