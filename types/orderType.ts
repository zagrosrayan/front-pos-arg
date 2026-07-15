import { FoodResponseProps } from './foodTypes'
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

  discount_normal_code?: string | null
  discount_global_code?: string | null
  discount_next_purchase_code?: string | null
  use_next_purchase_discount?: boolean | null

  discount_code?: string
  desc_number: string | number
  reserve_number: number | string
  service_type: ServiceType
  discount_type?: DiscountType
  discount_value?: number
  serial_number?: string
  hasDiscount?: string
  customer_type?: string
  customer_id?: string | number | null
  use_club_points?: boolean | null
  selected_discount_type?: string
}

export enum DiscountType {
  percentage = 'percentage',
  fixed = 'fixed',
}

export enum ServiceType {
  takeaway = 'takeaway',
  dine_in = 'dine_in',
  room_service = 'room_service',
}

export interface OrderResponseProps extends ModificationsProps {
  id: number
  customer_id: number | null
  invoice_number: string | null
  user_id: string
  status: TypeResponseProps
  reserve_number: string | null
  reserve: UserResidentResponseProps | null
  rate_service: string
  desc_number: string | number | null
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
  user: UserInfoProps
  discount: any
  food: FoodResponseProps | null
  parent: null
  children: OrderResponseProps[]
  service_type: ServiceType
  serial_number?: string
  product_price?: string | number
  club_points_used?: string
  next_purchase_discount?: any
}

export const getServiceType = (service_type?: ServiceType) => {
  switch (service_type) {
    case 'takeaway':
      return 'بیرون بر'
    case 'room_service':
      return 'داخل اتاق'
    case 'dine_in':
      return 'سالن'
  }
}
