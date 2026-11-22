import { useForm } from '@tanstack/react-form'
import type { CategoriaCreate } from '../types/categoria.types'

export const categoriaFormVacio: CategoriaCreate = {
  nombre: '',
  descripcion: '',
}

export function useCategoriaForm(onSubmit: (data: CategoriaCreate) => Promise<unknown>) {
  return useForm({
    defaultValues: categoriaFormVacio,
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      })
    },
  })
}

export type CategoriaFormApi = ReturnType<typeof useCategoriaForm>
