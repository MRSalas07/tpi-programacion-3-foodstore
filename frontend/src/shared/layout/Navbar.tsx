import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2.5 py-1.5 text-sm font-medium hover:bg-slate-700 hover:text-white ${
    isActive ? 'bg-slate-700 text-white' : 'text-slate-300'
  }`

function Navbar() {
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const unidades = useCartStore((state) => state.items.reduce((suma, item) => suma + item.cantidad, 0))
  const navigate = useNavigate()

  const esAdmin = usuario?.role === 'admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-slate-900 text-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-xl font-bold">
          Food Store
        </NavLink>

        <div className="flex flex-wrap gap-1">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            Carrito{unidades > 0 && ` (${unidades})`}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          )}
          {/* El acceso al panel se muestra solo al admin; la protección real está en el backend */}
          {esAdmin && (
            <>
              <span className="mx-1 self-center text-slate-600">|</span>
              <NavLink to="/admin/resumen" className={claseEnlace}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={claseEnlace}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={claseEnlace}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={claseEnlace}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={claseEnlace}>
                Usuarios
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-medium">{usuario.full_name}</p>
                <p className="text-xs text-slate-400">Rol: {usuario.role}</p>
              </div>
              <button
                type="button"
                className="rounded border border-slate-500 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
                onClick={() => void handleLogout()}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className="btn-primary">
                Registrarme
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
