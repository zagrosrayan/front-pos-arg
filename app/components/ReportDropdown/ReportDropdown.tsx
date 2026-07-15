'use client'
import { userInfoSelector } from '@/app/features/auth/selectors'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import { useRouter } from 'next/navigation'
import { IoDocumentText } from 'react-icons/io5'
import { useSelector } from 'react-redux'

const ReportDropdown = () => {
  const router = useRouter()
  const userInfo = useSelector(userInfoSelector)
  const menuItems = [
    {
      key: 'customer-report',
      label: 'گزارش مشتریان',
      href: '/v1/dashboard/report/customer',
      permission: 'view_customer',
    },
    {
      key: 'resident-customer-report',
      label: 'گزارش مشتریان مقیم هتل',
      href: '/v1/dashboard/report/customer/resident',
      permission: 'view_customer',
    },
    {
      key: 'global-discount-report',
      label: 'گزارش تخفیف های استفاده شده همگانی',
      href: '/v1/dashboard/report/discount/global',
      permission: 'manage_discounts',
    },
    {
      key: 'discount-report',
      label: 'گزارش تخفیف های استفاده شده ساده',
      href: '/v1/dashboard/report/discount',
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
          aria-label="reports"
          color="success"
          className="rounded-full text-white"
        >
          <IoDocumentText className="size-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="report Actions"
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

export default ReportDropdown
