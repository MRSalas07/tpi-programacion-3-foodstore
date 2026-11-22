export type Rol = 'user' | 'admin'

//Modelo del Backend
export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export type UsuarioSesion = Pick<UserPublic, 'id' | 'username' | 'full_name' | 'email' | 'role'>

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface LoginFormData {
  username: string
  password: string
}

export interface MensajeResponse {
  message: string
}
