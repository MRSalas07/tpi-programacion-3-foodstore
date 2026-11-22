import { Navigate, Outlet } from 'react-router-dom'
import type { Rol } from '@/features/auth/types/auth.types'
import { useAuthStore } from '@/store/authStore'

type ProtectedRouteProps = {
  allowedRoles?: Rol[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario)
  const cargando = useAuthStore((state) => state.cargando)

  if (cargando) {
    return (
      <p role="status" aria-live="polite" className="py-16 text-center text-sm text-slate-500">
        Verificando sesión...
      </p>
    )
  }

  if (!usuario) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
