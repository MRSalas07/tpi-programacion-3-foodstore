type EstadoErrorProps = {
  mensaje: string
  onReintentar?: () => void
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-base font-semibold text-error">No se pudieron cargar los datos</p>
      <p className="max-w-md text-sm text-slate-600">{mensaje}</p>
      {onReintentar && (
        <button type="button" className="btn-secondary" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export default EstadoError
