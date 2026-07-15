'use client'
import DashboardCard from '@/app/components/DashboardCard'
import OrderTable from '@/app/components/DataTable/OrderTable'
import { TODAY_LIST_ORDER_TEXT } from '@/app/constant/text'
import { apiRequest } from '@/lib/axios'
import { ORDER_API } from '@/routes/api/order'
import { ApiResponseType, PaginationResponseProps } from '@/types/apiTypes'
import { OrderResponseProps } from '@/types/orderType'
import { useEffect, useState } from 'react'
import {
  BsBarChartLine,
  BsBarChartLineFill,
  BsClipboardCheck,
} from 'react-icons/bs'

const Page = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [ordersList, setOrdersList] = useState<ApiResponseType<
    PaginationResponseProps<OrderResponseProps>
  > | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const requestConfig = ORDER_API.getAll()
      requestConfig.params = { today: 1 }
      const response =
        await apiRequest<PaginationResponseProps<OrderResponseProps>>(
          requestConfig
        )
      setOrdersList(response)
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="relative h-[calc(100svh-90px)] w-full space-y-8 overflow-y-auto p-5 pb-20 md:pb-0">
      {isLoading ? (
        <div className="center grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardCard isLoading />
          <DashboardCard isLoading />
          <DashboardCard isLoading />
          <DashboardCard isLoading />
        </div>
      ) : (
        <div className="center grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardCard
            title="سفارشات تکمیل شده"
            description={Number(
              ordersList?.extra_fields?.completeOrderCount
            ).toLocaleString('fa-IR', { useGrouping: 'false' })}
            icon={BsClipboardCheck}
          />
          <DashboardCard
            title="مبلغ سفارشات تکمیل شده (ریال)"
            description={Number(
              ordersList?.extra_fields?.completeOrderTotal
            ).toLocaleString('fa-IR', { useGrouping: 'false' })}
            icon={BsBarChartLineFill}
          />
          <DashboardCard
            title="سفارشات در حال تکمیل"
            description={Number(
              ordersList?.extra_fields?.pendingOrderCount
            ).toLocaleString('fa-IR', { useGrouping: 'false' })}
            icon={BsClipboardCheck}
          />
          <DashboardCard
            title="مبلغ سفارشات در حال تکمیل (ریال)"
            description={Number(
              ordersList?.extra_fields?.pendingOrderTotal
            ).toLocaleString('fa-IR', { useGrouping: 'false' })}
            icon={BsBarChartLine}
          />
        </div>
      )}
      <h1 className="text-xl font-bold">{TODAY_LIST_ORDER_TEXT}</h1>
      <OrderTable />
    </div>
  )
}

export default Page
