export interface SettingResponseProps {
  id: number
  tax: number
  rate_service: number
  send_order_complete_sms: boolean
  order_complete_sms_template: string
}

export interface SettingRequestProps {
  id?: number
  tax: number
  rate_service: number
  send_order_complete_sms: boolean
  order_complete_sms_template: string
}
