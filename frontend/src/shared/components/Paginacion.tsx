type PaginacionProps = {
  pagina: number
  totalPaginas: number
  totalRegistros: number
  onCambiar: (pagina: number) => void
}

function Paginacion({ pagina, totalPaginas, totalRegistros, onCambiar }: PaginacionProps) {
  const paginas = Math.max(totalPaginas, 1)

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
    >
      <span>
        {totalRegistros} {totalRegistros === 1 ? 'registro' : 'registros'}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn-page"
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina <= 0}
        >
          Anterior
        </button>
        <span>
          Página {pagina + 1} de {paginas}
        </span>
        <button
          type="button"
          className="btn-page"
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina + 1 >= paginas}
        >
          Siguiente
        </button>
      </div>
    </nav>
  )
}

export default Paginacion
