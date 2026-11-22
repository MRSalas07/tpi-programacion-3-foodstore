// Mismos nombres de campo que los schemas de pedidos del backend

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface ItemPedidoCreate {
  producto_id: number
  cantidad: number
}

export interface PedidoCreate {
  items: ItemPedidoCreate[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

export interface CheckoutFormData {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

// Máquina de estados
export const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, EstadoPedido>> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'ENTREGADO',
}

export const ESTADOS_PEDIDO: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const ETIQUETA_FORMA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
}

export const esTerminal = (estado: EstadoPedido) => estado === 'ENTREGADO' || estado === 'CANCELADO'
