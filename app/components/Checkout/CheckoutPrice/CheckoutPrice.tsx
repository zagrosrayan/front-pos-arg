import { SERVICE_COST_LABEL } from '@/app/constant/label'
import { ORDER_EX_TEXT } from '@/app/constant/text'
import { OrderResponseProps } from '@/types/orderType'
import React, { useEffect } from 'react'

interface Props {
  orderData: OrderResponseProps
  simple?: boolean
}

const CheckoutPrice = ({ orderData, simple = false }: Props) => {
  // console.error('order', orderData)

  useEffect(() => {}, [orderData])

  // const hasRateService = orderData.rate_service

  // // Calculate total price
  // const totalPrice = orderData.children.reduce(
  //   (sum, item) => sum + Number(item.price), // * Number(item.quantity),
  //   0
  // )

  // const slug = orderData.status.slug
  // let rateService = 0
  // let discount = 0
  // let tax = 0
  // let finalPrice = 0
  // if (slug == 'order-status-pending') {
  //   // Calculate 15% serviceRate
  //   rateService = Math.floor(
  //     hasRateService != null && hasRateService != '0' ? totalPrice * 0.15 : 0
  //   )
  //   // Calculate 10% tax
  //   tax = Math.floor((totalPrice + rateService) * 0.1)
  //   finalPrice = Math.floor(totalPrice + rateService + tax)
  // } else {
  //   if (
  //     orderData.discounted_price != null &&
  //     Number(orderData.discounted_price) > 0
  //   )
  //     discount = Number(orderData.discounted_price)
  //   rateService = Number(orderData.rate_service)
  //   tax = Number(orderData.tax)
  //   finalPrice = Number(orderData.total_price)
  // }

  // Calculate total price
  // const totalPrice = orderData.discounted_price
  //   ? Number(orderData.price) - Number(orderData.discounted_price)
  //   : Number(orderData.price)

  // // Calculate 10% tax
  // const tax = totalPrice * (Number(orderData.tax) / 100)

  // const rateService = totalPrice * (Number(orderData.rate_service) / 100)

  return (
    <>
      <dl
        className={
          simple
            ? 'flex flex-col'
            : 'flex min-w-80 shrink-0 flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4'
        }
      >
        {!simple && (
          <>
            <h2 className="text-lg font-bold">{ORDER_EX_TEXT}</h2>

            <hr
              className="h-divider w-full shrink-0 border-none bg-default-200"
              role="separator"
            />
          </> 
        )}
        <div className="flex justify-between">
          <dt className="text-small text-default-500">جمع بعد از تخفیف</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(orderData?.price).toLocaleString('fa-IR')}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-small text-default-500">مبلغ قبل از تخفیف</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(orderData?.product_price).toLocaleString('fa-IR')}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>
        {orderData.discounted_price && (
          <div className="flex justify-between">
            <dt className="text-small text-default-500">تخفیف</dt>
            <dd className="flex gap-1 text-small font-semibold text-default-700">
              <span className="font-semibold">
                {Number(orderData?.discounted_price).toLocaleString('fa-IR')}
              </span>
              <span className="font-semibold">ریال</span>
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-small text-default-500">{SERVICE_COST_LABEL}</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(orderData?.rate_service).toLocaleString('fa-IR')}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-small text-default-500">مالیات</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(orderData?.tax).toLocaleString('fa-IR')}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>

        <hr
          className="h-divider w-full shrink-0 border-none bg-default-200"
          role="separator"
        />
        <div className="flex justify-between">
          <dt className="text-small font-semibold text-default-500">جمع کل</dt>
          <dd className="flex gap-1 text-large font-semibold text-success">
            <span className="font-semibold">
              {Number(orderData?.total_price).toLocaleString('fa-IR')}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>
      </dl>
    </>
  )
}

export default CheckoutPrice
