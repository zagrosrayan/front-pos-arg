import { ArticleResponseProps } from './articleTypes'
import { ModificationsProps } from './generalTypes'
import { ProfitManagerProps } from './userTypes'

export interface FoodRequestProps {
  name: string
  slug: string
  description: string | null
  status: string | null
  price: string
  article_id: string | number | null | ArticleResponseProps
  food_id: string | number | null | FoodResponseProps
  profit_manager_id: string | number | null | ProfitManagerProps
}

export interface FoodResponseProps extends ModificationsProps {
  id: number
  name: string
  price: string
  slug: string
  status: string | null
  article_id: string
  profit_manager_id: string
  description: string | null
  image: string | null
  article: ArticleResponseProps
  profit_manager: ProfitManagerProps
}

export interface FoodReportSummaryProps {
  average_price: number
  order_count: number
  total_price: number
  total_quantity: number
}
export interface FoodReportResponseProps {
  id: number
  food_name: string
  article: string
  profit_manager: string
  summary: FoodReportSummaryProps
  orders: {
    created_at: string
    discounted_price: string
    order_id: number
    price: string
    quantity: string
    rate_service: string
    tax: string
    total: number
    total_price: number
    invoice_number: number
  }[]
  total_summary: {
    total_discount: number
    total_final: number
    total_order_price: number
    total_quantity: number
    total_service: number
    total_tax: number
  }
}
