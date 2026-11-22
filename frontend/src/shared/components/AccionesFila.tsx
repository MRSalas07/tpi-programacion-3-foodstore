type AccionesFilaProps = {
  onEdit: () => void
  onDelete: () => void
  onStock?: () => void
}

function AccionesFila({ onEdit, onDelete, onStock }: AccionesFilaProps) {
  return (
    <div className="flex justify-end gap-3">
      <button type="button" className="font-medium text-brand hover:text-brand-hover" onClick={onEdit}>
        Editar
      </button>
      {onStock && (
        <button type="button" className="font-medium text-blue-700 hover:text-blue-900" onClick={onStock}>
          Stock
        </button>
      )}
      <button type="button" className="font-medium text-error hover:text-red-900" onClick={onDelete}>
        Eliminar
      </button>
    </div>
  )
}

export default AccionesFila
