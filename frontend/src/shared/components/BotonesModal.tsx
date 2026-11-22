import Button from '@/shared/ui/Button'

type BotonesModalProps = {
  puedeGuardar: boolean
  guardando: boolean
  onCancel: () => void
}

function BotonesModal({ puedeGuardar, guardando, onCancel }: BotonesModalProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variante="secondary" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={!puedeGuardar || guardando}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}

export default BotonesModal
