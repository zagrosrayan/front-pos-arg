/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {
  CATEGORY_FOOD_LABEL,
  FOOD_LABEL,
  FROM_DATE_LABEL,
  ORDERS_LIST_LABEL,
  PROFIT_MANAGER_LABEL,
  REPORT_LABEL,
  TO_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { downloadFile } from '@/lib/axios'
import { ARTICLE_API } from '@/routes/api/article'
import { FOOD_API, FOOD_REPORTING_API } from '@/routes/api/food'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import { FoodReportResponseProps } from '@/types/foodTypes'
import {
  Button,
  DropdownTrigger,
  Dropdown,
  ButtonGroup,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import FormDatePicker from '../../ui/FormDatePicker'
import FormSelect from '../../ui/FormSelect'
import FormInput from '../../ui/FormInput'
import DataTable, { ColumnsData } from '../DataTable'
import { IoChevronDownCircleOutline } from 'react-icons/io5'

type SearchFormValues = {
  invoice_number: string
}

const FoodReportTable = () => {
  const [filters, setFilters] = useState({})
  const [currentKey, setCurrentKey] = useState(0)
  const [isDownload, setIsDownload] = useState(false)
  const [selectedOption, setSelectedOption] = useState(new Set(['pdf']))
  const [invoiceSearch, setInvoiceSearch] = useState('')

  const methods = useForm()
  const searchMethods = useForm<SearchFormValues>({
    mode: 'onChange',
    defaultValues: {
      invoice_number: '',
    },
  })

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

  const handleDownload = async () => {
    try {
      setIsDownload(true)

      const request = FOOD_REPORTING_API.getAll()

      request.params = {
        ...extraFilterParameters,
        pdf: selectedOption.has('pdf') ? 1 : undefined,
        excel: selectedOption.has('excel') ? 1 : undefined,
      }

      await downloadFile(
        request,
        selectedOption.has('pdf') ? 'food_report.pdf' : 'food_report.xlsx'
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDownload(false)
    }
  }

  const columns: ColumnsData<FoodReportResponseProps>[] = [
    {
      name: 'کد کالا',
      uid: 'id',
      render: (order: FoodReportResponseProps) => <span>{order.id}</span>,
    },
    {
      name: 'نام کالا',
      uid: 'food_name',
      render: (order: FoodReportResponseProps) => (
        <span className="whitespace-nowrap">{order.food_name}</span>
      ),
    },
    {
      name: 'دسته بندی غذا',
      uid: 'article',
      render: (order: FoodReportResponseProps) => <span>{order.article}</span>,
    },
    {
      name: 'مرکز درآمد',
      uid: 'profit_manager',
      render: (order: FoodReportResponseProps) => (
        <span>{order.profit_manager}</span>
      ),
    },
    {
      name: 'شماره فاکتور',
      uid: 'invoice_number',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {item.invoice_number ?? '-------'}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'قیمت پایه(ریال)',
      uid: 'price',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.price).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'تعداد',
      uid: 'count',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.quantity).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'تخفیف',
      uid: 'discount',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.discounted_price).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'قیمت خالص (ریال)',
      uid: 'total_price',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.total_price).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'سرویس (ریال)',
      uid: 'rate_service',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.rate_service).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'عوارض و مالیات (ریال)',
      uid: 'tax',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.tax).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'جمع کل (ریال)',
      uid: 'total',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.orders.map((item, index) => {
            return (
              <span key={`${item}.${index}`}>
                {Number(item.total).toLocaleString('fa-IR')}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      name: 'تعداد کل سفارشات',
      uid: 'order_count',
      render: (order: FoodReportResponseProps) => (
        <span>{order.summary.order_count.toLocaleString('fa-IR')}</span>
      ),
    },
    {
      name: 'تعداد کل غذا',
      uid: 'total_quantity',
      render: (order: FoodReportResponseProps) => (
        <span>{order.summary.total_quantity.toLocaleString('fa-IR')}</span>
      ),
    },
    {
      name: 'مبلغ میانگین(ریال)',
      uid: 'average_price',
      render: (order: FoodReportResponseProps) => (
        <span>
          {Number(order.summary.average_price).toLocaleString('fa-IR')}
        </span>
      ),
    },
  ]

  const totalColumns: ColumnsData<FoodReportResponseProps>[] = [
    {
      name: 'کد کالا',
      uid: 'id',
      render: (order: FoodReportResponseProps) => <span>{order.id}</span>,
    },
    {
      name: 'نام کالا',
      uid: 'food_name',
      render: (order: FoodReportResponseProps) => (
        <span>جمع کل {order.food_name}</span>
      ),
    },
    {
      name: 'دسته بندی غذا',
      uid: 'article',
      render: (order: FoodReportResponseProps) => <span>{order.article}</span>,
    },
    {
      name: 'مرکز درآمد',
      uid: 'profit_manager',
      render: (order: FoodReportResponseProps) => (
        <span>{order.profit_manager}</span>
      ),
    },
    {
      name: 'شماره فاکتور',
      uid: 'invoice_number',
      render: (_: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">----</div>
      ),
    },
    {
      name: 'قیمت پایه(ریال)',
      uid: 'price',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">-----</div>
      ),
    },
    {
      name: 'تعداد',
      uid: 'count',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.total_summary.total_quantity.toLocaleString('fa-IR')}
        </div>
      ),
    },
    {
      name: 'تخفیف',
      uid: 'discount',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.total_summary.total_discount.toLocaleString('fa-IR')}
        </div>
      ),
    },
    {
      name: 'قیمت خالص (ریال)',
      uid: 'total_price',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.total_summary.total_order_price.toLocaleString('fa-IR')}
        </div>
      ),
    },
    {
      name: 'سرویس (ریال)',
      uid: 'rate_service',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.total_summary.total_service.toLocaleString('fa-IR')}
        </div>
      ),
    },
    {
      name: 'عوارض و مالیات (ریال)',
      uid: 'tax',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.total_summary.total_tax.toLocaleString('fa-IR')}
        </div>
      ),
    },
    {
      name: 'جمع کل (ریال)',
      uid: 'total',
      render: (order: FoodReportResponseProps) => (
        <div className="flex flex-col gap-2">
          {order.total_summary.total_final.toLocaleString('fa-IR')}
        </div>
      ),
    },
    {
      name: 'تعداد کل سفارشات',
      uid: 'order_count',
      render: (order: FoodReportResponseProps) => (
        <span>{order.summary.order_count.toLocaleString('fa-IR')}</span>
      ),
    },
    {
      name: 'تعداد کل غذا',
      uid: 'total_quantity',
      render: (order: FoodReportResponseProps) => (
        <span>{order.summary.total_quantity.toLocaleString('fa-IR')}</span>
      ),
    },
    {
      name: 'مبلغ میانگین(ریال)',
      uid: 'average_price',
      render: (order: FoodReportResponseProps) => (
        <span>
          {Number(order.summary.average_price).toLocaleString('fa-IR')}
        </span>
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
    <div className="flex flex-col gap-5 pb-3">
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
            <FormSelect
              name="profit_manager_id"
              apiMethods={PROFIT_MANAGER_API}
              label={PROFIT_MANAGER_LABEL}
            />
            <FormSelect
              name="article_id"
              apiMethods={ARTICLE_API}
              label={CATEGORY_FOOD_LABEL}
            />
            <FormSelect
              name="food_id"
              apiMethods={FOOD_API}
              label={FOOD_LABEL}
            />
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

      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <h2 className="text-xl font-bold text-default-700">
          {ORDERS_LIST_LABEL}
        </h2>
        <ButtonGroup variant="flat" className="mr-auto w-fit text-white">
          <Button
            color="success"
            onPress={handleDownload}
            isLoading={isDownload}
          >
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
              <DropdownItem key="pdf">{labelsMap['pdf']}</DropdownItem>
              <DropdownItem key="excel">{labelsMap['excel']}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </ButtonGroup>
      </div>

      <DataTable
        columns={columns}
        totalColumns={totalColumns}
        apiMethods={FOOD_REPORTING_API}
        key={currentKey}
        dataTableId="report_table"
        extraFilterParameters={extraFilterParameters}
        isStriped
      />
    </div>
  )
}

export default FoodReportTable
