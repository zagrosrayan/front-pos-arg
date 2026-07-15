'use client'
import {
  PRINTERS_LIST_LABEL,
  ROLE_MANAGEMENT_LABEL, // تغییر داده شده
  USER_LOG_LABEL,
  USER_MANAGE_LABEL,
} from '@/app/constant/label'
import { userInfoSelector } from '@/app/features/auth/selectors'
import { DASHBOARD_PATH } from '@/routes/path'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import { useRouter } from 'next/navigation'
import { BsFillGearFill } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { SETTINGS_LABEL } from '../../constant/label'

const PermissionsDropdown = () => {
  const router = useRouter()
  const userInfo = useSelector(userInfoSelector)
  const menuItems = [
    {
      key: 'settings',
      label: SETTINGS_LABEL,
      href: DASHBOARD_PATH.SETTINGS,
      permission: 'settings',
    },
    {
      key: 'logs',
      label: USER_LOG_LABEL,
      href: DASHBOARD_PATH.LOGS,
      permission: 'view_logs',
    },
    {
      key: 'printers',
      label: PRINTERS_LIST_LABEL,
      href: DASHBOARD_PATH.PRINTERS,
      permission: 'manage_printers',
    },
    {
      key: 'assign',
      label: USER_MANAGE_LABEL,
      href: DASHBOARD_PATH.ASSIGN_ROLE,
      permission: 'manage_roles',
    },
    {
      key: 'roles',
      label: ROLE_MANAGEMENT_LABEL,
      href: DASHBOARD_PATH.ROLES,
      permission: 'manage_roles',
    },
  ]
  const userHasPermission = (permissionName: string): boolean => {
    if (userInfo) {
      return userInfo?.roles?.some((role) =>
        role.permissions.some(
          (permission) => permission.name === permissionName
        )
      )
    } else {
      return false
    }
  }
  const filteredMenuItems = menuItems.filter((item) =>
    userHasPermission(item.permission)
  )

  if (filteredMenuItems.length === 0) {
    return null
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="Settings"
          color="success"
          className="rounded-full text-white"
        >
          <BsFillGearFill className="size-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        variant="faded"
        onAction={(key) => {
          const href = filteredMenuItems.find((x) => x.key == key)?.href
          if (href) router.push(href)
        }}
      >
        {filteredMenuItems.map((item) => (
          <DropdownItem key={item.key}>{item.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}

export default PermissionsDropdown
