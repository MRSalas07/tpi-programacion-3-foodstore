import { useState, type FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import Input from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'
import type { LoginFormData } from '../types/auth.types'

const loginFormVacio: LoginFormData = { username: '', password: '' }

function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: loginFormVacio,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        navigate('/', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card className="p-6">
        <h1 className="titulo-pagina mb-6">Iniciar sesión</h1>

        <form noValidate onSubmit={handleSubmit}>
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'El usuario es obligatorio' : undefined),
            }}
          >
            {(field) => (
              <Input
                id="login-username"
                label="Usuario"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoComplete="username"
                autoFocus
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? 'La contraseña es obligatoria' : undefined),
            }}
          >
            {(field) => (
              <Input
                id="login-password"
                label="Contraseña"
                type="password"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoComplete="current-password"
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>

          {error && (
            <p role="alert" className="alert-error mb-4">
              {error}
            </p>
          )}

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-brand hover:text-brand-hover">
            Registrate
          </Link>
        </p>
      </Card>
    </main>
  )
}

export default LoginPage
