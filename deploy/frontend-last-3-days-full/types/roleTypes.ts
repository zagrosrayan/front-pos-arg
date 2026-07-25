import { ModificationsProps } from './generalTypes'

export interface PermissionResponseProps extends ModificationsProps {
  id: number
  name: string
  guard_name: string
  profit_manager_id: string | number

  pivot: {
    role_id: string
    permission_id: string
  }
}
export interface RoleResponseProps extends ModificationsProps {
  id: number
  name: string
  guard_name: string
  permissions: PermissionResponseProps[]
  profit_manager_id: string | number
}

export interface RoleAssignRequestProps extends ModificationsProps {
  users: Array<number>
  role: string
  profit_manager_id: string | number
}
