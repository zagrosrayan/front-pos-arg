export interface ApiResponseType<T> {
  data: T
  status: number
  message: string
  extra_fields?: {
    pendingOrderCount: string | number
    pendingOrderTotal: string | number
    completeOrderCount: string | number
    completeOrderTotal: string | number
  }
}

export interface PaginationResponseProps<T> {
  items: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
export interface CalculateItems {
  discounted_price?: number | string
  rate_service?: number | string
  tax_amount?: number | string
  total_price?: number | string
  final_price?: number | string
  product_price?: number | string
  club_points_remaining: number | string | null
  club_points_used: number | string | null
}
export interface CalculateResponseProps<> {
  items: CalculateItems
  status: number
  message: string
}
