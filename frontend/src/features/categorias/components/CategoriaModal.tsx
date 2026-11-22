import type { FormEvent } from 'react'
import BotonesModal from '@/shared/components/BotonesModal'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { CategoriaFormApi } from '../hooks/useCategoriaForm'
import type { Categoria } from '../types/categoria.types'

type CategoriaModalProps = {
  isOpen: boolean
  categoriaEditando: Categoria | null
  form: CategoriaFormApi
  error: string | null
  onCancel: () => void
}

function CategoriaModal({ isOpen, categoriaEditando, form, error, onCancel }: CategoriaModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <Modal
      isOpen={isOpen}
      titulo={categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
      onClose={onCancel}
    >
      <form noValidate onSubmit={handleSubmit}>
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
              if (value.trim().length > 100) return 'El nombre no puede superar los 100 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="categoria-nombre"
              label="Nombre"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Ej. Bebidas"
              autoFocus
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div className="mb-4">
              <label htmlFor="categoria-descripcion" className="block text-sm font-medium text-slate-700">
                Descripción (opcional)
              </label>
              <textarea
                id="categoria-descripcion"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                rows={3}
                placeholder="Breve descripción..."
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
            <BotonesModal puedeGuardar={canSubmit} guardando={isSubmitting} onCancel={onCancel} />
          )}
        </form.Subscribe>
      </form>
    </Modal>
  )
}

export default CategoriaModal
