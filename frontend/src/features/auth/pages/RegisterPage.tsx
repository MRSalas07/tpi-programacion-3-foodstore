import { useState, type FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import Input from '@/shared/ui/Input'
import { register } from '../api/auth'
import type { UserCreate } from '../types/auth.types'

const registerFormVacio: UserCreate = {
  username: '',
  full_name: '',
  email: '',
  password: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Campo = {
  name: keyof UserCreate
  label: string
  type: string
  autoComplete: string
  validar: (value: string) => string | undefined
}

const campos: Campo[] = [
  {
    name: 'username',
    label: 'Usuario',
    type: 'text',
    autoComplete: 'username',
    validar: (value) => {
      if (value.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres'
      if (value.trim().length > 50) return 'El usuario no puede superar los 50 caracteres'
      return undefined
    },
  },
  {
    name: 'full_name',
    label: 'Nombre completo',
    type: 'text',
    autoComplete: 'name',
    validar: (value) => {
      if (!value.trim()) return 'El nombre completo es obligatorio'
      if (value.trim().length > 120) return 'El nombre no puede superar los 120 caracteres'
      return undefined
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    validar: (value) => {
      if (!value.trim()) return 'El email es obligatorio'
      if (!EMAIL_REGEX.test(value.trim())) return 'El email no es válido'
      return undefined
    },
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    autoComplete: 'new-password',
    validar: (value) => {
      if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
      if (value.length > 72) return 'La contraseña no puede superar los 72 caracteres'
      return undefined
    },
  },
]

function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: registerFormVacio,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card className="p-6">
        <h1 className="titulo-pagina mb-6">Crear cuenta</h1>

        <form noValidate onSubmit={handleSubmit}>
          {campos.map((campo) => (
            <form.Field
              key={campo.name}
              name={campo.name}
              validators={{ onChange: ({ value }) => campo.validar(value) }}
            >
              {(field) => (
                <Input
                  id={`registro-${campo.name}`}
                  label={campo.label}
                  type={campo.type}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoComplete={campo.autoComplete}
                  errores={field.state.meta.errors}
                />
              )}
            </form.Field>
          ))}

          {error && (
            <p role="alert" className="alert-error mb-4">
              {error}
            </p>
          )}

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-brand hover:text-brand-hover">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </main>
  )
}

export default RegisterPage
