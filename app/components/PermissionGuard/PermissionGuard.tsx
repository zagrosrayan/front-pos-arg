// components/PermissionGuard.tsx
import React from 'react'
import { RoleResponseProps } from '@/types/roleTypes'
import { hasPermission } from '@/utils'

type PermissionGuardProps = {
  roles: RoleResponseProps[]
  permissionName: string
  children: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  roles,
  permissionName,
  children,
}) => {
  if (!hasPermission(roles, permissionName)) {
    return null // Hide the component if the user doesn't have the required permission
  }

  return <>{children}</> // Render the component if permission is granted
}

export default PermissionGuard
