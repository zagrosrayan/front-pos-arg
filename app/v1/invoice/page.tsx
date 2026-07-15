'use client'

import { getServiceType, OrderResponseProps } from '@/types/orderType'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CUSTOMER_NAME_LABEL,
  ORDER_DESTINATION_LABEL,
  PHONE_LABEL,
  POS_SERIAL,
  RESERVE_LABEL,
  ROOM_LABEL,
} from '@/app/constant/label'
import CheckoutPrice from '@/app/components/Checkout/CheckoutPrice'
import { PAYMENT_METHOD_TEXT } from '@/app/constant/text'
import { CircularProgress } from '@heroui/progress'
import Image from 'next/image'
import { toPersianDigits } from '@/utils'

type PrintableOrder = OrderResponseProps & {
  discount_type_label?: string
  discount_code_value?: string | null

  // اگر از سمت خودت فرستادی، همین استفاده می‌شود (اولویت با این است)
  discount_description?: string | null

  // اگر از سمت خودت بفرستی عالیه (دقیق‌ترین حالت)
  discount_is_expired?: boolean | null

  __print_token?: string
}

type DiscountMode = 'percent' | 'fixed' | null

const safeNumber = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normalizeDiscountMode = (raw: any): DiscountMode => {
  const s = String(raw ?? '').toLowerCase()
  if (!s) return null
  if (s.includes('percent') || s.includes('%') || s.includes('درصد'))
    return 'percent'
  if (
    s.includes('fixed') ||
    s.includes('amount') ||
    s.includes('price') ||
    s.includes('ریال')
  )
    return 'fixed'
  return null
}

const buildDiscountDescriptionFromOrder = (order: PrintableOrder | null) => {
  if (!order) return '---'

  // اگر از سمت شما متن آماده آمده باشد همان نمایش داده می‌شود
  if (order.discount_description) return String(order.discount_description)

  const o: any = order
  const d: any = o.discount ?? {}

  // نوع تخفیف
  const typeLabel =
    String(order.discount_type_label ?? '').trim() ||
    String(d?.name ?? '').trim() ||
    (safeNumber(o.club_points_used) > 0
      ? 'امتیاز باشگاه مشتریان'
      : o.next_purchase_discount
        ? 'تخفیف خرید بعدی'
        : String(d?.slug ?? '').includes('global') ||
            String(d?.scope ?? '') === 'global'
          ? 'تخفیف همگانی'
          : String(d?.slug ?? '').includes('normal') ||
              String(d?.scope ?? '') === 'normal'
            ? 'تخفیف ساده'
            : '')

  // کد تخفیف
  const code =
    order.discount_code_value ??
    d?.code ??
    d?.discount_code ??
    o.discount_code ??
    null

  // مبلغ/درصد (هرجا موجود بود استفاده می‌کنیم)
  const mode: DiscountMode = normalizeDiscountMode(
    d?.type ?? d?.discount_type ?? o.discount_type
  )
  const value = safeNumber(d?.value ?? d?.amount ?? o.discount_value ?? 0)

  // منقضی بودن (اولویت: flag ارسالی)
  const expiresAtMs = d?.expires_at ? new Date(d.expires_at).getTime() : null
  const expiredNow =
    order.discount_is_expired != null
      ? Boolean(order.discount_is_expired)
      : d?.is_expired != null
        ? Boolean(d.is_expired)
        : expiresAtMs
          ? expiresAtMs < Date.now()
          : false

  // حالت‌های ویژه
  if (safeNumber(o.club_points_used) > 0) {
    const amount = safeNumber(o.discounted_price ?? value)
    if (amount > 0) {
      return `تخفیف «امتیاز باشگاه مشتریان» به مبلغ ${amount.toLocaleString('fa-IR')} ریال اعمال شد.`
    }
    return `تخفیف «امتیاز باشگاه مشتریان» اعمال شد.`
  }

  if (o.next_purchase_discount) {
    return 'تخفیف «خرید بعدی» برای این سفارش اعمال شد.'
  }

  // اگر هیچ اثری از تخفیف نبود
  if (
    !typeLabel &&
    !code &&
    safeNumber(o.discounted_price) <= 0 &&
    value <= 0
  ) {
    return 'بدون تخفیف.'
  }

  // تخفیف کددار
  if (code) {
    let base = `تخفیف «${typeLabel || 'کد تخفیف'}» با کد «${String(code)}» اعمال شد`
    if (mode === 'percent' && value > 0) base += ` به میزان ${value}٪`
    if (mode === 'fixed' && value > 0)
      base += ` به مبلغ ${value.toLocaleString('fa-IR')} ریال`
    if (expiredNow)
      base += ' (این کد در زمان ثبت سفارش معتبر بوده و اکنون منقضی است)'
    return base + '.'
  }

  // تخفیف دستی (بدون کد)
  if (value > 0) {
    if (mode === 'percent') return `تخفیف دستی به میزان ${value}٪ اعمال شد.`
    if (mode === 'fixed')
      return `تخفیف دستی به مبلغ ${value.toLocaleString('fa-IR')} ریال اعمال شد.`
    return 'تخفیف اعمال شد.'
  }

  // fallback
  if (typeLabel) return `تخفیف «${typeLabel}» اعمال شد.`
  return 'بدون تخفیف.'
}

const Page = () => {
  const [orderData, setOrderData] = useState<PrintableOrder | null>(null)

  const hasPrintedRef = useRef(false)
  const lastTokenRef = useRef<string | null>(null)

  const expectedOrigin = useMemo(() => window.location.origin, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return

      const data = event.data as PrintableOrder | null
      if (!data?.id) return

      const token =
        data.__print_token ||
        String((data as any).invoice_number ?? data.id ?? '')
      if (lastTokenRef.current === token) return

      lastTokenRef.current = token
      hasPrintedRef.current = false // اگر پیام جدید آمد، اجازه چاپ جدید بده

      setOrderData(data)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [expectedOrigin])

  useEffect(() => {
    if (!orderData) return
    if (hasPrintedRef.current) return

    hasPrintedRef.current = true

    const printStyle = `
      @page {
        size: A5;
        margin: 5mm;
      }
    `
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerHTML = printStyle
    document.head.appendChild(styleSheet)

    const t = window.setTimeout(() => {
      window.print()
    }, 700)

    return () => window.clearTimeout(t)
  }, [orderData])

  const discountDescription = useMemo(() => {
    return buildDiscountDescriptionFromOrder(orderData)
  }, [orderData])

  if (!orderData) {
    return (
      <div
        style={{ height: '100vh' }}
        className="flex flex-row items-center justify-center p-4"
      >
        <CircularProgress className={'mx-3'} color={'success'} />
        <h1 className={'mx-3'}>Loading</h1>
      </div>
    )
  }

  return (
    <div className="mx-auto rounded-lg bg-white px-6 py-2 text-right text-xs shadow-lg">
      <div
        className={'mx-auto items-center justify-center justify-items-center'}
      >
        <Image
          src="/assets/images/logo/arg-logo.svg"
          className="max-w-15"
          width={50}
          height={50}
          alt="logo"
          priority
        />
      </div>

      <div className="mx-autotext-right">
        <h2 className="mb-4 text-center text-large font-bold text-gray-800">
          فاکتور {orderData.user?.profit_manager?.name ?? ''}
        </h2>

        <hr className="mb-1" />

        <div className="mx-2 mb-1 grid grid-cols-2 gap-1">
          <div className="mx-1">
            <div className="flex justify-between">
              <dt className="text-xs text-default-500">
                {CUSTOMER_NAME_LABEL}
              </dt>
              <dd className="flex gap-1 text-xs font-semibold text-default-700">
                {orderData?.customer
                  ? orderData.customer.name
                  : orderData?.reserve
                    ? orderData?.reserve?.GuestName
                    : '------'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-500">{PHONE_LABEL}</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData?.customer?.phone
                  ? toPersianDigits(orderData.customer.phone.toString())
                  : '---'}
              </dd>
            </div>
          </div>

          <div className="mx-1">
            <div className="flex justify-between">
              <dt className="text-default-500">{ROOM_LABEL}</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData?.reserve?.Room
                  ? toPersianDigits(orderData.reserve.Room.toString())
                  : '---'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-500">{RESERVE_LABEL}</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData?.reserve_number
                  ? toPersianDigits(orderData.reserve_number.toString())
                  : '---'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-500">{ORDER_DESTINATION_LABEL}</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {getServiceType(orderData.service_type) ?? '---'}
              </dd>
            </div>
          </div>
        </div>

        <hr className="my-1" />

        <div className="mx-2 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 shadow-sm">
          <div className="mx-1">
            <div className="flex justify-between">
              <dt className="text-default-700">شماره فاکتور</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData?.invoice_number
                  ? toPersianDigits(orderData.invoice_number.toString())
                  : '---'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-700">تاریخ</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData.created_at
                  ? new Date(orderData.created_at as string).toLocaleString(
                      'fa-IR'
                    )
                  : '---'}
              </dd>
            </div>
          </div>

          <div className="mx-1">
            <div className="flex justify-between">
              <dt className="text-default-700">وضعیت سفارش</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData.status?.name ?? '---'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-700">{PAYMENT_METHOD_TEXT}</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData?.payment_method?.name ?? '---'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-700">نوع تخفیف</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData.discount_type_label ?? '---'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-default-700">کد تخفیف</dt>
              <dd className="flex gap-1 font-semibold text-default-700">
                {orderData.discount_code_value
                  ? String(orderData.discount_code_value)
                  : '---'}
              </dd>
            </div>

            {/* این قسمت جدید و مهم */}
            <div className="mt-1 flex justify-between">
              <dt className="text-default-700">توضیحات تخفیف</dt>
              <dd className="max-w-[220px] text-left font-semibold text-default-700">
                {discountDescription || '---'}
              </dd>
            </div>

            {orderData?.serial_number && (
              <div className="flex justify-between">
                <dt className="text-default-700">{POS_SERIAL}</dt>
                <dd className="flex gap-1 font-semibold text-default-700">
                  {orderData.serial_number}
                </dd>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="my-2" />

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">نام کالا</th>
            <th className="border border-gray-300 p-2">تعداد</th>
            <th className="border border-gray-300 p-2">فی (ریال)</th>
            <th className="border border-gray-300 p-2">مجموع (ریال)</th>
          </tr>
        </thead>

        <tbody>
          {orderData?.children?.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2 text-center">
                {toPersianDigits((index + 1).toString())}
              </td>
              <td className="border border-gray-300 p-2">{item.food?.name}</td>
              <td className="border border-gray-300 p-2 text-center">
                {toPersianDigits(item.quantity)}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {Number(item.food?.price).toLocaleString('fa-IR')}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {Number(item.price).toLocaleString('fa-IR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="my-2" />
      <CheckoutPrice orderData={orderData} simple />
    </div>
  )
}

export default Page
