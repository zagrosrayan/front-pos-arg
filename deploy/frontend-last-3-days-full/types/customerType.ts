import { ModificationsProps } from './generalTypes'
import { TypeResponseProps } from './typeTypes'
import {
  UserInfoProps,
  UserGuestResponseProps,
  UserResidentResponseProps,
} from './userTypes'

export interface OrderItemProps {
  quantity: number
  food_id: number
  desc_number: number
  description: string | null
}

export interface OrderRequestProps {
  room_number: string | number
  phone: string
  name: string
  order: Array<OrderItemProps>
  rate_service: string | number
  payment_method: string | number
  discount_code: string
  desc_number: string | number
  reserve_number: number | string
}

export interface OrderResponseProps extends ModificationsProps {
  id: number
  room_number: string | number
  phone: string | number
  name: string
  order: Array<OrderItemProps>
  rate_service: string | number
  discount_code: string
  desc_number: string | number
  customer_id: number | null
  user_id: string
  status: TypeResponseProps
  reserve_number: string | null
  reserve: UserResidentResponseProps | null
  description: string | null
  payment_method: TypeResponseProps
  price: string
  total_price: string
  tax: string
  quantity: string
  discount_id: string | null
  discounted_price: string | null
  food_id: string | number | null
  order_date: string
  parent_id: string | number | null
  customer: UserGuestResponseProps | null
  address: string | null
  city: string | null
  type: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  pendingOrderCount: number
  pendingOrderTotal: number
  completeOrderCount: number
  completeOrderTotal: string
  points: number
  lastOrderDate: string
  user: UserInfoProps
  discount: null
  parent: null
  children: OrderResponseProps[]
}

export interface CustomersRequestProps {
  id: number
  from: string | null
  at: string | null
  name: string
  phone: string
  status: string | null
  type: TypeResponseProps | string | number | null
}
export interface CustomersResponseProps {
  city: string | null
  complete_order_count: number
  complete_order_total: string
  created_at: string
  deleted_at: string | null
  id: number
  last_order_date: string | null
  name: string
  pending_order_count: number
  pending_order_total: number
  phone: string
  points: string
  price_purchased: string | null
  status: string | null
  total_points: number
  total_purchased: string
  type: TypeResponseProps | null
  updated_at: string
}
