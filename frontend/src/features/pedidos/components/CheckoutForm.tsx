import type { FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { ETIQUETA_FORMA_PAGO, type CheckoutFormData, type FormaPago } from '../types/pedido.types'

type CheckoutFormProps = {
  onSubmit: (data: CheckoutFormData) => Promise<unknown>
  error: string | null
}

const checkoutFormVacio: CheckoutFormData = {
  direccion_entrega: '',
  forma_pago: 'EFECTIVO',
  notas: '',
}

const FORMAS_PAGO: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA']

function CheckoutForm({ onSubmit, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: checkoutFormVacio,
    onSubmit: async ({ value }) => {
      await onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim(),
      })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            if (value.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (value.trim().length > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            id="checkout-direccion"
            label="Dirección de entrega"
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder="Calle, número, piso y ciudad"
            autoComplete="street-address"
            autoFocus
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-slate-700">Forma de pago</legend>
            <div className="mt-2 flex gap-3">
              {FORMAS_PAGO.map((forma) => (
                <label
                  key={forma}
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm ${
                    field.state.value === forma ? 'border-brand bg-orange-50 font-medium' : 'border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="accent-brand"
                  />
                  {ETIQUETA_FORMA_PAGO[forma]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <div className="mb-4">
            <label htmlFor="checkout-notas" className="block text-sm font-medium text-slate-700">
              Notas (opcional)
            </label>
            <textarea
              id="checkout-notas"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              rows={3}
              placeholder="Ej. tocar timbre 2B, sin cebolla..."
              className="input resize-none"
            />
          </div>
        )}
      </form.Field>

      {error && (
        <p role="alert" className="alert-error mb-4">
          {error}
        </p>
      )}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export default CheckoutForm
