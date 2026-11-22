import type { FormEvent } from 'react'
import BotonesModal from '@/shared/components/BotonesModal'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { StockFormApi } from '../hooks/useProductoForm'
import type { Producto } from '../types/producto.types'

type StockModalProps = {
  producto: Producto | null
  form: StockFormApi
  error: string | null
  onCancel: () => void
}


function StockModal({ producto, form, error, onCancel }: StockModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <Modal isOpen={producto !== null} titulo={`Stock de "${producto?.nombre ?? ''}"`} onClose={onCancel}>
      <form noValidate onSubmit={handleSubmit}>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              if (Number.isNaN(value)) return 'El stock es obligatorio'
              if (value < 0) return 'El stock no puede ser negativo'
              if (!Number.isInteger(value)) return 'El stock debe ser un número entero'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="stock-cantidad"
              label="Stock"
              type="number"
              min={0}
              step="1"
              name={field.name}
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.valueAsNumber)}
              autoFocus
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name={field.name}
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        {error && (
          <p role="alert" className="alert-error mb-4">
            {error}
          </p>
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <BotonesModal puedeGuardar={canSubmit} guardando={isSubmitting} onCancel={onCancel} />
          )}
        </form.Subscribe>
      </form>
    </Modal>
  )
}

export default StockModal
