import type { FormEvent } from 'react'
import type { Categoria } from '@/features/categorias'
import BotonesModal from '@/shared/components/BotonesModal'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { ProductoFormApi } from '../hooks/useProductoForm'
import type { Producto } from '../types/producto.types'

type ProductoModalProps = {
  isOpen: boolean
  productoEditando: Producto | null
  categorias: Categoria[]
  form: ProductoFormApi
  error: string | null
  onCancel: () => void
}

const validarNoNegativo = (etiqueta: string) => (value: number) => {
  if (Number.isNaN(value)) return `${etiqueta} es obligatorio`
  if (value < 0) return `${etiqueta} no puede ser negativo`
  return undefined
}

function ProductoModal({ isOpen, productoEditando, categorias, form, error, onCancel }: ProductoModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <Modal isOpen={isOpen} titulo={productoEditando ? 'Editar producto' : 'Nuevo producto'} onClose={onCancel}>
      <form noValidate onSubmit={handleSubmit}>
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return 'El nombre es obligatorio'
              if (value.trim().length > 150) return 'El nombre no puede superar los 150 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="producto-nombre"
              label="Nombre"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Ej. Hamburguesa clásica"
              autoFocus
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) => (Number.isNaN(value) ? 'La categoría es obligatoria' : undefined),
          }}
        >
          {(field) => (
            <div className="mb-4">
              <label htmlFor="producto-categoria" className="block text-sm font-medium text-slate-700">
                Categoría
              </label>
              <select
                id="producto-categoria"
                name={field.name}
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(Number(event.target.value || Number.NaN))}
                className={`input ${field.state.meta.errors.length > 0 ? 'input-error' : ''}`}
              >
                <option value="">Seleccioná una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.map((error) => (
                <p key={String(error)} role="alert" className="mt-1 text-xs font-medium text-error">
                  {String(error)}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div className="mb-4">
              <label htmlFor="producto-descripcion" className="block text-sm font-medium text-slate-700">
                Descripción (opcional)
              </label>
              <textarea
                id="producto-descripcion"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                rows={2}
                className="input resize-none"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarNoNegativo('El precio')(value) }}>
            {(field) => (
              <Input
                id="producto-precio"
                label="Precio base"
                type="number"
                min={0}
                step="0.01"
                name={field.name}
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                placeholder="0.00"
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                validarNoNegativo('El stock')(value) ??
                (Number.isInteger(value) ? undefined : 'El stock debe ser un número entero'),
            }}
          >
            {(field) => (
              <Input
                id="producto-stock"
                label="Stock"
                type="number"
                min={0}
                step="1"
                name={field.name}
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="producto-imagen"
              label="URL de la imagen (opcional)"
              type="url"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
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

export default ProductoModal
