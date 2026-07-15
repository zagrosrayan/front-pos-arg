import { ModificationsProps } from './generalTypes'

export interface ClubRequestProps {
  points_per_purchase: number
  amount_per_point: number
  points_per_discount: number
  discount_amount_per_point: number
}

export interface ClubResponseProps extends ModificationsProps {
  items: {
    id: number
    amount_per_point: number
    discount_amount_per_point: number
    points_per_discount: number
    points_per_purchase: number
    created_at: string
    updated_at: string
  }
}
