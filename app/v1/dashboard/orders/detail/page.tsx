/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client'

import { EMPTY_CONTENT_ERROR } from '@/app/constant/error'
import { ORDERS_DETAIL_TEXT, LOADING_CONTENT_TEXT } from '@/app/constant/text'
import { apiRequest } from '@/lib/axios'
import { ORDER_API } from '@/routes/api/order'
import { PRINTER_API } from '@/routes/api/printer'
import { TYPE_API } from '@/routes/api/type'
import { DASHBOARD_PATH } from '@/routes/path'
import { PaginationResponseProps } from '@/types/apiTypes'
import {
  DiscountType,
  OrderRequestProps,
  OrderResponseProps,
} from '@/types/orderType'
import { TypeResponseProps } from '@/types/typeTypes'
import { useDisclosure } from '@heroui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { handleApiErrors } from '@/utils/handleApiError'
import { ValidationErrorResponseType } from '@/types/errorTypes'
import Swal from 'sweetalert2'
import OrderInfoDisplay from '@/app/components/OrderDetails/OrderInfoDisplay'
import DeleteOrderModal from '@/app/components/OrderDetails/DeleteOrderModal'
import CompleteOrderModal from '@/app/components/OrderDetails/CompleteOrderModal'
import PrePrintModal from '@/app/components/OrderDetails/PrePrintModal'
import type {
  OptionType,
  ResidentData,
} from '@/app/components/OrderDetails/ResidentSelectionSection'

interface Data {
  items: OrderResponseProps
}

const completeOrderSlug = 'order-status-complete'

const isDiscountExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const resolveDiscountTypeLabelFromOrder = (
  order: OrderResponseProps | null
): { label: string; isExpired: boolean } => {
  if (!order) return { label: 'بدون تخفیف', isExpired: false }

  const clubUsed = Number((order as any)?.club_points_used ?? 0)
  if (clubUsed > 0) return { label: 'امتیاز باشگاه مشتریان', isExpired: false }

  const nextPurchaseDiscount = (order as any)?.next_purchase_discount
  if (nextPurchaseDiscount) {
    const expiresAt = nextPurchaseDiscount?.expires_at || null
    const expired = isDiscountExpired(expiresAt)
    return {
      label: expired ? 'تخفیف خرید بعدی (منقضی شده)' : 'تخفیف خرید بعدی',
      isExpired: expired,
    }
  }

  const d: any = (order as any)?.discount
  if (d) {
    const expiresAt = d?.expires_at || d?.end_date || null
    const expired = isDiscountExpired(expiresAt)

    const name = String(d?.name ?? '')
    const scope = String(d?.scope ?? '')
    const slug = String(d?.slug ?? '')

    let label = 'تخفیف اعمال شده'

    if (name) {
      label = name
    } else if (slug.includes('global') || scope === 'global') {
      label = 'تخفیف همگانی'
    } else if (slug.includes('normal') || scope === 'normal') {
      label = 'تخفیف ساده'
    } else if (scope === 'in_order') {
      label = 'تخفیف دستی'
    }

    if (expired) {
      label += ' (منقضی شده)'
    }

    return { label, isExpired: expired }
  }

  const discounted = Number((order as any)?.discounted_price ?? 0)
  if (discounted > 0) return { label: 'تخفیف اعمال شده', isExpired: false }

  return { label: 'بدون تخفیف', isExpired: false }
}

const getDiscountTypeLabel = (order: OrderResponseProps | null): string => {
  return resolveDiscountTypeLabelFromOrder(order).label
}

const resolveDiscountCodeFromOrder = (order: OrderResponseProps | null) => {
  const d: any = (order as any)?.discount
  return d?.code ?? d?.discount_code ?? (order as any)?.discount_code ?? null
}

const getDiscountDisplayInfo = (
  order: OrderResponseProps | null
): {
  typeLabel: string
  code: string | null
  isExpired: boolean
  expiresAt: string | null
  amount: number
  percentage: number | null
} => {
  if (!order) {
    return {
      typeLabel: 'بدون تخفیف',
      code: null,
      isExpired: false,
      expiresAt: null,
      amount: 0,
      percentage: null,
    }
  }

  const { label, isExpired } = resolveDiscountTypeLabelFromOrder(order)
  const code = resolveDiscountCodeFromOrder(order)
  const discountedPrice = Number((order as any)?.discounted_price ?? 0)

  const d: any = (order as any)?.discount
  const expiresAt = d?.expires_at || d?.end_date || null
  const percentage = d?.discount_percentage || d?.percentage || null

  return {
    typeLabel: label,
    code,
    isExpired,
    expiresAt,
    amount: discountedPrice,
    percentage,
  }
}

const hydrateDiscountIntoForm = (
  methods: ReturnType<typeof useForm<OrderRequestProps>>,
  order: OrderResponseProps | null
) => {
  if (!order) return

  const clubUsed = Number((order as any)?.club_points_used ?? 0)
  const nextPurchase = Boolean((order as any)?.next_purchase_discount)
  const d: any = (order as any)?.discount
  const code = d?.code ?? null
  const scope = String(d?.scope ?? '')
  const slug = String(d?.slug ?? '')

  methods.setValue('selected_discount_type', '' as any)
  methods.setValue('discount_normal_code', null as any)
  methods.setValue('discount_global_code', null as any)
  methods.setValue('discount_type', undefined as any)
  methods.setValue('discount_value', 0 as any)
  methods.setValue('use_club_points', null as any)
  methods.setValue('use_next_purchase_discount', false as any)

  if (clubUsed > 0) {
    methods.setValue('selected_discount_type', '5' as any)
    methods.setValue('use_club_points', true as any)
    return
  }

  if (nextPurchase) {
    methods.setValue('selected_discount_type', '4' as any)
    methods.setValue('use_next_purchase_discount', true as any)
    return
  }

  if (scope === 'in_order') {
    methods.setValue('selected_discount_type', '2' as any)
    methods.setValue(
      'discount_type',
      (d?.discount_type || DiscountType.percentage) as any
    )
    methods.setValue('discount_value', Number(d?.discount_value) || 0)
    return
  }

  if (code) {
    const isGlobal = scope === 'global' || slug.includes('global')
    if (isGlobal) {
      methods.setValue('selected_discount_type', '3' as any)
      methods.setValue('discount_global_code', code as any)
    } else {
      methods.setValue('selected_discount_type', '1' as any)
      methods.setValue('discount_normal_code', code as any)
    }
  }
}

const normalizeNullableText = (value: unknown) => {
  if (value === null || value === undefined) return null
  const s = (typeof value === 'string' ? value : String(value)).trim()
  return s.length ? s : null
}

const applyDiscountToPayload = (payload: any, data: OrderRequestProps) => {
  const selectedType = String(
    (data as any)?.selected_discount_type ?? ''
  ).trim()

  payload.discount_normal_code = null
  payload.discount_global_code = null
  payload.discount_type = null
  payload.discount_value = null
  payload.use_club_points = null
  payload.use_next_purchase_discount = false

  if (!selectedType) {
    return payload
  }

  if (selectedType === '1') {
    payload.discount_normal_code = (data as any)?.discount_normal_code ?? null
  } else if (selectedType === '3') {
    payload.discount_global_code = (data as any)?.discount_global_code ?? null
  } else if (selectedType === '2') {
    payload.discount_type =
      (data as any)?.discount_type || DiscountType.percentage
    payload.discount_value = (data as any)?.discount_value ?? null
  } else if (selectedType === '4') {
    payload.use_next_purchase_discount = Boolean(
      (data as any)?.use_next_purchase_discount
    )
  } else if (selectedType === '5') {
    payload.use_club_points = Boolean((data as any)?.use_club_points)
  }

  return payload
}

const Page = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const router = useRouter()
  const methods = useForm<OrderRequestProps>({ mode: 'onChange' })

  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const {
    isOpen: isCompleteOpen,
    onOpen: onCompleteOpen,
    onClose: OnCompleteClose,
    onOpenChange: onCompleteOpenChange,
  } = useDisclosure()

  const {
    isOpen: isPrintModalOpen,
    onOpen: onPrintModalOpen,
    onOpenChange: onPrintModalOpenChange,
    onClose: onPrintModalClose,
  } = useDisclosure()

  const paymentMethod = methods.watch('payment_method')
  const reserveNumberWatch = methods.watch('reserve_number')

  const [tabSelected, setTabSelected] = useState<string>('resident')
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isPrintLoading, setIsPrintLoading] = useState(false)
  const [isCompleteLoading, setIsCompleteLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderResponseProps | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<
    TypeResponseProps[] | null
  >(null)

  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(
    null
  )
  const [residentOptions, setResidentOptions] = useState<ResidentData[]>([])
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)

  const [customerType, setCustomerType] = useState<string>('existing')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const discountDisplayInfo = useMemo(
    () => getDiscountDisplayInfo(orderData),
    [orderData]
  )

  const handleTabChange = (key: string) => setTabSelected(key)

  const postToInvoice = (payload: any) => {
    const invoiceWindow = window.open('../../invoice', '_blank')
    if (!invoiceWindow) return

    const safeOrigin = window.location.origin
    setTimeout(() => {
      invoiceWindow.postMessage(payload, safeOrigin)
    }, 700)
  }

  const handleDeleteOrder = async () => {
    try {
      setIsDeleteLoading(true)
      await apiRequest(ORDER_API.deleteById(), { order: orderId })
      router.push(DASHBOARD_PATH.REPORT)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const handleCompleteOrder = async (data: OrderRequestProps) => {
    try {
      setIsCompleteLoading(true)

      if (discountDisplayInfo.isExpired) {
        const expiredResult = await Swal.fire({
          title: 'تخفیف منقضی شده',
          html: `<p style="color: #dc2626; font-weight: bold;">⚠️ کد تخفیف "${discountDisplayInfo.code || discountDisplayInfo.typeLabel}" منقضی شده است.</p><p>آیا می‌خواهید بدون تخفیف ادامه دهید؟</p>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'بله، بدون تخفیف ادامه بده',
          cancelButtonText: 'انصراف',
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#6b7280',
          reverseButtons: true,
        })

        if (!expiredResult.isConfirmed) {
          setIsCompleteLoading(false)
          return
        }

        methods.setValue('selected_discount_type', '' as any)
        methods.setValue('discount_normal_code', null as any)
        methods.setValue('discount_global_code', null as any)
        methods.setValue('discount_type', undefined as any)
        methods.setValue('discount_value', 0 as any)
        methods.setValue('use_next_purchase_discount', false as any)
        methods.setValue('use_club_points', null as any)
      }

      const result = await Swal.fire({
        title: 'تایید نهایی سفارش',
        text: 'آیا از ثبت نهایی سفارش مطمئن هستید؟ این عمل قابل بازگشت نیست.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'بله، ثبت کن',
        cancelButtonText: 'انصراف',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        reverseButtons: true,
        customClass: { popup: 'animated bounceIn' },
      })

      if (!result.isConfirmed) return

      const freshData = methods.getValues()

      let payload: any = {}
      let apiEndpoint

      if (tabSelected === 'guest') {
        payload = {
          phone:
            customerType == 'existing'
              ? selectedCustomer?.phone.replace(/[۰-۹]/g, (d: string) =>
                  '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
                )
              : (freshData as any)?.phone?.replace(/[۰-۹]/g, (d: string) =>
                  '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
                ),
          name:
            customerType == 'existing'
              ? selectedCustomer?.name
              : (freshData as any)?.name,
          payment_method: (freshData as any)?.payment_method,
          order_type: 'guest',
        }

        if (
          paymentMethods?.filter((x) => x.id == paymentMethod).length &&
          paymentMethods?.filter((x) => x.id == paymentMethod).length > 0 &&
          paymentMethods
            ?.filter((x) => x.id == paymentMethod)[0]
            ?.slug?.includes('pos')
        ) {
          payload = {
            ...payload,
            serial_number: (freshData as any)?.serial_number,
          }
        }

        payload = applyDiscountToPayload(payload, freshData)
        apiEndpoint = ORDER_API.completeOrder(payload)
      } else {
        payload = {
          payment_method: (freshData as any)?.payment_method,
          order_type: 'resident',
        }

        if (
          paymentMethods?.filter((x) => x.id == paymentMethod)[0]?.slug !==
          'payment-method-resident-user'
        ) {
          payload.phone = (freshData as any)?.phone?.replace(
            /[۰-۹]/g,
            (d: string) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
          )
          payload.name = (freshData as any)?.name
        } else {
          payload.reserve_number = (freshData as any)?.reserve_number
        }

        if (
          paymentMethods?.filter((x) => x.id == paymentMethod).length &&
          paymentMethods?.filter((x) => x.id == paymentMethod).length > 0 &&
          paymentMethods
            ?.filter((x) => x.id == paymentMethod)[0]
            ?.slug?.includes('pos')
        ) {
          payload = {
            ...payload,
            serial_number: (freshData as any)?.serial_number,
          }
        }

        payload = applyDiscountToPayload(payload, freshData)
        apiEndpoint = ORDER_API.completeOrder(payload)
      }

      const response = await apiRequest<Data>(apiEndpoint, { order: orderId })
      toast.success(response?.message)

      setIsLoading(true)
      setOrderData(response?.data.items as OrderResponseProps)
      OnCompleteClose()
      setIsLoading(false)
    } catch (error) {
      console.error(error)

      const errorMessage = (error as any)?.response?.data?.message || ''
      if (errorMessage.includes('|expired') || errorMessage.includes('منقضی')) {
        toast.error('کد تخفیف منقضی شده است')
      }

      handleApiErrors(
        error as ValidationErrorResponseType<any>,
        methods.setError
      )
    } finally {
      setIsCompleteLoading(false)
    }
  }

  const handlePrintButtonClick = () => {
    if (orderData?.status.slug === completeOrderSlug) {
      const discountInfo = resolveDiscountTypeLabelFromOrder(orderData)
      postToInvoice({
        ...orderData,
        discount_type_label: discountInfo.label,
        discount_is_expired: discountInfo.isExpired,
        discount_code_value: resolveDiscountCodeFromOrder(orderData),
        __print_token: String(
          orderData.invoice_number ?? orderData.id ?? Date.now()
        ),
      })
    } else {
      onPrintModalOpen()
    }
  }

  const handlePrePrint = async (data: OrderRequestProps) => {
    try {
      setIsCompleteLoading(true)

      const freshData = methods.getValues()

      let payload: any = {}
      let apiEndpoint

      if (tabSelected === 'guest') {
        payload = {
          phone:
            customerType == 'existing'
              ? selectedCustomer?.phone.replace(/[۰-۹]/g, (d: string) =>
                  '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
                )
              : (freshData as any)?.phone?.replace(/[۰-۹]/g, (d: string) =>
                  '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
                ),
          name:
            customerType == 'existing'
              ? selectedCustomer?.name
              : (freshData as any)?.name,
          order_type: 'guest',
        }

        if (
          paymentMethods?.filter((x) => x.id == paymentMethod).length &&
          paymentMethods?.filter((x) => x.id == paymentMethod).length > 0 &&
          paymentMethods
            ?.filter((x) => x.id == paymentMethod)[0]
            ?.slug?.includes('pos')
        ) {
          payload = {
            ...payload,
            serial_number: (freshData as any)?.serial_number,
          }
        }

        payload = applyDiscountToPayload(payload, freshData)
        apiEndpoint = ORDER_API.prePrint(payload)
      } else {
        payload = {
          reserve_number: (freshData as any)?.reserve_number,
          order_type: 'resident',
        }

        if (
          paymentMethods?.filter((x) => x.id == paymentMethod).length &&
          paymentMethods?.filter((x) => x.id == paymentMethod).length > 0 &&
          paymentMethods
            ?.filter((x) => x.id == paymentMethod)[0]
            ?.slug?.includes('pos')
        ) {
          payload = {
            ...payload,
            serial_number: (freshData as any)?.serial_number,
          }
        }

        payload = applyDiscountToPayload(payload, freshData)
        apiEndpoint = ORDER_API.prePrint(payload)
      }

      const response = await apiRequest<Data>(apiEndpoint, { order: orderId })

      setIsLoading(true)
      setOrderData(response?.data.items as OrderResponseProps)
      onPrintModalClose()
      setIsLoading(false)

      if (response?.data.items) {
        const saved = response.data.items
        const savedDiscountInfo = resolveDiscountTypeLabelFromOrder(saved)
        postToInvoice({
          ...saved,
          discount_type_label: savedDiscountInfo.label,
          discount_is_expired: savedDiscountInfo.isExpired,
          discount_code_value: resolveDiscountCodeFromOrder(saved),
          __print_token: String(
            (saved as any).invoice_number ?? (saved as any).id ?? Date.now()
          ),
        })
      }
    } catch (error) {
      console.error(error)

      const errorMessage = (error as any)?.response?.data?.message || ''
      if (errorMessage.includes('|expired') || errorMessage.includes('منقضی')) {
        toast.error('کد تخفیف منقضی شده است')
      }

      handleApiErrors(
        error as ValidationErrorResponseType<any>,
        methods.setError
      )
    } finally {
      setIsCompleteLoading(false)
    }
  }

  const handlePrintOrder = async () => {
    try {
      setIsPrintLoading(true)

      if (orderData) {
        const discountInfo = resolveDiscountTypeLabelFromOrder(orderData)
        postToInvoice({
          ...orderData,
          discount_type_label: discountInfo.label,
          discount_is_expired: discountInfo.isExpired,
          discount_code_value: resolveDiscountCodeFromOrder(orderData),
          __print_token: String(
            orderData.invoice_number ?? orderData.id ?? Date.now()
          ),
        })
      }

      try {
        const response = await apiRequest<Data>(PRINTER_API.printInvoice(), {
          order: orderId,
        })
        toast.success(response?.message || 'فاکتور برای چاپ ارسال شد')
      } catch (apiError) {
        console.error(apiError)
        toast.info('فاکتور در مرورگر باز شد (چاپ فیزیکی در دسترس نیست)')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsPrintLoading(false)
    }
  }

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)

      const requestConfig = ORDER_API.getAll()
      requestConfig.params = { order_id: orderId }

      const typeRequestConfig = TYPE_API.getAll()
      typeRequestConfig.params = { category: 'payment_method' }

      const [response, typeResponse] = await Promise.all([
        apiRequest<PaginationResponseProps<OrderResponseProps>>(requestConfig),
        apiRequest<PaginationResponseProps<TypeResponseProps>>(
          typeRequestConfig
        ),
      ])

      setPaymentMethods(typeResponse?.data.items as TypeResponseProps[])

      const orderDataResponse = response?.data.items[0]
      if (orderDataResponse) {
        setOrderData(orderDataResponse)
        if (!!orderDataResponse?.customer && !orderDataResponse.reserve)
          setTabSelected('guest')
      } else {
        toast.warning(EMPTY_CONTENT_ERROR)
        router.push(DASHBOARD_PATH.MAIN)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) fetchOrderDetails()
    else {
      toast.warning(EMPTY_CONTENT_ERROR)
      router.push(DASHBOARD_PATH.REPORT)
    }
  }, [])

  useEffect(() => {
    if (!orderData) return

    if (orderData.reserve) {
      const residentData: ResidentData = {
        Room: orderData.reserve.Room,
        Reserve: orderData.reserve_number?.toString?.() ?? undefined,
        GuestName: orderData.reserve.GuestName,
        company: (orderData.reserve as any).company ?? null,
        Arrival: (orderData.reserve as any).Arrival ?? null,
        departure: (orderData.reserve as any).departure ?? null,
      }

      setSelectedResident(residentData)
      methods.setValue('room_number', residentData.Room || '')
      methods.setValue('reserve_number', residentData.Reserve || '')

      const reserveKey = residentData.Reserve ?? ''
      if (
        !residentOptions.some((item) => (item.Reserve ?? '') === reserveKey)
      ) {
        setResidentOptions((prev) => [...prev, residentData])
      }
    }

    if (orderData.customer) {
      methods.setValue('name', orderData.customer.name || '')
      methods.setValue('phone', orderData.customer.phone || '')
      setSelectedCustomer(orderData.customer)
      methods.setValue('customer_type', 'guest' as any)
      methods.setValue('customer_id', (orderData.customer as any).id ?? null)
    }

    hydrateDiscountIntoForm(methods, orderData)
  }, [orderData])

  useEffect(() => {
    const reserveNumber = methods.getValues('reserve_number')
    const roomNumber = methods.getValues('room_number')

    const reserveStr = reserveNumber?.toString?.() ?? ''
    const roomStr = roomNumber?.toString?.() ?? ''

    if (reserveStr || roomStr) {
      const found = residentOptions.find(
        (item) => (item.Reserve ?? '') === reserveStr
      )

      const option: OptionType = {
        value: reserveStr,
        label: found
          ? `${found.Room ?? ''} - ${found.Reserve ?? ''}`
          : `${roomStr} - ${reserveStr}`,
        data: found || {
          Room: roomStr,
          Reserve: reserveStr,
          GuestName: 'نامشخص',
        },
      }

      setSelectedOption(option)
    }
  }, [reserveNumberWatch, residentOptions])

  const residentSelectProps = useMemo(
    () => ({
      setValue: methods.setValue,
      selectedOption,
      setSelectedOption,
      selectedResident,
      setSelectedResident,
    }),
    [methods.setValue, selectedOption, selectedResident]
  )

  return isLoading ? (
    <p className="my-5 w-full whitespace-nowrap text-center text-xl font-bold">
      {LOADING_CONTENT_TEXT}...
    </p>
  ) : (
    <div className="flex h-fit max-h-[calc(100svh-90px)] flex-col gap-5 overflow-y-auto p-5 pb-20 md:pb-0">
      <h1 className="text-xl font-bold text-default-700">
        {ORDERS_DETAIL_TEXT}
      </h1>

      <OrderInfoDisplay
        orderData={orderData}
        orderId={orderId}
        isLoading={isLoading}
        isPrintLoading={isPrintLoading}
        isCompleteLoading={isCompleteLoading}
        completeOrderSlug={completeOrderSlug}
        onCompleteOpen={onCompleteOpen}
        onDeleteOpen={onOpen}
        handlePrintOrder={handlePrintOrder}
        handlePrintButtonClick={handlePrintButtonClick}
        discountDisplayInfo={discountDisplayInfo}
      />

      <DeleteOrderModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        handleDeleteOrder={handleDeleteOrder}
        isDeleteLoading={isDeleteLoading}
      />

      <CompleteOrderModal
        isOpen={isCompleteOpen}
        onOpenChange={onCompleteOpenChange}
        methods={methods}
        onSubmit={handleCompleteOrder}
        isLoading={isLoading}
        isCompleteLoading={isCompleteLoading}
        tabSelected={tabSelected}
        handleTabChange={handleTabChange}
        paymentMethods={paymentMethods}
        paymentMethod={paymentMethod}
        selectedResident={selectedResident}
        residentSelectProps={residentSelectProps}
        customerType={customerType}
        setCustomerType={setCustomerType}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        discountDisplayInfo={discountDisplayInfo}
      />

      <PrePrintModal
        isOpen={isPrintModalOpen}
        onOpenChange={onPrintModalOpenChange}
        methods={methods}
        onSubmit={handlePrePrint}
        tabSelected={tabSelected}
        handleTabChange={handleTabChange}
        residentSelectProps={residentSelectProps}
        customerType={customerType}
        setCustomerType={setCustomerType}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        discountDisplayInfo={discountDisplayInfo}
      />
    </div>
  )
}

export default Page
