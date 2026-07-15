'use client'

import SidebarTooltip from '@/app/components/Tooltip/SidebarTooltip'
import {
  BACK_TO_DASHBOARD_LABEL,
  CATEGORY_FOOD_LABEL,
  CUSTOMER_LIST_LABEL,
  FOOD_LIST_LABEL,
  ORDERS_LIST_LABEL,
  PROFIT_MANAGER_LABEL,
} from '@/app/constant/label'
import { FOOD_REPORTING_TEXT, TODAY_LIST_ORDER_TEXT } from '@/app/constant/text'
import { userInfoSelector } from '@/app/features/auth/selectors'
import { useCart } from '@/app/hook/useCart'
import { DASHBOARD_PATH } from '@/routes/path'
import { RoleResponseProps } from '@/types/roleTypes'
import { Badge, Button, cn } from '@heroui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { BiSolidReport } from 'react-icons/bi'
import { FaHome } from 'react-icons/fa'
import { FaBagShopping, FaClipboardList } from 'react-icons/fa6'
import { IoPeopleSharp, IoSettingsSharp } from 'react-icons/io5'
import { MdInsertChart, MdRestaurant, MdWarehouse } from 'react-icons/md'
import { PiListChecksBold } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import CheckoutDrawer from '../Checkout/CheckoutDrawer'
import PermissionGuard from '../PermissionGuard'
import PermissionsDropdown from '../PermissionsDropdown'
import DiscountsDropdown from '../DiscountsDropdown'
import ReportDropdown from '../ReportDropdown'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const userInfo = useSelector(userInfoSelector)
  const cart = useCart()
  return (
    <aside className="sticky bottom-0 left-0 z-40 flex h-auto flex-row-reverse items-center justify-start overflow-hidden bg-default-100 pb-3 pr-10 pt-1 md:relative md:top-0 md:h-full md:flex-col md:px-3">
      <Image
        src="/assets/images/logo/logo.svg"
        className="mx-auto mt-3 hidden w-full max-w-14 text-black md:flex"
        width={1000}
        height={1000}
        alt="logo"
        priority
      />
      {/* <div className="min-w-10 md:hidden"></div> */}
      <div className="my-auto flex w-full items-start justify-center gap-5 overflow-hidden overflow-x-auto pl-2 pr-72 sm:pr-0 md:flex-col md:overflow-x-hidden md:px-2">
        <SidebarTooltip label={BACK_TO_DASHBOARD_LABEL}>
          <Button
            as={Link}
            isIconOnly
            aria-label="Like"
            color="success"
            className="rounded-full text-white"
            href={DASHBOARD_PATH.MAIN}
          >
            <FaHome className="size-5" />
          </Button>
        </SidebarTooltip>
        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="manage_orders"
        >
          <SidebarTooltip label={TODAY_LIST_ORDER_TEXT}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.ORDERS}
            >
              <FaClipboardList className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>
        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="food_report"
        >
          <SidebarTooltip label={FOOD_REPORTING_TEXT}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.FOOD_REPORT}
            >
              <MdInsertChart className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>
        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="manage_orders"
        >
          <SidebarTooltip label={ORDERS_LIST_LABEL}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.REPORT}
            >
              <BiSolidReport className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>
        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="manage_foods"
        >
          <SidebarTooltip label={FOOD_LIST_LABEL}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.FOOD}
            >
              <MdRestaurant className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>

        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="manage_article"
        >
          <SidebarTooltip label={CATEGORY_FOOD_LABEL}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.ARTICLE}
            >
              <PiListChecksBold className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>

        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="manage_profit_manager"
        >
          <SidebarTooltip label={PROFIT_MANAGER_LABEL}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.PROFIT_MANAGER}
            >
              <MdWarehouse className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>
        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="view_customer"
        >
          <SidebarTooltip label={CUSTOMER_LIST_LABEL}>
            <Button
              as={Link}
              isIconOnly
              aria-label="Like"
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.CUSTOMER}
            >
              <IoPeopleSharp className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>
        <PermissionGuard
          roles={userInfo?.roles as RoleResponseProps[]}
          permissionName="update_settings"
        >
          <SidebarTooltip label="تنظیمات مالیات و حق سرویس">
            <Button
              as={Link}
              isIconOnly
              color="success"
              className="rounded-full text-white"
              href={DASHBOARD_PATH.TAX_SETTINGS}
            >
              <IoSettingsSharp className="size-5" />
            </Button>
          </SidebarTooltip>
        </PermissionGuard>
        <DiscountsDropdown />
        <ReportDropdown />
        <PermissionsDropdown />
      </div>
      <div className="fixed bottom-3.5 right-0 md:static">
        <Badge
          color="danger"
          content={cart.length.toLocaleString('fa-IR', {
            useGrouping: 'false',
          })}
          isInvisible={!cart.length}
          shape="circle"
          size="lg"
          classNames={{ badge: cn('text-sm'), base: cn('lg:hidden') }}
        >
          <Button
            isIconOnly
            className="rounded-full text-white lg:hidden"
            radius="full"
            color="success"
            onPress={() => setIsOpen(true)}
          >
            <FaBagShopping className="size-5" />
          </Button>
        </Badge>
      </div>
      <CheckoutDrawer isOpen={isOpen} onOpenChange={setIsOpen} />
    </aside>
  )
}

export default Sidebar
