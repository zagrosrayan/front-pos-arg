'use client'
import FormDatePicker from '@/app/components/ui/FormDatePicker'
import FormInput from '@/app/components/ui/FormInput'
import TextInputWithDelay from '@/app/components/ui/SearchInputWithDelay/SearchInputWithDelay'
import {
  CODE_LABEL,
  EXPIRED_DATE_LABEL,
  NAME_LABEL,
  REPORT_LABEL,
  START_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { downloadFile } from '@/lib/axios'
import { DISCOUNT_REPORT_API } from '@/routes/api/discount'
import { DiscountResponseProps } from '@/types/discountTypes'
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Snippet,
} from '@heroui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoChevronDownCircleOutline } from 'react-icons/io5'
import DataTable, { ColumnsData } from '../../DataTable'
import { copyToClipboard } from '@/utils'

const DiscountReportTable = () => {
  const [filters, setFilters] = useState({}) // Initial filters
  const [currentKey, setCurrentKey] = useState(0) // Initial filters
  const methods = useForm()
  const [isDownload, setIsDownload] = useState(false) // Initial filters
  const [selectedOption, setSelectedOption] = useState(new Set(['pdf']))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    const updatedFilters = { ...filters, ...data }
    setFilters(updatedFilters)
    setCurrentKey((prev) => prev + 1)
  }

  const handleDownload = async () => {
    try {
      setIsDownload(true)

      const request = DISCOUNT_REPORT_API.getAll()

      // Build dynamic params
      request.params = {
        ...filters,
        pdf: selectedOption.has('pdf') ? 1 : undefined,
        excel: selectedOption.has('excel') ? 1 : undefined,
      }

      await downloadFile(
        request,
        selectedOption.has('pdf')
          ? 'discount_report.pdf'
          : 'discount_report.xlsx'
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDownload(false)
    }
  }

  const columns: ColumnsData<DiscountResponseProps>[] = [
    {
      name: 'شناسه',
      uid: 'id',
      render: (discount: DiscountResponseProps) => <span>{discount.id}</span>,
    },
    {
      name: 'نوع تخفیف',
      uid: 'type',
      render: (discount: DiscountResponseProps) => (
        <span>{discount.discount_type == 'percentage' ? 'درصدی' : 'عددی'}</span>
      ),
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (discount: DiscountResponseProps) => <span>{discount.name}</span>,
    },
    {
      name: 'نام مشتری',
      uid: 'customer_name',
      render: (discount: DiscountResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {discount.customer?.name
            ? discount.customer?.name
            : (discount.reserve?.GuestName ?? '-------')}
        </span>
      ),
    },
    {
      name: 'شماره اتاق مشتری',
      uid: 'room',
      render: (discount: DiscountResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {discount.reserve?.Room ?? '-------'}
        </span>
      ),
    },
    {
      name: 'مرکز درآمد',
      uid: 'profit',
      render: (discount: DiscountResponseProps) => (
        <span>{discount.profit_manager?.name ?? '----'}</span>
      ),
    },
    {
      name: CODE_LABEL,
      uid: 'code',
      render: (discount: DiscountResponseProps) => (
        <Snippet symbol={false} onCopy={() => copyToClipboard(discount.code)}>
          {discount.code ?? '-------'}
        </Snippet>
      ),
    },
    {
      name: 'میزان تخفیف',
      uid: 'discount_value',
      render: (discount: DiscountResponseProps) => (
        <span>
          {Number(discount.discount_value).toLocaleString('fa-IR') ?? '-------'}{' '}
          {discount.discount_type == 'fixed' ? 'ریال' : '%'}
        </span>
      ),
    },
    {
      name: 'حداقل خرید (ریال)',
      uid: 'minimum_price',
      render: (discount: DiscountResponseProps) => (
        <span>
          {Number(discount.minimum_price).toLocaleString('fa-IR') ?? '------'}
        </span>
      ),
    },
    {
      name: START_DATE_LABEL,
      uid: 'starts_at',
      render: (discount: DiscountResponseProps) => (
        <span dir="ltr">
          {discount.starts_at
            ? new Date(discount.starts_at).toLocaleDateString('fa-IR')
            : '------'}
        </span>
      ),
    },
    {
      name: EXPIRED_DATE_LABEL,
      uid: 'expires_at',
      render: (discount: DiscountResponseProps) => (
        <span>
          {' '}
          {discount.expires_at
            ? new Date(discount.expires_at).toLocaleDateString('fa-IR')
            : '------'}
        </span>
      ),
    },
    {
      name: 'تعداد استفاده شده',
      uid: 'count',
      render: (discount: DiscountResponseProps) => (
        <span>
          {Number(discount.usage_count).toLocaleString('fa-IR') ?? '0'}
        </span>
      ),
    },
    {
      name: 'تعداد قابل استفاده',
      uid: 'limit',
      render: (discount: DiscountResponseProps) => (
        <span>{discount.usage_limit ?? 'نامحدود'}</span>
      ),
    },
    {
      name: 'وضعیت',
      uid: 'isActive',
      render: (discount: DiscountResponseProps) => (
        <div
          className={`${discount.is_active ? 'bg-success-500' : 'bg-danger-500'} whitespace-nowrap rounded-full p-2 text-center`}
        >
          {discount.is_active ? 'فعال' : 'غیر فعال'}
        </div>
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
            {REPORTING_TEXT} :{' '}
          </h1>
          <FormLayout
            onSubmit={handleFormSubmit}
            methods={methods}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          >
            <FormInput name="name" type="text" label="اسم تخفیف" />

            <FormDatePicker
              name="created_at_from"
              label="شروع بازهٔ تاریخ ایجاد"
            />
            <FormDatePicker
              name="created_at_to"
              label="پایان بازهٔ تاریخ ایجاد"
            />

            <Button
              color="success"
              className="text-white"
              fullWidth
              type="submit"
              size="lg"
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
              // keys may be "all" or a Selection object, so convert safely
              if (keys === 'all') return // you don't want "all" in single selection

              // NextUI gives Selection => convert to Set<string>
              setSelectedOption(new Set(keys as Set<string>))
            }}
          >
            <DropdownItem key="pdf">{labelsMap['pdf']}</DropdownItem>
            <DropdownItem key="excel">{labelsMap['excel']}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
      <h2 className="text-xl font-bold text-default-700">
        لیست کدهای تخفیف استفاده شده ساده
      </h2>
      <div className="sticky top-0 z-20 h-fit w-full bg-white pb-2 md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
        <TextInputWithDelay
          setValue={(value) => {
            setFilters({ name: value })
          }}
        />
      </div>

      <DataTable
        columns={columns}
        apiMethods={DISCOUNT_REPORT_API}
        key={currentKey}
        dataTableId="discount_report_table"
        extraFilterParameters={filters}
      />
    </div>
  )
}

export default DiscountReportTable
