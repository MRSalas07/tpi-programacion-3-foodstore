import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
}

const clasePorVariante: Record<Variante, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
}

function Button({ variante = 'primary', type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`${clasePorVariante[variante]} ${className}`} {...props} />
}

export default Button
