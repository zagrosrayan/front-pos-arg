'use client'
import CheckoutPrice from '@/app/components/Checkout/CheckoutPrice'
import OrderDetailTable from '@/app/components/DataTable/OrderDetailTable'
import { EMPTY_CONTENT_ERROR } from '@/app/constant/error'
import {
  CUSTOMER_INFO_LABEL,
  CUSTOMER_NAME_LABEL,
  DESC_NUMBER_LABEL,
  ORDER_STATUS_LABEL,
  PHONE_LABEL,
  PRE_PRINT_LABEL,
  RE_PRINT_LABEL,
  RESERVE_LABEL,
  ROOM_LABEL,
} from '@/app/constant/label'
import {
  LOADING_CONTENT_TEXT,
  ORDERS_DETAIL_TEXT,
  PAYMENT_INFO_TEXT,
  PAYMENT_METHOD_TEXT,
} from '@/app/constant/text'
import { apiRequest } from '@/lib/axios'
import { ORDER_API } from '@/routes/api/order'
import { PRINTER_API } from '@/routes/api/printer'
import { DASHBOARD_PATH } from '@/routes/path'
import { PaginationResponseProps } from '@/types/apiTypes'
import { OrderResponseProps } from '@/types/orderType'
import { Button, Chip } from '@heroui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const Page = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') // Extract order_id from URL
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orderData, setOrderData] = useState<OrderResponseProps | null>(null)
  const [isPrintLoading, setIsPrintLoading] = useState(false)

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      const requestConfig = ORDER_API.getAll()
      requestConfig.params = { order_id: orderId }
      const response =
        await apiRequest<PaginationResponseProps<OrderResponseProps>>(
          requestConfig
        )

      const orderDataResponse = response?.data.items[0]
      if (orderDataResponse) {
        setOrderData(orderDataResponse)
      } else {
        toast.warning(EMPTY_CONTENT_ERROR)
        router.push(DASHBOARD_PATH.MAIN)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintOrder = async () => {
    try {
      setIsPrintLoading(true)
      const response = await apiRequest(PRINTER_API.printInvoice(), {
        order: orderId,
      })
      toast.success(response?.message)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPrintLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      toast.warning(EMPTY_CONTENT_ERROR)
      router.push(DASHBOARD_PATH.REPORT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return isLoading ? (
    <p className="my-5 w-full whitespace-nowrap text-center text-xl font-bold">
      {LOADING_CONTENT_TEXT}...
    </p>
  ) : (
    <div className="flex h-fit max-h-[calc(100svh-90px)] flex-col gap-5 overflow-y-auto p-5 pb-20 md:pb-0">
      <h1 className="text-xl font-bold text-default-700">
        {ORDERS_DETAIL_TEXT}
      </h1>
      <div className="flex flex-col gap-5 xl:flex-row">
        <div className="flex w-full flex-col gap-5">
          {orderData && <OrderDetailTable orderData={orderData} />}
          <div className="hidden gap-3 xl:flex">
            <Button
              variant="ghost"
              onPress={handlePrintOrder}
              isLoading={isPrintLoading}
            >
              {RE_PRINT_LABEL}
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                const invoiceWindow = window.open('../../invoice', '_blank')
                if (invoiceWindow)
                  setTimeout(() => {
                    invoiceWindow.postMessage(orderData, '*')
                  }, 2000)
              }}
              isLoading={isPrintLoading}
            >
              {PRE_PRINT_LABEL}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <dl className="flex min-w-80 shrink-0 flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
            <h2 className="text-lg font-bold">{CUSTOMER_INFO_LABEL}</h2>

            <hr
              className="h-divider w-full shrink-0 border-none bg-default-200"
              role="separator"
            />
            <div className="flex justify-between">
              <dt className="text-small text-default-500">
                {CUSTOMER_NAME_LABEL}
              </dt>
              <dd className="flex gap-1 text-small font-semibold text-default-700">
                <span className="font-semibold">
                  {orderData?.customer
                    ? orderData.customer.name
                    : orderData?.reserve
                      ? orderData?.reserve?.GuestName
                      : '------'}
                </span>
              </dd>
            </div>
            {orderData?.reserve && (
              <div className="flex justify-between">
                <dt className="text-small text-default-500">{ROOM_LABEL}</dt>
                <dd className="flex gap-1 text-small font-semibold text-default-700">
                  <span className="font-semibold">
                    {orderData.reserve.Room ?? '---'}
                  </span>
                </dd>
              </div>
            )}
            {orderData?.reserve && (
              <div className="flex justify-between">
                <dt className="text-small text-default-500">{RESERVE_LABEL}</dt>
                <dd className="flex gap-1 text-small font-semibold text-default-700">
                  <span className="font-semibold">
                    {orderData.reserve_number ?? '---'}
                  </span>
                </dd>
              </div>
            )}
            {orderData?.customer && (
              <div className="flex justify-between">
                <dt className="text-small text-default-500">{PHONE_LABEL}</dt>
                <dd className="flex gap-1 text-small font-semibold text-default-700">
                  <span className="font-semibold">
                    {orderData.customer.phone ?? '---'}
                  </span>
                </dd>
              </div>
            )}
            {orderData?.desc_number && (
              <div className="flex justify-between">
                <dt className="text-small text-default-500">
                  {DESC_NUMBER_LABEL}
                </dt>
                <dd className="flex gap-1 text-small font-semibold text-default-700">
                  <span className="font-semibold">
                    {orderData.desc_number ?? '---'}
                  </span>
                </dd>
              </div>
            )}
          </dl>
          {orderData && <CheckoutPrice orderData={orderData} />}
          <dl className="flex min-w-80 shrink-0 flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
            <h2 className="text-lg font-bold">{PAYMENT_INFO_TEXT}</h2>

            <hr
              className="h-divider w-full shrink-0 border-none bg-default-200"
              role="separator"
            />
            <div className="flex flex-wrap justify-between">
              <dt className="h-fit text-small text-default-500">
                {ORDER_STATUS_LABEL}
              </dt>
              <dd className="flex gap-1 text-small font-semibold text-default-700">
                {orderData && <Chip size="sm">{orderData?.status.name}</Chip>}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="h-fit text-small text-default-500">
                {PAYMENT_METHOD_TEXT}
              </dt>
              <dd className="flex gap-1 text-small font-semibold text-default-700">
                {orderData?.payment_method ? (
                  <Chip size="sm">{orderData?.payment_method.name}</Chip>
                ) : (
                  '-----'
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row xl:hidden">
          <Button
            variant="ghost"
            onPress={handlePrintOrder}
            isLoading={isPrintLoading}
          >
            {RE_PRINT_LABEL}
          </Button>
          <Button
            variant="ghost"
            onPress={() => {
              const invoiceWindow = window.open('../../invoice', '_blank')
              if (invoiceWindow)
                setTimeout(() => {
                  invoiceWindow.postMessage(orderData, '*')
                }, 2000)
            }}
            isLoading={isPrintLoading}
          >
            {PRE_PRINT_LABEL}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page
