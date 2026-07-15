'use client'

import { LOGOUT_LABEL } from '@/app/constant/label'
import { userInfoSelector } from '@/app/features/auth/selectors'
import { useLogout } from '@/app/hook/useLogout'
import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  NavbarContent,
  Navbar as NextNavbar,
  User,
} from '@heroui/react'
import { TbLogout } from 'react-icons/tb'
import { useSelector } from 'react-redux'

const Navbar = () => {
  const userInfo = useSelector(userInfoSelector)
  const { logout } = useLogout()

  return (
    <div className="sticky top-0 z-20 h-[72px] bg-white pt-2">
      <NextNavbar
        className="z-20 w-full bg-white"
        classNames={{ wrapper: 'max-w-12xl justify-between' }}
      >
        <NavbarContent
          as={'div'}
          className="shrink-0 items-center"
          justify="start"
        >
          <Image
            src="/assets/images/logo/arg-logo-text.svg"
            className="w-full max-w-40 shrink-0"
            alt="logo"
            radius="none"
          />
        </NavbarContent>
        <NavbarContent as="div" className="h-fit items-center" justify="end">
          <Dropdown placement="bottom-end" radius="sm">
            <DropdownTrigger>
              <User
                description={userInfo?.username}
                name={userInfo?.name}
                classNames={{
                  base: cn('cursor-pointer'),
                  description: cn('hidden sm:inline-block'),
                  name: cn('hidden sm:inline-block'),
                }}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<TbLogout />}
                className="text-danger"
                onPress={logout}
              >
                {LOGOUT_LABEL}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </NextNavbar>
    </div>
  )
}

export default Navbar
