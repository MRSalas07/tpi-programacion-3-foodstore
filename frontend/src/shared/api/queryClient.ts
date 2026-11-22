import { QueryClient } from '@tanstack/react-query'

// Instancia única de TanStack Query: caché del estado del servidor
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
