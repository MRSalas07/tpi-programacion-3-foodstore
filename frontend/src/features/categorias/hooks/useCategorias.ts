import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
import type { Categoria, CategoriaCreate } from '../types/categoria.types'

const sinCategorias: Categoria[] = []

export function useCategorias() {
  const queryClient = useQueryClient()

  const {
    data: categorias = sinCategorias,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })

  const invalidarListado = () => queryClient.invalidateQueries({ queryKey: ['categorias'] })

  const crearMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: invalidarListado,
  })

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaCreate }) => updateCategoria(id, data),
    onSuccess: () => {
      invalidarListado()
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: invalidarListado,
  })

  return {
    categorias,
    isLoading,
    isError,
    error,
    refetch,
    crearMutation,
    editarMutation,
    eliminarMutation,
  }
}
