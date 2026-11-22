import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import Card from '@/shared/ui/Card'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMITE = 8

function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const { categorias } = useCategorias()

  
  const { productos, total, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busqueda.trim() || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = Math.ceil(total / LIMITE)
  const hayFiltros = busqueda.trim() !== '' || categoriaId !== undefined

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="titulo-pagina mb-4">Catálogo</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={busqueda}
          onChange={(event) => {
            setBusqueda(event.target.value)
            setPagina(0)
          }}
          placeholder="Buscar producto por nombre..."
          aria-label="Buscar producto por nombre"
          className="input mt-0 sm:max-w-sm"
        />
        <select
          value={categoriaId ?? ''}
          onChange={(event) => {
            setCategoriaId(event.target.value ? Number(event.target.value) : undefined)
            setPagina(0)
          }}
          aria-label="Filtrar por categoría"
          className="input mt-0 sm:max-w-xs"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Skeleton mensaje="Cargando productos..." variante="tarjetas" cantidad={LIMITE} />
      ) : isError ? (
        <Card>
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        </Card>
      ) : productos.length === 0 ? (
        <Card>
          <EstadoVacio
            titulo="No encontramos productos"
            descripcion={
              hayFiltros
                ? 'Ningún producto coincide con la búsqueda o la categoría elegida.'
                : 'Todavía no hay productos en el catálogo.'
            }
            textoAccion="Limpiar filtros"
            onAccion={hayFiltros ? limpiarFiltros : undefined}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Card className="mt-6 overflow-hidden">
            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalRegistros={total}
              onCambiar={setPagina}
            />
          </Card>
        </>
      )}
    </main>
  )
}

export default CatalogoPage
