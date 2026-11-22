type SkeletonProps = {
  mensaje: string
  variante?: 'filas' | 'tarjetas'
  cantidad?: number
}

function Skeleton({ mensaje, variante = 'filas', cantidad = 5 }: SkeletonProps) {
  const elementos = Array.from({ length: cantidad }, (_, indice) => indice)

  return (
    <div role="status" aria-live="polite" className="p-4">
      <span className="sr-only">{mensaje}</span>
      {variante === 'tarjetas' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {elementos.map((indice) => (
            <div key={indice} className="overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="h-40 animate-pulse bg-slate-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {elementos.map((indice) => (
            <div key={indice} className="h-10 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      )}
      <p className="mt-3 text-sm text-slate-500">{mensaje}</p>
    </div>
  )
}

export default Skeleton
