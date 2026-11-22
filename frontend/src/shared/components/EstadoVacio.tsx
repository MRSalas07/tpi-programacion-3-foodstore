type EstadoVacioProps = {
  titulo: string
  descripcion: string
  textoAccion?: string
  onAccion?: () => void
}

function EstadoVacio({ titulo, descripcion, textoAccion, onAccion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <div
        aria-hidden="true"
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400"
      >
        ∅
      </div>
      <h2 className="text-base font-semibold text-slate-800">{titulo}</h2>
      <p className="max-w-sm text-sm text-slate-500">{descripcion}</p>
      {onAccion && textoAccion && (
        <button type="button" className="btn-primary mt-3" onClick={onAccion}>
          {textoAccion}
        </button>
      )}
    </div>
  )
}

export default EstadoVacio
