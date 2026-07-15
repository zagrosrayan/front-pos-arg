/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { apiRequest } from '@/lib/axios'
import { AUTH_API } from '@/routes/api/auth'
import { UserInfoProps } from '@/types/userTypes'
import { usePathname, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingPage from '../components/ui/LoadingPage'
import { setUserInfo } from '../features/auth/authSlice'
import { userInfoSelector } from '../features/auth/selectors'
import useAuth from '../hook/useAuth'
import { useLogout } from '../hook/useLogout'
import { useClearCart } from '../hook/useCart'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useAuth()
  const pathname = usePathname()
  const userInfo = useSelector(userInfoSelector)
  const dispatch = useDispatch()
  const { logout } = useLogout()
  const clearCart = useClearCart()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const fetchUserInfo = async () => {
    try {
      const response = await apiRequest<UserInfoProps[]>(AUTH_API.getUserInfo())
      dispatch(setUserInfo(response?.data[0] as UserInfoProps))
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      logout()
    }
  }
  useEffect(() => {
    if (!token) {
      logout()
    } else if (!userInfo) {
      fetchUserInfo()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, orderId])

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <main className="max-w-12xl relative mx-auto flex h-svh w-full flex-col-reverse justify-between md:flex-row">
      <Sidebar />
      <div className="flex w-full flex-col overflow-hidden">
        <Navbar />
        <section className="bg-white pt-3">{children}</section>
      </div>
    </main>
  )
}

export default DashboardLayout
