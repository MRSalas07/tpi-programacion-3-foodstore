import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  errores?: unknown[]
}

function Input({ id, label, errores = [], className = '', ...props }: InputProps) {
  const conError = errores.length > 0

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={conError}
        className={`input ${conError ? 'input-error' : ''}`}
        {...props}
      />
      {errores.map((error) => (
        <p key={String(error)} role="alert" className="mt-1 text-xs font-medium text-error">
          {String(error)}
        </p>
      ))}
    </div>
  )
}

export default Input
