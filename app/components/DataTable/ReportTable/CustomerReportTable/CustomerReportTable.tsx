'use client'
import {
  CUSTOMER_LIST_LABEL,
  CUSTOMER_NAME_LABEL,
  FOOD_LABEL,
  FROM_DATE_LABEL,
  PHONE_LABEL,
  REPORT_LABEL,
  // ROOM_LABEL,
  TO_DATE_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { CUSTOMER_REPORT_API } from '@/routes/api/customer'
// import { DASHBOARD_PATH } from '@/routes/path'
import { CustomersResponseProps } from '@/types/customerType'
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
// import Link from 'next/link'
import { useState } from 'react'
// import { TbEye } from 'react-icons/tb'
import FormDatePicker from '@/app/components/ui/FormDatePicker'
import FormInput from '@/app/components/ui/FormInput'
import FormSelect from '@/app/components/ui/FormSelect'
import { apiRequest, downloadFile } from '@/lib/axios'
import { FOOD_API } from '@/routes/api/food'
import { useForm } from 'react-hook-form'
import { IoChevronDownCircleOutline } from 'react-icons/io5'
import DataTable, { ColumnsData } from '../../DataTable'

import FormNumberInput from '@/app/components/ui/FormNumberInput'
import FormTextArea from '@/app/components/ui/FormTextArea'
import { SMS_API } from '@/routes/api/sms'
import { toast } from 'react-toastify'

const CustomerReportTable = () => {
  const [filters, setFilters] = useState({}) // Initial filters
  const [currentKey, setCurrentKey] = useState(0) // Initial filters
  const methods = useForm()
  const smsMethods = useForm()
  const bulkSmsMethods = useForm()
  const [isDownload, setIsDownload] = useState(false) // Initial filters
  const [isLoading, setIsLoading] = useState(false) // Initial filters
  const [selectedOption, setSelectedOption] = useState(new Set(['pdf']))
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomersResponseProps | null>(null)
  const [selectedItems, setSelectedItems] = useState<
    CustomersResponseProps[] | []
  >([])
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const {
    isOpen: isBulkSmsOpen,
    onOpen: openBulkSms,
    onOpenChange: bulkSmsOpenChange,
    onClose: closeBulkSms,
  } = useDisclosure()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    const updatedFilters = { ...filters, ...data }
    setFilters(updatedFilters)
    setSelectedItems([])
    setCurrentKey((prev) => prev + 1)
  }

  const handleOpenSmsDialog = (customer: CustomersResponseProps) => {
    setSelectedCustomer(customer)
    onOpen()
  }

  const handleDownload = async () => {
    try {
      setIsDownload(true)

      const request = CUSTOMER_REPORT_API.getAll()

      // Build dynamic params
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

  const handleSendSms = async (data: any) => {
    try {
      setIsLoading(true)
      if (selectedCustomer?.phone) {
        data.phone = selectedCustomer?.phone
      } else {
        toast.error('برای این کاربر شماره موبایلی ثبت نشده است')
        onClose()
        smsMethods.reset()
        return
      }
      await apiRequest(SMS_API.sendSingle(data))
      onClose()
      smsMethods.reset()
      toast.success('پیامک با موفقیت ارسال شد')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendBulkSms = async (data: any) => {
    try {
      setIsLoading(true)

      const phoneNumbers = selectedItems
        .map((item) => item.phone)
        .filter(Boolean)
      data.phones = phoneNumbers
      await apiRequest(SMS_API.sendBulk(data))
      closeBulkSms()
      bulkSmsMethods.reset()
      setSelectedItems([])
      toast.success('پیامک با موفقیت ارسال شد')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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
        <span>
          {customer.pending_order_count.toLocaleString('fa-IR') ?? '-------'}
        </span>
      ),
    },
    {
      name: 'مجموع مبلغ سفارش‌های در انتظار',
      uid: 'pendingOrderTotal"',
      render: (customer: CustomersResponseProps) => (
        <span>
          {customer.pending_order_total.toLocaleString('fa-IR') ?? '-------'}
        </span>
      ),
    },
    {
      name: 'تعداد سفارش‌های تکمیل‌شده',
      uid: 'completeOrderCount"',
      render: (customer: CustomersResponseProps) => (
        <span>
          {customer.complete_order_count.toLocaleString('fa-IR') ?? '-------'}
        </span>
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
        <span>
          {customer.total_points.toLocaleString('fa-IR') ?? '-------'}
        </span>
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
    {
      name: 'عملیات ',
      uid: 'action',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (customer: CustomersResponseProps) => (
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
            />
            <FormDatePicker name="no_order_from" label={FROM_DATE_LABEL} />
            <FormDatePicker name="no_order_to" label={TO_DATE_LABEL} />

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
        {CUSTOMER_LIST_LABEL}
      </h2>
      <Button
        color="primary"
        onPress={openBulkSms}
        className="mr-auto w-fit text-white"
      >
        ارسال پیامک گروهی
      </Button>
      <DataTable
        columns={columns}
        apiMethods={CUSTOMER_REPORT_API}
        key={currentKey}
        selectionMode="multiple"
        dataTableId="cusromer_table"
        extraFilterParameters={filters}
        onSelectItems={(items) => {
          setSelectedItems(items)
        }}
        selectedItems={selectedItems}
      />
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
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
                    <p className="text-lg font-semibold">اطلاعات مشتری : </p>
                    <div className="flex flex-col gap-2">
                      <span>نام : {selectedCustomer?.name}</span>
                      <span>شماره موبایل : {selectedCustomer?.phone}</span>
                    </div>
                  </div>
                  <FormTextArea name="text" label="متن پیامک" />
                  <div className="flex flex-row-reverse justify-start gap-5">
                    <Button
                      type="submit"
                      color="success"
                      variant="flat"
                      isLoading={isLoading}
                    >
                      ارسال
                    </Button>
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        onClose()
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
          {(onClose) => (
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
                  <FormTextArea name="text" label="متن پیامک" />
                  <div className="flex flex-row-reverse justify-start gap-5">
                    <Button
                      type="submit"
                      color="success"
                      variant="flat"
                      isLoading={isLoading}
                    >
                      ارسال
                    </Button>
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        onClose()
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

export default CustomerReportTable
