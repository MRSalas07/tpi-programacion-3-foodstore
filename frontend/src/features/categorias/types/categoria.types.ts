// Mismos nombres de campo que CategoriaRead y CategoriaCreate del backend
export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

export type CategoriaCreate = Pick<Categoria, 'nombre' | 'descripcion'>
