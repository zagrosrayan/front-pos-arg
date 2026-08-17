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
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TbEye } from 'react-icons/tb'
import FormDatePicker from '../../ui/FormDatePicker'
import FormInput from '../../ui/FormInput'
import DataTable, { ColumnsData } from '../DataTable'
import { useForm } from 'react-hook-form'

type ReportFilterFormValues = {
  from: string
  to: string
  room_number: string
}

type SearchFormValues = {
  invoice_number: string
}

type StoredReportFilters = {
  from: string | null
  to: string | null
  room_number: string | null
  invoice_number: string | null
}

const STORAGE_KEY = 'report_table_filters'

const loadFiltersFromStorage = (): StoredReportFilters | null => {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredReportFilters) : null
  } catch {
    return null
  }
}

const saveFiltersToStorage = (
  filters: Record<string, string>,
  invoice: string
) => {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        from: filters.from || null,
        to: filters.to || null,
        room_number: filters.room_number || null,
        invoice_number: invoice || null,
      } satisfies StoredReportFilters)
    )
  } catch {}
}

const getFilterFromUrlOrStorage = (
  searchParams: URLSearchParams,
  key: keyof StoredReportFilters,
  storedFilters: StoredReportFilters | null
) => {
  const urlValue = searchParams.get(key)
  if (urlValue !== null) return urlValue
  return storedFilters?.[key] ?? ''
}

const ReportTable = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentKey, setCurrentKey] = useState(0)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [filtersRestored, setFiltersRestored] = useState(false)

  const methods = useForm<ReportFilterFormValues>({
    defaultValues: {
      from: '',
      to: '',
      room_number: '',
    },
  })

  const searchMethods = useForm<SearchFormValues>({
    mode: 'onChange',
    defaultValues: {
      invoice_number: '',
    },
  })

  const updateReportUrl = useCallback(
    (
      nextFilters: Record<string, string>,
      nextInvoice: string,
      resetPage = true
    ) => {
      const params = new URLSearchParams(searchParams.toString())

      const setOrDelete = (key: string, value: string) => {
        const normalizedValue = value.trim()
        if (normalizedValue) params.set(key, normalizedValue)
        else params.delete(key)
      }

      setOrDelete('from', nextFilters.from ?? '')
      setOrDelete('to', nextFilters.to ?? '')
      setOrDelete('room_number', nextFilters.room_number ?? '')
      setOrDelete('invoice_number', nextInvoice)

      if (resetPage) {
        params.set('page', '1')
      }

      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const storedFilters = loadFiltersFromStorage()
    const currentSearchParams = new URLSearchParams(searchParams.toString())

    const restoredFilters: Record<string, string> = {
      from: getFilterFromUrlOrStorage(
        currentSearchParams,
        'from',
        storedFilters
      ),
      to: getFilterFromUrlOrStorage(currentSearchParams, 'to', storedFilters),
      room_number: getFilterFromUrlOrStorage(
        currentSearchParams,
        'room_number',
        storedFilters
      ),
    }

    const restoredInvoice = getFilterFromUrlOrStorage(
      currentSearchParams,
      'invoice_number',
      storedFilters
    )

    setFilters(restoredFilters)
    setInvoiceSearch(restoredInvoice)

    // FormDatePicker مقدار Gregorian را به صورت رشته YYYY-MM-DD نگه می‌دارد.
    // بنابراین همان رشته ذخیره‌شده را مستقیم به فرم برمی‌گردانیم.
    methods.reset({
      from: restoredFilters.from,
      to: restoredFilters.to,
      room_number: restoredFilters.room_number,
    })

    searchMethods.reset({
      invoice_number: restoredInvoice,
    })

    saveFiltersToStorage(restoredFilters, restoredInvoice)

    // اگر کاربر از مسیر دیگری دوباره وارد گزارش شده باشد، فیلترهای ذخیره‌شده
    // را وارد URL می‌کنیم تا UI، درخواست API و pagination یک منبع مشترک داشته باشند.
    const normalizedParams = new URLSearchParams(searchParams.toString())
    const setOrDelete = (key: string, value: string) => {
      if (value.trim()) normalizedParams.set(key, value.trim())
      else normalizedParams.delete(key)
    }

    setOrDelete('from', restoredFilters.from)
    setOrDelete('to', restoredFilters.to)
    setOrDelete('room_number', restoredFilters.room_number)
    setOrDelete('invoice_number', restoredInvoice)

    if (normalizedParams.toString() !== searchParams.toString()) {
      const queryString = normalizedParams.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    }

    setFiltersRestored(true)
    // این restore فقط یک بار در mount انجام می‌شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormSubmit = (data: ReportFilterFormValues) => {
    const updatedFilters: Record<string, string> = {
      from: data.from ?? '',
      to: data.to ?? '',
      room_number: String(data.room_number ?? '').trim(),
    }

    setFilters(updatedFilters)
    saveFiltersToStorage(updatedFilters, invoiceSearch)
    updateReportUrl(updatedFilters, invoiceSearch)
    setCurrentKey((prev) => prev + 1)
  }

  const handleSearchSubmit = (data: SearchFormValues) => {
    const value = String(data.invoice_number ?? '').trim()

    setInvoiceSearch(value)
    saveFiltersToStorage(filters, value)
    updateReportUrl(filters, value)
    setCurrentKey((prev) => prev + 1)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      from: '',
      to: '',
      room_number: '',
    }

    setFilters(emptyFilters)
    setInvoiceSearch('')
    methods.reset(emptyFilters)
    searchMethods.reset({ invoice_number: '' })

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }

    updateReportUrl(emptyFilters, '')
    setCurrentKey((prev) => prev + 1)
  }

  const extraFilterParameters = useMemo(() => {
    const params: Record<string, string | number> = {}

    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to
    if (filters.room_number) params.room_number = filters.room_number
    if (invoiceSearch.trim()) params.invoice_number = invoiceSearch.trim()

    return params
  }, [filters, invoiceSearch])

  const reportReturnUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())

    const setOrDelete = (key: string, value: string) => {
      if (value.trim()) params.set(key, value.trim())
      else params.delete(key)
    }

    setOrDelete('from', filters.from ?? '')
    setOrDelete('to', filters.to ?? '')
    setOrDelete('room_number', filters.room_number ?? '')
    setOrDelete('invoice_number', invoiceSearch)

    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }, [filters, invoiceSearch, pathname, searchParams])

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
              href={`${DASHBOARD_PATH.REPORT_DETAIL}?order_id=${order.id}&return_to=${encodeURIComponent(
                reportReturnUrl
              )}`}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-default-700">
          {ORDERS_LIST_LABEL}
        </h2>

        {(filters.from ||
          filters.to ||
          filters.room_number ||
          invoiceSearch) && (
          <Button
            color="danger"
            variant="flat"
            size="sm"
            onPress={handleClearFilters}
          >
            پاک کردن همه فیلترها
          </Button>
        )}
      </div>

      {filtersRestored && (
        <DataTable
          columns={columns}
          apiMethods={ORDER_API}
          key={currentKey}
          dataTableId="report_table"
          extraFilterParameters={extraFilterParameters}
        />
      )}
    </div>
  )
}

export default ReportTable
