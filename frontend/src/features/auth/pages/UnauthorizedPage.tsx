import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="titulo-pagina mb-2">Acceso denegado</h1>
      <p className="mb-6 text-sm text-slate-600">No tenés permisos para ver esta página.</p>
      <Link to="/" className="btn-primary inline-block">
        Volver al inicio
      </Link>
    </main>
  )
}

export default UnauthorizedPage
