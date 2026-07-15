import { ElementType } from 'react'

export interface CategoryItemType {
  id: number
  name: string
  icon: ElementType
}

export interface FoodItemType {
  id: number
  name: string
  price: number
  description: string
  image: string
}

export interface ModificationsProps {
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}
