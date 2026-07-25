import { ModificationsProps } from './generalTypes'
import { RoleResponseProps } from './roleTypes'
import { TypeResponseProps } from './typeTypes'
// import { ProfitResponseProps } from './profitTypes'
//add company - branch update-m

export interface ProfitManagerProps extends ModificationsProps {
  id: number
  name: string
  status: string
  slug: string
  profit_manager_id: string
  profit_manager_type: string
}

export interface UserInfoProps extends ModificationsProps {
  id: number
  name: string
  username: string
  status: string
  // profit_manager_id: string
  profit_manager: ProfitManagerProps
  roles: RoleResponseProps[]
  profit_manager_id: string
}

export interface UserGuestResponseProps extends ModificationsProps {
  id: number
  address: string | null
  city: string | null
  name: string
  phone: string
  profit_manager_id: string
  next_purchase_discount_code?: string
  next_purchase_discount_expires_at?: string
  next_purchase_discount_amount?: number
  next_purchase_discount_percentage?: number
  club_points: number
  status: TypeResponseProps
  type: TypeResponseProps
}

export interface UserResidentResponseProps {
  GuestName: string
  AccCode: string
  Room: string
  CredLimit: string
  agency: string
  company: string
  source: string
  group: string
  Arrival: string
  departure: string
  Rate: string
  Note: string
  balance: string
  Profile: string
  Reserve: string
  Company: string
  Mobile: string
}

export interface UserResidentReportResponseProps
  extends UserResidentResponseProps {
  id: number
  points: {
    id: number
    points: string
    price_purchased: string
    reserve_number: string
    created_at: string
    updated_at: string
  }[]
  total_points: number
  CDate: string
  CiDate: string
  CoDate: string
  total_purchased: string
}
