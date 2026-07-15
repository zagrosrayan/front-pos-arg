/* eslint-disable */

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button, Chip, cn } from '@heroui/react'
import OrderDetailTable from '@/app/components/DataTable/OrderDetailTable'
import CheckoutPrice from '@/app/components/Checkout/CheckoutPrice'
import {
  CONFIRM_ORDER_LABEL,
  UPDATE_ORDER_LABEL,
  RE_PRINT_LABEL,
  PRE_PRINT_LABEL,
  DELETE_ORDER_LABEL,
  CUSTOMER_INFO_LABEL,
  ORDER_DESTINATION_LABEL,
  CUSTOMER_NAME_LABEL,
  ROOM_LABEL,
  RESERVE_LABEL,
  PHONE_LABEL,
  DESC_NUMBER_LABEL,
  ORDER_STATUS_LABEL,
  POS_SERIAL,
} from '@/app/constant/label'
import { PAYMENT_INFO_TEXT, PAYMENT_METHOD_TEXT } from '@/app/constant/text'
import { DASHBOARD_PATH } from '@/routes/path'
import { getServiceType, OrderResponseProps } from '@/types/orderType'

/* ═══════════════════════════════════════════════════════════════
   تایپ‌ها
   ═══════════════════════════════════════════════════════════════ */

interface DiscountDisplayInfo {
  typeLabel: string
  code: string | null
  isExpired: boolean
  expiresAt: string | null
  amount: number
  percentage: number | null
}

interface OrderInfoDisplayProps {
  orderData: OrderResponseProps | null
  orderId: string | null
  isLoading: boolean
  isPrintLoading: boolean
  isCompleteLoading: boolean
  completeOrderSlug: string
  onCompleteOpen: () => void
  onDeleteOpen: () => void
  handlePrintOrder: () => void
  handlePrintButtonClick: () => void
  discountDisplayInfo?: DiscountDisplayInfo
  // برای سازگاری با کد قبلی
  discountTypeLabel?: string
  discountCode?: string | null
}

type PrintAction = 'reprint' | 'preprint' | null

/* ═══════════════════════════════════════════════════════════════
   توابع کمکی
   ═══════════════════════════════════════════════════════════════ */

/** بررسی انقضای تخفیف */
const isDiscountExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const OrderInfoDisplay = ({
  orderData,
  orderId,
  isPrintLoading,
  isCompleteLoading,
  completeOrderSlug,
  onCompleteOpen,
  onDeleteOpen,
  handlePrintOrder,
  handlePrintButtonClick,
  discountDisplayInfo,
  discountTypeLabel,
  discountCode,
}: OrderInfoDisplayProps) => {
  const [activePrintAction, setActivePrintAction] = useState<PrintAction>(null)

  // وقتی پرینت تمام شد، اکشن فعال ریست شود
  useEffect(() => {
    if (!isPrintLoading) setActivePrintAction(null)
  }, [isPrintLoading])

  const onReprintClick = () => {
    setActivePrintAction('reprint')
    handlePrintOrder()
  }

  const onPreprintClick = () => {
    setActivePrintAction('preprint')
    handlePrintButtonClick()
  }

  /** محاسبه اطلاعات تخفیف از orderData */
  const computedDiscountInfo = useMemo((): DiscountDisplayInfo => {
    // اگر discountDisplayInfo از props اومده، اون رو استفاده کن
    if (discountDisplayInfo) return discountDisplayInfo

    if (!orderData) {
      return {
        typeLabel: discountTypeLabel || '---',
        code: discountCode ?? null,
        isExpired: false,
        expiresAt: null,
        amount: 0,
        percentage: null,
      }
    }

    const clubUsed = Number((orderData as any).club_points_used ?? 0)
    const nextPurchaseDiscount = (orderData as any).next_purchase_discount
    const d: any = (orderData as any).discount
    const discountedPrice = Number((orderData as any).discounted_price ?? 0)

    let typeLabel = 'بدون تخفیف'
    let code: string | null = null
    let isExpired = false
    let expiresAt: string | null = null
    let percentage: number | null = null

    // امتیاز باشگاه
    if (clubUsed > 0) {
      typeLabel = 'امتیاز باشگاه مشتریان'
    }
    // تخفیف خرید بعدی
    else if (nextPurchaseDiscount) {
      expiresAt = nextPurchaseDiscount?.expires_at || null
      isExpired = isDiscountExpired(expiresAt)
      typeLabel = 'تخفیف خرید بعدی'
      code = nextPurchaseDiscount?.code || null
      percentage = nextPurchaseDiscount?.discount_percentage || null
    }
    // تخفیف عادی
    else if (d) {
      expiresAt = d?.expires_at || d?.end_date || null
      isExpired = isDiscountExpired(expiresAt)
      code = d?.code ?? d?.discount_code ?? null
      percentage = d?.discount_percentage || d?.percentage || null

      const name = String(d?.name ?? '')
      const scope = String(d?.scope ?? '')
      const slug = String(d?.slug ?? '')

      if (name) {
        typeLabel = name
      } else if (slug.includes('global') || scope === 'global') {
        typeLabel = 'تخفیف همگانی'
      } else if (slug.includes('normal') || scope === 'normal') {
        typeLabel = 'تخفیف ساده'
      } else if (scope === 'in_order') {
        typeLabel = 'تخفیف دستی'
      } else {
        typeLabel = 'تخفیف اعمال شده'
      }
    }
    // تخفیف بدون اطلاعات ولی مبلغ تخفیف دارد
    else if (discountedPrice > 0) {
      typeLabel = 'تخفیف اعمال شده'
    }

    // اگر discountTypeLabel از props اومده، اون رو جایگزین کن
    if (discountTypeLabel) {
      typeLabel = discountTypeLabel
    }

    // اگر discountCode از props اومده، اون رو جایگزین کن
    if (discountCode !== undefined) {
      code = discountCode
    }

    return {
      typeLabel,
      code,
      isExpired,
      expiresAt,
      amount: discountedPrice,
      percentage,
    }
  }, [orderData, discountDisplayInfo, discountTypeLabel, discountCode])

  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      <div className="flex w-full flex-col gap-5">
        {orderData && <OrderDetailTable orderData={orderData} />}

        {/* Desktop buttons */}
        <div className="hidden gap-3 xl:flex">
          {orderData?.status.slug !== completeOrderSlug && (
            <Button
              color="success"
              className="text-white"
              onPress={onCompleteOpen}
              isLoading={isCompleteLoading}
            >
              {CONFIRM_ORDER_LABEL}
            </Button>
          )}

          {orderData?.status.slug !== completeOrderSlug && (
            <Button
              variant="ghost"
              as={Link}
              href={`${DASHBOARD_PATH.MAIN}?order_id=${orderId ?? ''}`}
            >
              {UPDATE_ORDER_LABEL}
            </Button>
          )}

          {!orderData?.status.slug ||
            (orderData?.status.slug !== completeOrderSlug && (
              <Button
                variant="ghost"
                onPress={onReprintClick}
                isLoading={isPrintLoading && activePrintAction === 'reprint'}
              >
                {RE_PRINT_LABEL}
              </Button>
            ))}

          <Button
            variant="ghost"
            onPress={onPreprintClick}
            isLoading={isPrintLoading && activePrintAction === 'preprint'}
          >
            {PRE_PRINT_LABEL}
          </Button>

          {orderData?.status.slug !== completeOrderSlug && (
            <Button
              color="danger"
              className="mr-auto"
              variant="ghost"
              onPress={onDeleteOpen}
            >
              {DELETE_ORDER_LABEL}
            </Button>
          )}
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
              {ORDER_DESTINATION_LABEL}
            </dt>
            <dd className="flex gap-1 text-small font-semibold text-default-700">
              <span className="font-semibold">
                {getServiceType((orderData as any)?.service_type) ?? '---'}
              </span>
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-small text-default-500">
              {CUSTOMER_NAME_LABEL}
            </dt>
            <dd className="flex gap-1 text-small font-semibold text-default-700">
              <span className="font-semibold">
                {orderData?.customer
                  ? orderData.customer.name
                  : (orderData as any)?.reserve
                    ? (orderData as any)?.reserve?.GuestName
                    : '-----'}
              </span>
            </dd>
          </div>

          {(orderData as any)?.reserve && (
            <div className="flex justify-between">
              <dt className="text-small text-default-500">{ROOM_LABEL}</dt>
              <dd className="flex gap-1 text-small font-semibold text-default-700">
                <span className="font-semibold">
                  {(orderData as any).reserve?.Room ?? '---'}
                </span>
              </dd>
            </div>
          )}

          {(orderData as any)?.reserve && (
            <div className="flex justify-between">
              <dt className="text-small text-default-500">{RESERVE_LABEL}</dt>
              <dd className="flex gap-1 text-small font-semibold text-default-700">
                <span className="font-semibold">
                  {(orderData as any).reserve_number ?? '---'}
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

          {(orderData as any)?.desc_number && (
            <div className="flex justify-between">
              <dt className="text-small text-default-500">
                {DESC_NUMBER_LABEL}
              </dt>
              <dd className="flex gap-1 text-small font-semibold text-default-700">
                <span className="font-semibold">
                  {isNaN(Number((orderData as any).desc_number))
                    ? '---'
                    : Number((orderData as any).desc_number)}
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
              {orderData?.status ? (
                <Chip size="sm">{orderData.status.name}</Chip>
              ) : (
                '-----'
              )}
            </dd>
          </div>

          <div className="flex flex-wrap justify-between">
            <dt className="h-fit text-small text-default-500">
              {PAYMENT_METHOD_TEXT}
            </dt>
            <dd className="flex gap-1 text-small font-semibold text-default-700">
              {(orderData as any)?.payment_method ? (
                <Chip size="sm">{(orderData as any).payment_method.name}</Chip>
              ) : (
                '-----'
              )}
            </dd>
          </div>

          {/* نوع تخفیف با رنگ قرمز برای منقضی شده */}
          <div className="flex flex-wrap justify-between">
            <dt className="h-fit text-small text-default-500">نوع تخفیف</dt>
            <dd className="flex items-center gap-1 text-small font-semibold">
              <Chip
                size="sm"
                color={computedDiscountInfo.isExpired ? 'danger' : 'default'}
                variant={computedDiscountInfo.isExpired ? 'flat' : 'solid'}
                classNames={{
                  base: cn(
                    computedDiscountInfo.isExpired && 'border-danger-300'
                  ),
                  content: cn(
                    computedDiscountInfo.isExpired && 'text-danger-700'
                  ),
                }}
              >
                {computedDiscountInfo.typeLabel || '---'}
              </Chip>
              {computedDiscountInfo.isExpired && (
                <Chip size="sm" color="danger" variant="flat">
                  منقضی شده
                </Chip>
              )}
            </dd>
          </div>

          {/* کد تخفیف با رنگ قرمز و خط خورده برای منقضی شده */}
          <div className="flex flex-wrap justify-between">
            <dt className="h-fit text-small text-default-500">کد تخفیف</dt>
            <dd className="flex gap-1 text-small font-semibold text-default-700">
              <Chip
                size="sm"
                color={computedDiscountInfo.isExpired ? 'danger' : 'default'}
                variant={computedDiscountInfo.isExpired ? 'flat' : 'solid'}
                classNames={{
                  content: cn(
                    computedDiscountInfo.isExpired &&
                      'text-danger-700 line-through'
                  ),
                }}
              >
                {computedDiscountInfo.code
                  ? String(computedDiscountInfo.code)
                  : '---'}
              </Chip>
            </dd>
          </div>

          {/* مبلغ تخفیف */}
          {computedDiscountInfo.amount > 0 && (
            <div className="flex flex-wrap justify-between">
              <dt className="h-fit text-small text-default-500">مبلغ تخفیف</dt>
              <dd className="flex gap-1 text-small font-semibold">
                <Chip
                  size="sm"
                  color={computedDiscountInfo.isExpired ? 'danger' : 'success'}
                  variant="flat"
                  classNames={{
                    content: cn(
                      computedDiscountInfo.isExpired && 'line-through'
                    ),
                  }}
                >
                  {computedDiscountInfo.amount.toLocaleString('fa-IR')} ریال
                </Chip>
              </dd>
            </div>
          )}

          {/* تاریخ انقضا (فقط اگر منقضی شده باشد) */}
          {computedDiscountInfo.isExpired && computedDiscountInfo.expiresAt && (
            <div className="flex flex-wrap justify-between">
              <dt className="h-fit text-small text-default-500">تاریخ انقضا</dt>
              <dd className="flex gap-1 text-small font-semibold text-danger-600">
                {new Date(computedDiscountInfo.expiresAt).toLocaleDateString(
                  'fa-IR'
                )}
              </dd>
            </div>
          )}

          <div className="flex flex-wrap justify-between">
            <dt className="h-fit text-small text-default-500">{POS_SERIAL}</dt>
            <dd className="flex gap-1 text-small font-semibold text-default-700">
              {(orderData as any)?.serial_number ? (
                <span>{(orderData as any).serial_number}</span>
              ) : (
                '-----'
              )}
            </dd>
          </div>
        </dl>

        {/* هشدار تخفیف منقضی شده */}
        {computedDiscountInfo.isExpired && (
          <div className="rounded-lg border-2 border-danger-300 bg-danger-50 p-3">
            <p className="text-sm font-semibold text-danger-700">
              ⚠️ کد تخفیف منقضی شده است و در ثبت نهایی اعمال نخواهد شد.
            </p>
          </div>
        )}

        {/* Mobile buttons */}
        <div className="flex flex-col gap-3 sm:flex-row xl:hidden">
          {orderData?.status.slug !== completeOrderSlug && (
            <Button
              color="success"
              className="text-white"
              onPress={onCompleteOpen}
              isLoading={isCompleteLoading}
            >
              {CONFIRM_ORDER_LABEL}
            </Button>
          )}

          {orderData?.status.slug !== completeOrderSlug && (
            <Button
              variant="ghost"
              as={Link}
              href={`${DASHBOARD_PATH.MAIN}?order_id=${orderId ?? ''}`}
            >
              {UPDATE_ORDER_LABEL}
            </Button>
          )}

          {!orderData?.status.slug ||
            (orderData?.status.slug !== completeOrderSlug && (
              <Button
                variant="ghost"
                onPress={onReprintClick}
                isLoading={isPrintLoading && activePrintAction === 'reprint'}
              >
                {RE_PRINT_LABEL}
              </Button>
            ))}

          <Button
            variant="ghost"
            onPress={onPreprintClick}
            isLoading={isPrintLoading && activePrintAction === 'preprint'}
          >
            {PRE_PRINT_LABEL}
          </Button>

          {orderData?.status.slug !== completeOrderSlug && (
            <Button
              color="danger"
              className="sm:mr-auto"
              variant="ghost"
              onPress={onDeleteOpen}
            >
              {DELETE_ORDER_LABEL}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderInfoDisplay
