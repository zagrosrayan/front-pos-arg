import { ModificationsProps } from './generalTypes'
import { TypeResponseProps } from './typeTypes'
import { UserInfoProps } from './userTypes'

export interface LogResponseProps extends ModificationsProps {
  id: number
  user_id: string
  status: string
  operation: string
  loggable_type: string
  loggable_id: string
  message: string
  date: string
  ip: string
  user: UserInfoProps
  status_type: TypeResponseProps
  operation_type: TypeResponseProps
}
