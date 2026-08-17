'use client'

import DataTable, { ColumnsData } from '@/app/components/DataTable/DataTable'
import { CUSTOMER_ORDERS_API } from '@/routes/api/customer'
import { DASHBOARD_PATH } from '@/routes/path'
import { CustomersResponseProps } from '@/types/customerType'
import { OrderResponseProps } from '@/types/orderType'
import { Button, Chip, Tooltip } from '@heroui/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { TbEye } from 'react-icons/tb'

const CustomerDetailPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer_id')
  const rawReturnTo = searchParams.get('return_to')

  const returnTo =
    rawReturnTo?.startsWith(DASHBOARD_PATH.CUSTOMER_REPORT) &&
    !rawReturnTo.startsWith(DASHBOARD_PATH.CUSTOMER_REPORT_DETAIL)
      ? rawReturnTo
      : DASHBOARD_PATH.CUSTOMER_REPORT

  const [customer, setCustomer] = useState<CustomersResponseProps | null>(null)

  const currentDetailUrl = useMemo(() => {
    if (!customerId) return DASHBOARD_PATH.CUSTOMER_REPORT_DETAIL

    return `${DASHBOARD_PATH.CUSTOMER_REPORT_DETAIL}?customer_id=${customerId}&return_to=${encodeURIComponent(
      returnTo
    )}`
  }, [customerId, returnTo])

  const columns: ColumnsData<OrderResponseProps>[] = [
    {
      name: 'شماره فاکتور',
      uid: 'invoice_number',
      render: (order) => <span>{order.invoice_number ?? '-------'}</span>,
    },
    {
      name: 'تاریخ سفارش',
      uid: 'created_at',
      render: (order) => (
        <span dir="ltr">
          {order.created_at
            ? new Date(order.created_at).toLocaleString('fa-IR')
            : '-------'}
        </span>
      ),
    },
    {
      name: 'وضعیت سفارش',
      uid: 'status',
      render: (order) =>
        order.status?.name ? (
          <Chip size="sm" variant="flat">
            {order.status.name}
          </Chip>
        ) : (
          '-------'
        ),
    },
    {
      name: 'نحوه تسویه',
      uid: 'payment_method',
      render: (order) => <span>{order.payment_method?.name ?? '-------'}</span>,
    },
    {
      name: 'ثبت کننده',
      uid: 'user',
      render: (order) => <span>{order.user?.name ?? '-------'}</span>,
    },
    {
      name: 'مبلغ کل (ریال)',
      uid: 'total_price',
      render: (order) => (
        <span>{Number(order.total_price ?? 0).toLocaleString('fa-IR')}</span>
      ),
    },
    {
      name: 'جزئیات سفارش',
      uid: 'actions',
      render: (order) => (
        <Tooltip content="جزئیات سفارش" closeDelay={0} delay={0}>
          <Button
            isIconOnly
            variant="light"
            as={Link}
            href={`${DASHBOARD_PATH.REPORT_DETAIL}?order_id=${
              order.id
            }&return_to=${encodeURIComponent(currentDetailUrl)}`}
            size="sm"
            className="text-lg text-default-400 active:opacity-50"
          >
            <TbEye />
          </Button>
        </Tooltip>
      ),
    },
  ]

  if (!customerId) {
    return (
      <div className="p-5">
        <Button onPress={() => router.replace(returnTo)}>
          بازگشت به گزارش مشتریان
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-fit max-h-[calc(100svh-90px)] flex-col gap-5 overflow-y-auto p-5 pb-20 md:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-default-700">جزئیات مشتری</h1>
        <Button variant="flat" onPress={() => router.push(returnTo)}>
          بازگشت به گزارش مشتریان
        </Button>
      </div>

      {customer && (
        <dl className="grid gap-4 rounded-large border-2 border-default-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <dt className="text-small text-default-500">نام مشتری</dt>
            <dd className="font-semibold">{customer.name ?? '-------'}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">شماره موبایل</dt>
            <dd className="font-semibold">{customer.phone ?? '-------'}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">امتیاز</dt>
            <dd className="font-semibold">
              {Number(customer.total_points ?? 0).toLocaleString('fa-IR')}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">تاریخ آخرین سفارش</dt>
            <dd className="font-semibold" dir="ltr">
              {customer.last_order_date ?? '-------'}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">سفارش‌های تکمیل‌شده</dt>
            <dd className="font-semibold">
              {Number(customer.complete_order_count ?? 0).toLocaleString(
                'fa-IR'
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">
              مبلغ سفارش‌های تکمیل‌شده
            </dt>
            <dd className="font-semibold">
              {Number(customer.complete_order_total ?? 0).toLocaleString(
                'fa-IR'
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">سفارش‌های در انتظار</dt>
            <dd className="font-semibold">
              {Number(customer.pending_order_count ?? 0).toLocaleString(
                'fa-IR'
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-default-500">
              مبلغ سفارش‌های در انتظار
            </dt>
            <dd className="font-semibold">
              {Number(customer.pending_order_total ?? 0).toLocaleString(
                'fa-IR'
              )}
            </dd>
          </div>
        </dl>
      )}

      <h2 className="text-lg font-bold text-default-700">سفارشات مشتری</h2>

      <DataTable
        columns={columns}
        apiMethods={CUSTOMER_ORDERS_API(customerId)}
        dataTableId="customer_orders_table"
        setExtraFields={(extraFields) => {
          if (extraFields?.customer) {
            setCustomer(extraFields.customer as CustomersResponseProps)
          }
        }}
      />
    </div>
  )
}

export default CustomerDetailPage
