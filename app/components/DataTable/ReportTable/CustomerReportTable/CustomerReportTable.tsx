'use client'

import {
  CUSTOMER_LIST_LABEL,
  CUSTOMER_NAME_LABEL,
  FOOD_LABEL,
  FROM_DATE_LABEL,
  PHONE_LABEL,
  REPORT_LABEL,
  TO_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormDatePicker from '@/app/components/ui/FormDatePicker'
import FormInput from '@/app/components/ui/FormInput'
import FormNumberInput from '@/app/components/ui/FormNumberInput'
import FormSelect from '@/app/components/ui/FormSelect'
import FormLayout from '@/app/layout/FormLayout'
import { downloadFile } from '@/lib/axios'
import { CUSTOMER_REPORT_API } from '@/routes/api/customer'
import { FOOD_API } from '@/routes/api/food'
import { DASHBOARD_PATH } from '@/routes/path'
import { CustomersResponseProps } from '@/types/customerType'
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from '@heroui/react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoChevronDownCircleOutline } from 'react-icons/io5'
import { TbEye } from 'react-icons/tb'
import DataTable, { ColumnsData } from '../../DataTable'

type CustomerReportFilterValues = {
  name?: string
  phone?: string
  month_since_last_purchase?: string | number | null
  min_points?: string | number | null
  max_points?: string | number | null
  food_id?: string | number | { id: string | number; name: string } | null
  order_from?: string | null
  order_to?: string | null
}

const FILTER_KEYS = [
  'name',
  'phone',
  'month_since_last_purchase',
  'min_points',
  'max_points',
  'food_id',
  'food_label',
  'order_from',
  'order_to',
]

const CustomerReportTable = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const methods = useForm<CustomerReportFilterValues>({
    defaultValues: {
      name: '',
      phone: '',
      month_since_last_purchase: null,
      min_points: null,
      max_points: null,
      food_id: null,
      order_from: '',
      order_to: '',
    },
  })

  const [filters, setFilters] = useState<Record<string, string | number>>({})
  const [currentKey, setCurrentKey] = useState(0)
  const [isDownload, setIsDownload] = useState(false)
  const [selectedOption, setSelectedOption] = useState(new Set(['pdf']))
  const [filtersRestored, setFiltersRestored] = useState(false)
  const [selectedFoodLabel, setSelectedFoodLabel] = useState('')

  useEffect(() => {
    const foodId = searchParams.get('food_id') ?? ''
    const foodLabel = searchParams.get('food_label') ?? ''

    const restoredFormValues: CustomerReportFilterValues = {
      name: searchParams.get('name') ?? '',
      phone: searchParams.get('phone') ?? '',
      month_since_last_purchase:
        searchParams.get('month_since_last_purchase') ?? null,
      min_points: searchParams.get('min_points') ?? null,
      max_points: searchParams.get('max_points') ?? null,
      food_id:
        foodId && foodLabel
          ? {
              id: foodId,
              name: foodLabel,
            }
          : foodId || null,
      order_from: searchParams.get('order_from') ?? '',
      order_to: searchParams.get('order_to') ?? '',
    }

    methods.reset(restoredFormValues)
    setSelectedFoodLabel(foodLabel)

    const restoredFilters: Record<string, string | number> = {}

    for (const key of [
      'name',
      'phone',
      'month_since_last_purchase',
      'min_points',
      'max_points',
      'food_id',
      'order_from',
      'order_to',
    ]) {
      const value = searchParams.get(key)
      if (value) restoredFilters[key] = value
    }

    setFilters(restoredFilters)
    setFiltersRestored(true)
    // فقط هنگام mount، URL به فرم hydrate می‌شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const normalizeFoodId = (
    value: CustomerReportFilterValues['food_id']
  ): string => {
    if (value && typeof value === 'object') {
      return String(value.id ?? '')
    }

    return value === null || value === undefined ? '' : String(value)
  }

  const updateUrl = (
    nextFilters: Record<string, string | number>,
    foodLabel: string
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    FILTER_KEYS.forEach((key) => params.delete(key))

    Object.entries(nextFilters).forEach(([key, value]) => {
      const normalized = String(value ?? '').trim()
      if (normalized) params.set(key, normalized)
    })

    if (nextFilters.food_id && foodLabel.trim()) {
      params.set('food_label', foodLabel.trim())
    }

    params.set('page', '1')

    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  const handleFormSubmit = (data: CustomerReportFilterValues) => {
    const nextFilters: Record<string, string | number> = {}

    const values: Record<string, unknown> = {
      name: data.name,
      phone: data.phone,
      month_since_last_purchase: data.month_since_last_purchase,
      min_points: data.min_points,
      max_points: data.max_points,
      food_id: normalizeFoodId(data.food_id),
      order_from: data.order_from,
      order_to: data.order_to,
    }

    Object.entries(values).forEach(([key, value]) => {
      const normalized = String(value ?? '').trim()
      if (normalized) nextFilters[key] = normalized
    })

    setFilters(nextFilters)
    updateUrl(nextFilters, selectedFoodLabel)
    setCurrentKey((prev) => prev + 1)
  }

  const handleDownload = async () => {
    try {
      setIsDownload(true)

      const request = CUSTOMER_REPORT_API.getAll()
      request.params = {
        ...filters,
        pdf: selectedOption.has('pdf') ? 1 : undefined,
        excel: selectedOption.has('excel') ? 1 : undefined,
      }

      await downloadFile(
        request,
        selectedOption.has('pdf')
          ? 'customer_report.pdf'
          : 'customer_report.xlsx'
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDownload(false)
    }
  }

  const reportReturnUrl = useMemo(() => {
    const queryString = searchParams.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }, [pathname, searchParams])

  const columns: ColumnsData<CustomersResponseProps>[] = [
    {
      name: 'کد مشتری',
      uid: 'code',
      render: (customer) => <span>{customer.id}</span>,
    },
    {
      name: 'نام مشتری',
      uid: 'name',
      render: (customer) => (
        <span className="whitespace-nowrap text-amber-600">
          {customer.name ?? '-------'}
        </span>
      ),
    },
    {
      name: 'شماره موبایل',
      uid: 'phone',
      render: (customer) => <span>{customer.phone ?? '-------'}</span>,
    },
    {
      name: 'سفارش‌های در انتظار',
      uid: 'pendingOrderCount',
      render: (customer) => (
        <span>
          {Number(customer.pending_order_count ?? 0).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'مجموع مبلغ سفارش‌های در انتظار',
      uid: 'pendingOrderTotal',
      render: (customer) => (
        <span>
          {Number(customer.pending_order_total ?? 0).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'تعداد سفارش‌های تکمیل‌شده',
      uid: 'completeOrderCount',
      render: (customer) => (
        <span>
          {Number(customer.complete_order_count ?? 0).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'مجموع مبلغ سفارش‌های تکمیل‌شده',
      uid: 'completeOrderTotal',
      render: (customer) => (
        <span>
          {Number(customer.complete_order_total ?? 0).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'امتیاز',
      uid: 'points',
      render: (customer) => (
        <span>
          {Number(customer.total_points ?? 0).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'تاریخ آخرین سفارش',
      uid: 'lastOrderDate',
      render: (customer) => (
        <span dir="ltr">{customer.last_order_date ?? '-------'}</span>
      ),
    },
    {
      name: 'عملیات',
      uid: 'action',
      render: (customer) => (
        <Tooltip content="جزئیات مشتری" closeDelay={0} delay={0}>
          <Button
            isIconOnly
            variant="light"
            as={Link}
            href={`${DASHBOARD_PATH.CUSTOMER_REPORT_DETAIL}?customer_id=${
              customer.id
            }&return_to=${encodeURIComponent(reportReturnUrl)}`}
            size="sm"
            className="text-lg text-default-400 active:opacity-50"
          >
            <TbEye />
          </Button>
        </Tooltip>
      ),
    },
  ]

  const labelsMap = {
    pdf: 'دانلود PDF',
    excel: 'دانلود Excel',
  }

  const selectedOptionValue = Array.from(
    selectedOption
  )[0] as keyof typeof labelsMap

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            {REPORTING_TEXT} :
          </h1>
          <FormLayout
            onSubmit={handleFormSubmit}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            methods={methods}
          >
            <FormInput name="name" label={CUSTOMER_NAME_LABEL} />
            <FormInput name="phone" label={PHONE_LABEL} />
            <FormNumberInput
              name="month_since_last_purchase"
              label="مدت زمان از آخرین خرید (بر حسب ماه)"
            />
            <FormNumberInput name="min_points" label="حداقل امتیاز" />
            <FormNumberInput name="max_points" label="حداکثر امتیاز" />
            <FormSelect
              name="food_id"
              apiMethods={FOOD_API}
              label={FOOD_LABEL}
              onSelectedItemChange={(item) =>
                setSelectedFoodLabel(item?.name ? String(item.name) : '')
              }
            />
            <FormDatePicker name="order_from" label={FROM_DATE_LABEL} />
            <FormDatePicker name="order_to" label={TO_DATE_LABEL} />

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
      </div>

      <ButtonGroup variant="flat" className="mr-auto w-fit text-white">
        <Button color="success" onPress={handleDownload} isLoading={isDownload}>
          {labelsMap[selectedOptionValue]}
        </Button>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly color="success">
              <IoChevronDownCircleOutline />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Merge options"
            className="max-w-[300px]"
            selectedKeys={selectedOption}
            selectionMode="single"
            onSelectionChange={(keys) => {
              if (keys === 'all') return
              setSelectedOption(new Set(keys as Set<string>))
            }}
          >
            <DropdownItem key="pdf">{labelsMap.pdf}</DropdownItem>
            <DropdownItem key="excel">{labelsMap.excel}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>

      <h2 className="text-xl font-bold text-default-700">
        {CUSTOMER_LIST_LABEL}
      </h2>

      {filtersRestored && (
        <DataTable
          columns={columns}
          apiMethods={CUSTOMER_REPORT_API}
          key={currentKey}
          dataTableId="customer_report_table"
          extraFilterParameters={filters}
        />
      )}
    </div>
  )
}

export default CustomerReportTable
