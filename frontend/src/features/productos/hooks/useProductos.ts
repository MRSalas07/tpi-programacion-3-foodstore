import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos'
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate } from '../types/producto.types'


export function useProductos(filtros: FiltrosProductos) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    
    placeholderData: keepPreviousData,
  })

  
  const invalidarListado = () => queryClient.invalidateQueries({ queryKey: ['productos'] })

  const crearMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: invalidarListado,
  })

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoCreate }) => updateProducto(id, data),
    onSuccess: invalidarListado,
  })

  const stockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) => updateStock(id, data),
    onSuccess: invalidarListado,
  })

  const eliminarMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: invalidarListado,
  })

  return {
    productos: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    crearMutation,
    editarMutation,
    stockMutation,
    eliminarMutation,
  }
}
