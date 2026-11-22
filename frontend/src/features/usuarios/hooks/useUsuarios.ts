import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'
import type { UserPublic } from '../types/usuario.types'

const sinUsuarios: UserPublic[] = []

export function useUsuarios() {
  const queryClient = useQueryClient()

  const {
    data: usuarios = sinUsuarios,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  })

  const invalidarListado = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] })

  const activarMutation = useMutation({
    mutationFn: activarUsuario,
    onSuccess: invalidarListado,
  })

  const desactivarMutation = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: invalidarListado,
  })

  return { usuarios, isLoading, isError, error, refetch, activarMutation, desactivarMutation }
}
