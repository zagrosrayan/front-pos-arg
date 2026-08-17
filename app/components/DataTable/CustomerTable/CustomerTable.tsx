'use client'

import {
  CUSTOMER_LIST_LABEL,
  CUSTOMER_NAME_LABEL,
  FROM_DATE_LABEL,
  PHONE_LABEL,
  REPORT_LABEL,
  TO_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { CUSTOMER_API } from '@/routes/api/customer'
import { SMS_API } from '@/routes/api/sms'
import { CustomersResponseProps } from '@/types/customerType'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormDatePicker from '../../ui/FormDatePicker'
import FormInput from '../../ui/FormInput'
import FormTextArea from '../../ui/FormTextArea'
import DataTable, { ColumnsData } from '../DataTable'

const CustomerTable = () => {
  const [filters, setFilters] = useState({})
  const [currentKey, setCurrentKey] = useState(0)
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomersResponseProps | null>(null)
  const [selectedItems, setSelectedItems] = useState<CustomersResponseProps[]>(
    []
  )
  const [isSmsLoading, setIsSmsLoading] = useState(false)

  const methods = useForm()
  const smsMethods = useForm()
  const bulkSmsMethods = useForm()

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const {
    isOpen: isBulkSmsOpen,
    onOpen: openBulkSms,
    onOpenChange: bulkSmsOpenChange,
    onClose: closeBulkSms,
  } = useDisclosure()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    setFilters({ ...data })
    setSelectedItems([])
    setCurrentKey((prev) => prev + 1)
  }

  const handleOpenSmsDialog = (customer: CustomersResponseProps) => {
    setSelectedCustomer(customer)
    onOpen()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSendSms = async (data: any) => {
    try {
      setIsSmsLoading(true)

      if (!selectedCustomer?.phone) {
        toast.error('برای این کاربر شماره موبایلی ثبت نشده است')
        return
      }

      await apiRequest(
        SMS_API.sendSingle({
          ...data,
          phone: selectedCustomer.phone,
        })
      )

      onClose()
      smsMethods.reset()
      toast.success('پیامک با موفقیت ارسال شد')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSmsLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSendBulkSms = async (data: any) => {
    try {
      const phoneNumbers = Array.from(
        new Set(selectedItems.map((item) => item.phone).filter(Boolean))
      )

      if (!phoneNumbers.length) {
        toast.error('حداقل یک مشتری دارای شماره موبایل را انتخاب کنید')
        return
      }

      setIsSmsLoading(true)

      await apiRequest(
        SMS_API.sendBulk({
          ...data,
          phones: phoneNumbers,
        })
      )

      closeBulkSms()
      bulkSmsMethods.reset()
      setSelectedItems([])
      toast.success('پیامک با موفقیت ارسال شد')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSmsLoading(false)
    }
  }

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
        <span>{customer.pending_order_count ?? '-------'}</span>
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
        <span>{customer.complete_order_count ?? '-------'}</span>
      ),
    },
    {
      name: 'مجموع مبلغ سفارش‌های تکمیل‌شده',
      uid: 'completeOrderTotal',
      render: (customer) => (
        <span>
          {Number(customer.complete_order_total).toLocaleString('fa-IR')}
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
        <Button
          color="success"
          className="text-white"
          onPress={() => handleOpenSmsDialog(customer)}
        >
          ارسال پیامک
        </Button>
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-default-700">
          {CUSTOMER_LIST_LABEL}
        </h2>
        <Button
          color="primary"
          onPress={openBulkSms}
          className="mr-auto w-fit text-white"
          isDisabled={!selectedItems.length}
        >
          ارسال پیامک گروهی
        </Button>
      </div>

      <DataTable
        columns={columns}
        apiMethods={CUSTOMER_API}
        key={currentKey}
        selectionMode="multiple"
        dataTableId="customer_table"
        extraFilterParameters={filters}
        selectedItems={selectedItems}
        onSelectItems={setSelectedItems}
      />

      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(modalOnClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ارسال پیامک
              </ModalHeader>
              <ModalBody>
                <FormLayout
                  methods={smsMethods}
                  onSubmit={handleSendSms}
                  className="space-y-5"
                >
                  <div className="mb-3 flex flex-col gap-5">
                    <p className="text-lg font-semibold">اطلاعات مشتری :</p>
                    <div className="flex flex-col gap-2">
                      <span>نام : {selectedCustomer?.name ?? '---'}</span>
                      <span>
                        شماره موبایل : {selectedCustomer?.phone ?? '---'}
                      </span>
                    </div>
                  </div>

                  <FormTextArea name="text" label="متن پیامک" />

                  <div className="flex flex-row-reverse justify-start gap-5">
                    <Button
                      type="submit"
                      color="success"
                      variant="flat"
                      isLoading={isSmsLoading}
                    >
                      ارسال
                    </Button>
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        modalOnClose()
                        smsMethods.reset()
                      }}
                    >
                      بستن
                    </Button>
                  </div>
                </FormLayout>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isBulkSmsOpen}
        placement="top-center"
        onOpenChange={bulkSmsOpenChange}
      >
        <ModalContent>
          {(modalOnClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ارسال پیامک گروهی
              </ModalHeader>
              <ModalBody>
                <FormLayout
                  methods={bulkSmsMethods}
                  onSubmit={handleSendBulkSms}
                  className="space-y-5"
                >
                  <p className="text-sm text-default-500">
                    {selectedItems.length.toLocaleString('fa-IR')} مشتری انتخاب
                    شده است.
                  </p>
                  <FormTextArea name="text" label="متن پیامک" />
                  <div className="flex flex-row-reverse justify-start gap-5">
                    <Button
                      type="submit"
                      color="success"
                      variant="flat"
                      isLoading={isSmsLoading}
                    >
                      ارسال
                    </Button>
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        modalOnClose()
                        bulkSmsMethods.reset()
                      }}
                    >
                      بستن
                    </Button>
                  </div>
                </FormLayout>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default CustomerTable
