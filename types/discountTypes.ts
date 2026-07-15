import { CustomersResponseProps } from './customerType'
import { ModificationsProps } from './generalTypes'
import { ProfitResponseProps } from './profitTypes'
import { UserResidentResponseProps } from './userTypes'
export interface DiscountRequestProps {
  name: string
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  discount_code?: string | number
  minimum_price: null | number | string
  is_active: boolean
  is_special: boolean
  customer_id: string | number
  profit_manager_id: string | number
  reserve_number: string | number
  usage_limit: number
  starts_at: string
  expires_at: string
  // scope?: string
  // scope_id?: string | null
}

export interface DiscountResponseProps extends ModificationsProps {
  id: number
  name: string
  discount_value: string | number
  minimum_price: string | null
  is_active: boolean
  starts_at: string
  expires_at: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_code?: string | number
  profit_manager: ProfitResponseProps
  is_special: string | boolean
  customer_id: string | number
  customer: CustomersResponseProps
  profit_manager_id: number
  reserve_number: number
  reserve: UserResidentResponseProps
  usage_limit: number
  usage_count: string | number
}
export interface GlobalDiscountRequestProps {
  name: string
  discount_value: string | number
  code: string
  is_unlimited: boolean
  is_special: boolean
  starts_at: string
  expires_at: string
}

export interface GlobalDiscountResponseProps extends DiscountResponseProps {
  is_unlimited: boolean
}

export type TargetCustomerType = 'resident' | 'guest'

export interface NextPurchaseDiscountRequestProps {
  name: string
  minimum_purchase_amount: number | string
  discount_percentage: number | string
  days?: number | string
  discount_validity_days?: number | string
  reminder_days_before_expiration?: number | string
  discount_sms_template?: string
  reminder_sms_template?: string
  profit_manager_ids?: number[]
  target_customer_types?: TargetCustomerType[]
  is_active: boolean
  usage_limit?: number
}

export interface NextPurchaseDiscountResponseProps
  extends NextPurchaseDiscountRequestProps,
    ModificationsProps {
  id: number
  created_at?: string
  updated_at?: string
}
