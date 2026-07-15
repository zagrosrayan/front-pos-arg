'use client'
import {
  CUSTOMER_LIST_LABEL,
  CUSTOMER_NAME_LABEL,
  FROM_DATE_LABEL,
  PHONE_LABEL,
  REPORT_LABEL,
  // ROOM_LABEL,
  TO_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { CUSTOMER_API } from '@/routes/api/customer'
// import { DASHBOARD_PATH } from '@/routes/path'
import { CustomersResponseProps } from '@/types/customerType'
import { Button } from '@heroui/react'
// import Link from 'next/link'
import { useState } from 'react'
// import { TbEye } from 'react-icons/tb'
import { useForm } from 'react-hook-form'
import FormDatePicker from '../../ui/FormDatePicker'
import FormInput from '../../ui/FormInput'
import DataTable, { ColumnsData } from '../DataTable'

const ReportTable = () => {
  const [filters, setFilters] = useState({}) // Initial filters
  const [currentKey, setCurrentKey] = useState(0) // Initial filters
  const methods = useForm()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    const updatedFilters = { ...filters, ...data }
    setFilters(updatedFilters)
    setCurrentKey((prev) => prev + 1)
  }

  const columns: ColumnsData<CustomersResponseProps>[] = [
    {
      name: 'کد مشتری',
      uid: 'code',
      render: (customer: CustomersResponseProps) => <span>{customer.id}</span>,
    },

    {
      name: 'نام مشتری',
      uid: 'name',
      render: (customer: CustomersResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {customer.name ?? '-------'}
        </span>
      ),
    },

    {
      name: 'شماره موبایل',
      uid: 'phone',
      render: (customer: CustomersResponseProps) => (
        <span>{customer.phone ?? '-------'}</span>
      ),
    },

    {
      name: 'سفارش‌های در انتظار',
      uid: 'pendingOrderCount',
      render: (customer: CustomersResponseProps) => (
        <span>{customer.pending_order_count ?? '-------'}</span>
      ),
    },
    {
      name: 'مجموع مبلغ سفارش‌های در انتظار',
      uid: 'pendingOrderTotal"',
      render: (customer: CustomersResponseProps) => (
        <span>{customer.pending_order_total ?? '-------'}</span>
      ),
    },
    {
      name: 'تعداد سفارش‌های تکمیل‌شده',
      uid: 'completeOrderCount"',
      render: (customer: CustomersResponseProps) => (
        <span>{customer.complete_order_count ?? '-------'}</span>
      ),
    },

    {
      name: 'مجموع مبلغ سفارش‌های تکمیل‌شده',
      uid: 'completeOrderTotal"',
      render: (customer: CustomersResponseProps) => (
        <span>
          {Number(customer.complete_order_total).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: 'امتیاز',
      uid: 'points"',
      render: (customer: CustomersResponseProps) => (
        <span>{customer.total_points.toLocaleString('fa-IR') ?? '----'}</span>
      ),
    },

    {
      name: 'تاریخ آخرین سفارش ',
      uid: 'lastOrderDate',
      render: (customer: CustomersResponseProps) => (
        <span dir="ltr">
          {new Date(customer.created_at as string).toLocaleString('fa-IR')}
        </span>
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
            <FormInput name="name" label={CUSTOMER_NAME_LABEL} />
            <FormInput name="phone" label={PHONE_LABEL} />

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
      <h2 className="text-xl font-bold text-default-700">
        {CUSTOMER_LIST_LABEL}
      </h2>
      <DataTable
        columns={columns}
        apiMethods={CUSTOMER_API}
        key={currentKey}
        dataTableId="cusromer_table"
        extraFilterParameters={filters}
      />
    </div>
  )
}

export default ReportTable
