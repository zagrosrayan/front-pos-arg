import { ORDER_API } from '@/routes/api/order'
import { DASHBOARD_PATH } from '@/routes/path'
import { OrderResponseProps } from '@/types/orderType'
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import Link from 'next/link'
import { TbEdit, TbEye, TbTrash } from 'react-icons/tb'
import DataTable, { ColumnsData } from '../DataTable'
import { useMemo, useState } from 'react'
import {
  CANCEL_LABEL,
  DELETE_LABEL,
  DELETE_ORDER_LABEL,
  DESC_NUMBER_LABEL,
} from '@/app/constant/label'
import { DELETE_ORDER_TEXT } from '@/app/constant/text'
import { apiRequest } from '@/lib/axios'
import FormInput from '@/app/components/ui/FormInput'
import FormLayout from '@/app/layout/FormLayout'
import { useForm } from 'react-hook-form'

const completeOrderSlug = 'order-status-complete'

type SearchFormValues = {
  invoice_number: string
}

const OrderTable = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseProps | null>(
    null
  )
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [tableKey, setTableKey] = useState(0)
  const [invoiceSearch, setInvoiceSearch] = useState('')

  const searchMethods = useForm<SearchFormValues>({
    mode: 'onChange',
    defaultValues: {
      invoice_number: '',
    },
  })

  const handleDeleteModalOpen = (order: OrderResponseProps) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleDeleteOrder = async () => {
    try {
      setIsDeleteLoading(true)
      await apiRequest(ORDER_API.deleteById(), { order: selectedOrder?.id })
      setTableKey((prev) => prev + 1)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const handleSearchSubmit = (data: SearchFormValues) => {
    setInvoiceSearch(data.invoice_number || '')
    setTableKey((prev) => prev + 1)
  }

  // ارسال شماره فاکتور به بک‌اند (exact match)
  const extraFilterParameters = useMemo(() => {
    const params: Record<string, string | number> = {
      today: 1,
    }

    if (invoiceSearch.trim()) {
      params.invoice_number = String(invoiceSearch.trim())
    }

    return params
  }, [invoiceSearch])

  const columns: ColumnsData<OrderResponseProps>[] = [
    {
      name: 'کد سفارش',
      uid: 'code',
      render: (order: OrderResponseProps) => <span>{order.id}</span>,
    },
    {
      name: 'شماره فاکتور',
      uid: 'invoice_number',
      render: (order: OrderResponseProps) => (
        <span>{order.invoice_number ?? '-------'}</span>
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
            : (order.reserve?.GuestName ?? '---------')}
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
      name: DESC_NUMBER_LABEL,
      uid: 'desc_number',
      render: (order: OrderResponseProps) => {
        let deskNumber = order.desc_number ?? '-------'

        switch (deskNumber) {
          case 'takeaway':
            deskNumber = 'بیرون بر'
            break
          case 'room_service':
            deskNumber = 'داخل اتاق'
            break
        }
        return <span>{deskNumber}</span>
      },
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
        <div className="relative flex items-center justify-start gap-2">
          <Tooltip content="جزئیات سفارش" closeDelay={0} delay={0}>
            <Button
              isIconOnly
              variant="light"
              as={Link}
              href={DASHBOARD_PATH.ORDERS_DETAIL + `?order_id=${order.id}`}
              size="sm"
              className="text-lg text-default-400 active:opacity-50"
            >
              <TbEye />
            </Button>
          </Tooltip>
          {order.status.slug != completeOrderSlug && (
            <Tooltip content="ویرایش سفارش" closeDelay={0} delay={0}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                as={Link}
                href={DASHBOARD_PATH.MAIN + `?order_id=${order.id}`}
                className="text-lg text-default-400 active:opacity-50"
              >
                <TbEdit />
              </Button>
            </Tooltip>
          )}
          {order.status.slug != completeOrderSlug && (
            <Tooltip
              color="danger"
              content="حذف سفارش"
              closeDelay={0}
              delay={0}
            >
              <Button
                isIconOnly
                variant="light"
                color="danger"
                size="sm"
                onPress={() => handleDeleteModalOpen(order)}
                className="text-lg active:opacity-50"
              >
                <TbTrash />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
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

      <DataTable
        columns={columns}
        apiMethods={ORDER_API}
        key={tableKey}
        dataTableId="orders_table"
        extraFilterParameters={extraFilterParameters}
      />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {DELETE_ORDER_LABEL}
              </ModalHeader>
              <ModalBody>
                <p>{DELETE_ORDER_TEXT}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {CANCEL_LABEL}
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteOrder}
                  isLoading={isDeleteLoading}
                >
                  {DELETE_LABEL}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default OrderTable
