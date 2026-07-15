'use client'
import {
  FROM_DATE_LABEL,
  ORDERS_LIST_LABEL,
  REPORT_LABEL,
  ROOM_LABEL,
  TO_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { ORDER_API } from '@/routes/api/order'
import { DASHBOARD_PATH } from '@/routes/path'
import { OrderResponseProps } from '@/types/orderType'
import { Button, Chip, Tooltip } from '@heroui/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { TbEye } from 'react-icons/tb'
import FormDatePicker from '../../ui/FormDatePicker'
import FormInput from '../../ui/FormInput'
import DataTable, { ColumnsData } from '../DataTable'
import { useForm } from 'react-hook-form'

type SearchFormValues = {
  invoice_number: string
}

const ReportTable = () => {
  const [filters, setFilters] = useState({})
  const [currentKey, setCurrentKey] = useState(0)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const methods = useForm()
  const searchMethods = useForm<SearchFormValues>({
    mode: 'onChange',
    defaultValues: {
      invoice_number: '',
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    const updatedFilters = { ...filters, ...data }
    setFilters(updatedFilters)
    setCurrentKey((prev) => prev + 1)
  }

  const handleSearchSubmit = (data: SearchFormValues) => {
    setInvoiceSearch(data.invoice_number || '')
    setCurrentKey((prev) => prev + 1)
  }

  // ارسال شماره فاکتور به بک‌اند (exact match)
  const extraFilterParameters = useMemo(() => {
    const params: Record<string, string | number> = {
      ...filters,
    }

    if (invoiceSearch.trim()) {
      params.invoice_number = String(invoiceSearch.trim())
    }

    return params
  }, [filters, invoiceSearch])

  const columns: ColumnsData<OrderResponseProps>[] = [
    {
      name: 'کد سفارش',
      uid: 'invoice_number',
      render: (order: OrderResponseProps) => (
        <span>{order.invoice_number}</span>
      ),
    },
    {
      name: 'تاریخ سفارش',
      uid: 'date',
      render: (order: OrderResponseProps) => (
        <span dir="ltr">
          {new Date(order.created_at as string).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'نام مشتری',
      uid: 'name',
      render: (order: OrderResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {order.customer?.name
            ? order.customer?.name
            : (order.reserve?.GuestName ?? '---------')}{' '}
        </span>
      ),
    },
    {
      name: 'نوع مشتری',
      uid: 'type',
      render: (order: OrderResponseProps) => (
        <span>{order.customer ? 'مهمان' : 'مقیم'}</span>
      ),
    },
    {
      name: 'ثبت کننده',
      uid: 'user',
      render: (order: OrderResponseProps) => (
        <span>{order.user.name ?? '---'}</span>
      ),
    },
    {
      name: 'مبلغ کل‌(ریال)',
      uid: 'price',
      render: (order: OrderResponseProps) => (
        <span>{Number(order.total_price).toLocaleString('fa-IR')}</span>
      ),
    },
    {
      name: 'وضعیت سفارش',
      uid: 'status',
      render: (order: OrderResponseProps) =>
        order.status?.name ? (
          <Chip
            className="capitalize"
            color="default"
            size="sm"
            variant="flat"
            radius="sm"
          >
            {order.status?.name}
          </Chip>
        ) : (
          '------'
        ),
    },
    {
      name: 'شماره اتاق',
      uid: 'room_number',
      render: (order: OrderResponseProps) => (
        <span>{order.reserve?.Room ?? '-------'}</span>
      ),
    },
    {
      name: 'شماره رزرو',
      uid: 'reserve_number',
      render: (order: OrderResponseProps) => (
        <span>{order.reserve_number ?? '-------'}</span>
      ),
    },
    {
      name: 'نحوه تسویه',
      uid: 'settlement',
      render: (order: OrderResponseProps) =>
        order.payment_method?.name ? (
          <Chip
            className="capitalize"
            color={'primary'}
            size="sm"
            variant="faded"
            radius="sm"
          >
            {order.payment_method?.name}
          </Chip>
        ) : (
          '-------'
        ),
    },
    {
      name: 'جزئیات سفارش',
      uid: 'actions',
      render: (order: OrderResponseProps) => (
        <div className="relative flex items-center justify-center gap-2">
          <Tooltip content="جزئیات سفارش" closeDelay={0} delay={0}>
            <Button
              isIconOnly
              variant="light"
              as={Link}
              href={DASHBOARD_PATH.REPORT_DETAIL + `?order_id=${order.id}`}
              size="sm"
              className="text-lg text-default-400 active:opacity-50"
            >
              <TbEye />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            {REPORTING_TEXT} :
          </h1>
          <FormLayout
            onSubmit={handleFormSubmit}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            methods={methods}
          >
            <FormDatePicker name="from" label={FROM_DATE_LABEL} />
            <FormDatePicker name="to" label={TO_DATE_LABEL} />
            <FormInput name="room_number" label={ROOM_LABEL} />
            <Button
              color="success"
              size="lg"
              type="submit"
              className="my-auto w-fit text-white"
              radius="sm"
            >
              {REPORT_LABEL}
            </Button>
          </FormLayout>
        </div>

        {/* فرم جستجوی شماره فاکتور */}
        <div className="space-y-5">
          <h2 className="px-3 text-xl font-bold text-default-700">
            جستجو با شماره فاکتور :
          </h2>
          <FormLayout<SearchFormValues>
            onSubmit={handleSearchSubmit}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            methods={searchMethods}
          >
            <FormInput<SearchFormValues>
              name="invoice_number"
              label="شماره فاکتور (دقیق)"
              placeholder="شماره فاکتور کامل را وارد کنید..."
            />
            <Button
              color="primary"
              size="lg"
              type="submit"
              className="my-auto w-fit text-white"
              radius="sm"
            >
              جستجو
            </Button>
          </FormLayout>
        </div>
      </div>

      <h2 className="text-xl font-bold text-default-700">
        {ORDERS_LIST_LABEL}
      </h2>

      <DataTable
        columns={columns}
        apiMethods={ORDER_API}
        key={currentKey}
        dataTableId="report_table"
        extraFilterParameters={extraFilterParameters}
      />
    </div>
  )
}

export default ReportTable
