'use client'
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
import { FaPercentage } from 'react-icons/fa'
import { useSelector } from 'react-redux'

const DiscountsDropdown = () => {
  const router = useRouter()
  const userInfo = useSelector(userInfoSelector)
  const menuItems = [
    {
      key: 'discount',
      label: 'لیست تخفیف ساده',
      href: DASHBOARD_PATH.LIST_DISCOUNT,
      permission: 'manage_discounts',
    },
    {
      key: 'create-discount',
      label: 'ایحاد تخفیف ساده',
      href: DASHBOARD_PATH.CREATE_DISCOUNT,
      permission: 'manage_discounts',
    },
    {
      key: 'global-discount',
      label: 'تخفیف همگانی',
      href: '/v1/dashboard/global-discount',
      permission: 'manage_discounts',
    },
    {
      key: 'club-setting',
      label: 'امتیاز بندی باشگاه مشتریان',
      href: '/v1/dashboard/club-setting',
      permission: 'update_settings',
    },
    {
      key: 'next-purchase-discount',
      label: 'تنظیمات تخفیف خرید بعدی',
      href: '/v1/dashboard/next-purchase-discount',
      permission: 'manage_discounts',
    },
  ]

  // Utility function to check if the user has a specific permission
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

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter((item) =>
    userHasPermission(item.permission)
  )

  if (filteredMenuItems.length === 0) {
    return null // Don't render the dropdown if no items are available
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="discounts"
          color="success"
          className="rounded-full text-white"
        >
          <FaPercentage className="size-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="discount Actions"
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

export default DiscountsDropdown
