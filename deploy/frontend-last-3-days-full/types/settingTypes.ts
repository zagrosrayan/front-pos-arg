export interface SettingResponseProps {
  id: number
  tax: number
  rate_service: number
}

export interface SettingRequestProps {
  id?: number
  tax: number
  rate_service: number
}
