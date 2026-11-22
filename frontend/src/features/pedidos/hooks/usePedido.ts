import { useQuery } from '@tanstack/react-query'
import { getPedido } from '../api/pedidos'

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedidos', 'detalle', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  })
}
