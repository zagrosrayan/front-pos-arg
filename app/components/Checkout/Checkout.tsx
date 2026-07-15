// components/checkout/Checkout.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client'

import {
  CREATE_ORDER_LABEL,
  ORDERS_LIST_LABEL,
  UPDATE_ORDER_LABEL,
} from '@/app/constant/label'
import { LOADING_CONTENT_TEXT } from '@/app/constant/text'
import { useAddToCart, useCart, useClearCart } from '@/app/hook/useCart'
import { apiRequest } from '@/lib/axios'
import { ORDER_API } from '@/routes/api/order'
import { DASHBOARD_PATH } from '@/routes/path'
import {
  CalculateItems,
  CalculateResponseProps,
  PaginationResponseProps,
} from '@/types/apiTypes'
import { ValidationErrorResponseType } from '@/types/errorTypes'
import {
  DiscountType,
  OrderRequestProps,
  OrderResponseProps,
  ServiceType,
} from '@/types/orderType'
import { hasDataChanged } from '@/utils'
import { handleApiErrors } from '@/utils/handleApiError'
import { Button, cn, Form, Radio, RadioProps, Tooltip } from '@heroui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { IoBagHandle } from 'react-icons/io5'
import { TbShoppingBagExclamation, TbTrash } from 'react-icons/tb'
import { toast } from 'react-toastify'

import CheckoutItem from './CheckoutItem'
import CheckoutDiscountSection from './CheckoutDiscountSection'
import CheckoutSummarySection from './CheckoutSummarySection'
import CheckoutOrderSection, {
  GuestMode,
  CustomerDiscountInfo,
} from './CheckoutOrderSection'

/* ═══════════════════════════════════════════════════════════════
   تایپ‌ها
   ═══════════════════════════════════════════════════════════════ */

interface CheckoutProps {
  className?: string
}

/* ═══════════════════════════════════════════════════════════════
   توابع کمکی
   ═══════════════════════════════════════════════════════════════ */

export const CustomRadio = (props: RadioProps) => {
  const { children, ...otherProps } = props
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          'flex m-0 bg-content1 hover:bg-content2 items-center justify-start',
          'max-w-none leading-relaxed cursor-pointer rounded-lg gap-4 border-2 border-transparent',
          'data-[selected=true]:border-secondary'
        ),
      }}
    >
      {children}
    </Radio>
  )
}

const normalizeText = (value: unknown) => {
  if (value === null || value === undefined) return ''
  return (typeof value === 'string' ? value : String(value)).trim()
}

const normalizeNullableText = (value: unknown) => {
  const s = normalizeText(value)
  return s.length ? s : null
}

const getResidentCompany = (item: any) => {
  return normalizeText(
    item?.company ?? item?.Company ?? item?.CompanyName ?? ''
  )
}

/** بررسی انقضای تخفیف */
const isDiscountExpired = (expiresAt: string | undefined): boolean => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

/* ═══════════════════════════════════════════════════════════════
   کامپوننت اصلی
   ═══════════════════════════════════════════════════════════════ */

const Checkout = ({ className }: CheckoutProps) => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const router = useRouter()

  const methods = useForm<OrderRequestProps>({
    mode: 'onChange',
    defaultValues: {
      rate_service: '1',
      service_type: ServiceType.dine_in,
      selected_discount_type: undefined,
      discount_type: undefined,
      discount_value: 0,
      discount_normal_code: '',
      discount_global_code: '',
      use_next_purchase_discount: false,
      use_club_points: false,
      customer_type: 'resident',
      reserve_number: '',
      room_number: '',
      customer_id: null,
      customer_name: '',
      customer_mobile: '',
    } as any,
  })

  const cart = useCart()
  const clearCart = useClearCart()
  const addToCart = useAddToCart()

  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [isOrderFetched, setIsOrderFetched] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const [calculatedData, setCalculatedData] = useState<{
    items: CalculateItems
  }>()
  const [reservationOptions, setReservationOptions] = useState<any[]>([])
  const [selectedOption, setSelectedOption] = useState<any>(null)
  const [hasDiscount, setHasDiscount] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [selectedResidentOption, setSelectedResidentOption] =
    useState<any>(null)
  const [expiredDiscountMessage, setExpiredDiscountMessage] =
    useState<string>('')

  /** حالت مشتری مهمان */
  const [guestMode, setGuestMode] = useState<GuestMode>('existing')

  /** اطلاعات تخفیف مشتری انتخاب‌شده */
  const [customerDiscountInfo, setCustomerDiscountInfo] =
    useState<CustomerDiscountInfo | null>(null)

  const lastDataRef = useRef<any>(null)

  const hasRateService = methods.watch('rate_service')
  const serviceType = methods.watch('service_type')
  const customerType = methods.watch('customer_type')
  const discountType = methods.watch('selected_discount_type')

  /* ═══════════════════════════════════════════════════════════════
     Validation
     ═══════════════════════════════════════════════════════════════ */

  const validateCustomerOrReserve = (data: OrderRequestProps) => {
    const discountSelected =
      Boolean(data.selected_discount_type) && data.selected_discount_type !== ''

    if (!discountSelected) {
      methods.clearErrors(['customer_id', 'reserve_number'] as any)
      return true
    }

    if (
      (data.selected_discount_type === '4' ||
        data.selected_discount_type === '5') &&
      data.customer_type !== 'guest'
    ) {
      methods.setError('customer_id' as any, {
        type: 'manual',
        message:
          'برای استفاده از تخفیف خرید بعدی یا امتیاز باشگاه، انتخاب مشتری مهمان الزامی است.',
      })
      return false
    }

    if (
      (data.selected_discount_type === '4' ||
        data.selected_discount_type === '5') &&
      data.customer_type === 'guest'
    ) {
      if (guestMode === 'existing' && !data.customer_id) {
        methods.setError('customer_id' as any, {
          type: 'manual',
          message: 'انتخاب مشتری الزامی است.',
        })
        return false
      }
      if (guestMode === 'new') {
        const name = normalizeText((data as any).customer_name)
        const mobile = normalizeText((data as any).customer_mobile)
        if (!name || !mobile) {
          if (!name) {
            methods.setError('customer_name' as any, {
              type: 'manual',
              message: 'نام مشتری الزامی است.',
            })
          }
          if (!mobile) {
            methods.setError('customer_mobile' as any, {
              type: 'manual',
              message: 'شماره موبایل الزامی است.',
            })
          }
          return false
        }
      }
    }

    methods.clearErrors(['customer_id', 'reserve_number'] as any)
    return true
  }

  const validateNewGuestFields = (data: OrderRequestProps): boolean => {
    if (customerType !== 'guest' || guestMode !== 'new') return true

    let valid = true
    const name = normalizeText((data as any).customer_name)
    const mobile = normalizeText((data as any).customer_mobile)

    if (!name) {
      methods.setError('customer_name' as any, {
        type: 'manual',
        message: 'نام مشتری الزامی است.',
      })
      valid = false
    }
    if (!mobile) {
      methods.setError('customer_mobile' as any, {
        type: 'manual',
        message: 'شماره موبایل الزامی است.',
      })
      valid = false
    }

    return valid
  }

  /* ═══════════════════════════════════════════════════════════════
     Calculate Order
     ═══════════════════════════════════════════════════════════════ */

  const calculateOrder = useCallback(async () => {
    const data = methods.getValues()

    const order = cart.map((item) => ({
      food_id: item.id,
      quantity: item.count,
    }))

    const currentData = { ...data, order }
    if (!hasDataChanged(lastDataRef.current, currentData)) return

    setCalculatedData({
      items: {
        club_points_remaining: 0,
        club_points_used: 0,
        discounted_price: 0,
        final_price: 0,
        product_price: 0,
        rate_service: 0,
        tax_amount: 0,
        total_price: 0,
      },
    })
    lastDataRef.current = currentData

    const payload: any = {
      rate_service: data.rate_service,
      reserve_number: normalizeNullableText(data.reserve_number),
      customer_id: normalizeNullableText(data.customer_id)
        ? String(data.customer_id)
        : null,
      order,
      use_next_purchase_discount: false,
      use_club_points: false,
    }

    if (data.selected_discount_type === '1' && data.discount_normal_code) {
      payload.discount_normal_code = data.discount_normal_code
      payload.discount_type = null
      payload.discount_value = null
      payload.discount_global_code = null
      payload.use_next_purchase_discount = false
      payload.use_club_points = false
    } else if (data.selected_discount_type === '2' && data.discount_value) {
      payload.discount_type = data.discount_type || DiscountType.percentage
      payload.discount_value = data.discount_value || 0
      payload.discount_normal_code = null
      payload.discount_global_code = null
      payload.use_next_purchase_discount = false
      payload.use_club_points = false
    } else if (
      data.selected_discount_type === '3' &&
      data.discount_global_code
    ) {
      payload.discount_global_code = data.discount_global_code
      payload.discount_normal_code = null
      payload.discount_type = null
      payload.discount_value = null
      payload.use_next_purchase_discount = false
      payload.use_club_points = false
    } else if (data.selected_discount_type === '4') {
      payload.use_next_purchase_discount = Boolean(
        data.use_next_purchase_discount ?? true
      )
      payload.discount_global_code = null
      payload.discount_normal_code = null
      payload.discount_type = null
      payload.discount_value = null
      payload.use_club_points = false
    } else if (data.selected_discount_type === '5') {
      payload.use_club_points = Boolean(data.use_club_points)
      payload.discount_global_code = null
      payload.discount_normal_code = null
      payload.discount_type = null
      payload.discount_value = null
      payload.use_next_purchase_discount = false
    } else {
      payload.discount_global_code = null
      payload.discount_normal_code = null
      payload.discount_type = null
      payload.discount_value = null
      payload.use_next_purchase_discount = false
      payload.use_club_points = false
    }

    try {
      const response = await apiRequest<CalculateResponseProps>(
        ORDER_API.ajaxCalculate(payload)
      )
      setCalculatedData(response?.data as CalculateResponseProps)
      setExpiredDiscountMessage('')

      methods.clearErrors([
        'discount_normal_code',
        'discount_global_code',
        'discount_value',
        'use_next_purchase_discount',
        'use_club_points',
      ] as any)
    } catch (error) {
      console.error('Failed to calculate order:', error)
      const errorMessage = (error as any)?.response?.data?.message || ''
      if (errorMessage.includes('|expired')) {
        setExpiredDiscountMessage('کد تخفیف منقضی شده است')
      } else {
        setExpiredDiscountMessage('')
      }
    }
  }, [methods, cart])

  /* ═══════════════════════════════════════════════════════════════
     Effects
     ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    if (serviceType === ServiceType.takeaway) {
      methods.setValue('rate_service', '0')
    }
    if (serviceType === ServiceType.room_service) {
      methods.setValue('customer_type', 'resident')
    }
  }, [serviceType, methods])

  useEffect(() => {
    if (customerType === 'resident') {
      methods.setValue('customer_id', null)
      methods.setValue('customer_name' as any, '')
      methods.setValue('customer_mobile' as any, '')
      setSelectedCustomer(null)
      setGuestMode('existing')
      setCustomerDiscountInfo(null)
    } else if (customerType === 'guest') {
      methods.setValue('reserve_number', '')
      methods.setValue('room_number', '')
      setSelectedResidentOption(null)
    }
  }, [customerType, methods])

  useEffect(() => {
    if (guestMode === 'new') {
      methods.setValue('customer_id', null)
      setSelectedCustomer(null)
      setCustomerDiscountInfo(null)
      methods.clearErrors('customer_id' as any)
    } else {
      methods.setValue('customer_name' as any, '')
      methods.setValue('customer_mobile' as any, '')
      methods.clearErrors(['customer_name', 'customer_mobile'] as any)
    }
  }, [guestMode, methods])

  useEffect(() => {
    if (cart.length === 0) return
    calculateOrder()
    const interval = setInterval(() => calculateOrder(), 2000)
    return () => clearInterval(interval)
  }, [cart, calculateOrder])

  /* ═══════════════════════════════════════════════════════════════
     Fetch Order Details
     ═══════════════════════════════════════════════════════════════ */

  const fetchOrderDetails = useCallback(
    async (id: string) => {
      try {
        setIsLoadingOrder(true)
        const requestConfig = ORDER_API.getAll()
        requestConfig.params = { order_id: id }

        const response =
          await apiRequest<PaginationResponseProps<OrderResponseProps>>(
            requestConfig
          )
        const orderData = response?.data.items[0]

        if (!orderData) {
          router.push(DASHBOARD_PATH.MAIN)
          return
        }

        clearCart()
        setIsUpdating(true)

        methods.setValue(
          'rate_service',
          orderData.rate_service == null || orderData.rate_service == '0'
            ? '0'
            : '1'
        )
        methods.setValue('desc_number', orderData.desc_number || '')
        methods.setValue(
          'service_type',
          orderData.service_type || ServiceType.dine_in
        )

        if (orderData.customer) {
          methods.setValue('customer_type', 'guest')
          methods.setValue('customer_id', orderData.customer.id || '')
          setSelectedCustomer(orderData.customer)
          setGuestMode('existing')

          const discountInfo: CustomerDiscountInfo = {
            hasNextPurchaseDiscount: Boolean(
              orderData.customer.next_purchase_discount_code
            ),
            nextPurchaseDiscountCode:
              orderData.customer.next_purchase_discount_code,
            nextPurchaseDiscountExpired: isDiscountExpired(
              orderData.customer.next_purchase_discount_expires_at
            ),
            nextPurchaseDiscountExpiresAt:
              orderData.customer.next_purchase_discount_expires_at,
            clubPoints: orderData.customer.club_points || 0,
          }
          setCustomerDiscountInfo(discountInfo)
        }

        if (orderData.reserve) {
          methods.setValue('customer_type', 'resident')
          methods.setValue('reserve_number', orderData.reserve_number || '')
          methods.setValue('room_number', orderData.reserve.Room || '')

          const company = getResidentCompany(orderData.reserve)
          setSelectedResidentOption({
            value: orderData.reserve_number || '',
            label: `${orderData.reserve.Room || ''} - ${orderData.reserve_number || ''}${
              company ? ` - ${company}` : ''
            }`,
            data: {
              ...orderData.reserve,
              Room: orderData.reserve.Room,
              Reserve: orderData.reserve_number,
              company: company,
            },
          })
        }

        if (orderData.discount) {
          setHasDiscount(true)

          if (orderData.discount.scope === 'global') {
            methods.setValue('selected_discount_type', '3')
            methods.setValue(
              'discount_global_code',
              orderData.discount.code || ''
            )
            setSelectedOption({
              value: orderData.discount.code,
              label: orderData.discount.name,
              data: orderData.discount,
            })
          } else if (orderData.discount.scope === 'normal') {
            methods.setValue('selected_discount_type', '1')
            methods.setValue(
              'discount_normal_code',
              orderData.discount.code || ''
            )
            setSelectedOption({
              value: orderData.discount.code,
              label: orderData.discount.name,
              data: orderData.discount,
            })
          } else if (orderData.discount.scope === 'in_order') {
            methods.setValue('selected_discount_type', '2')
            methods.setValue(
              'discount_type',
              orderData.discount.discount_type || ('' as any)
            )
            methods.setValue(
              'discount_value',
              Number(orderData.discount.discount_value) || 0
            )
          }
        }

        if (Number(orderData.club_points_used) > 0) {
          setHasDiscount(true)
          methods.setValue('selected_discount_type', '5')
          methods.setValue('use_club_points', true)
        }

        if (orderData.next_purchase_discount) {
          setHasDiscount(true)
          methods.setValue('selected_discount_type', '4')
          methods.setValue('use_next_purchase_discount', true)
        }

        orderData.children.forEach((child) => {
          if (!child.food) return
          addToCart({
            id: child.food.id,
            name: child.food.name,
            price: child.food.price,
            slug: child.food.slug,
            status: child.food.status,
            article_id: child.food.article_id,
            profit_manager_id: child.food.profit_manager_id,
            description: child.description,
            image: child.food.image,
            article: child.food.article,
            profit_manager: child.food.profit_manager,
            quantity: Number(child.quantity),
          })
          methods.setValue(
            `order.${child.food.id}.description` as any,
            child.description
          )
        })

        setIsOrderFetched(true)
      } catch (error) {
        console.error('Failed to fetch order details:', error)
      } finally {
        setIsLoadingOrder(false)
      }
    },
    [addToCart, clearCart, methods, router]
  )

  const fetchData = useCallback(async () => {
    try {
      if (orderId && !isOrderFetched) {
        await fetchOrderDetails(orderId)
      } else {
        setIsLoadingOrder(false)
      }
    } catch (error) {
      console.error(error)
    }
  }, [orderId, isOrderFetched, fetchOrderDetails])

  useEffect(() => {
    fetchData()
    if (!orderId) setIsUpdating(false)
  }, [fetchData, orderId])

  useEffect(() => {
    if (cart.length === 0) methods.reset()
  }, [cart.length, methods])

  /* ═══════════════════════════════════════════════════════════════
     Build Payload
     ═══════════════════════════════════════════════════════════════ */

  const buildOrderPayload = (data: OrderRequestProps, order: any[]) => {
    const isNewGuest = data.customer_type === 'guest' && guestMode === 'new'

    const payload: any = {
      order,
      rate_service: data.rate_service,
      desc_number:
        data.service_type == ServiceType.dine_in ? data.desc_number : null,
      service_type: data.service_type,
    }

    if (isNewGuest) {
      payload.customer_name = normalizeText((data as any).customer_name)
      payload.customer_mobile = normalizeText((data as any).customer_mobile)
    } else {
      payload.reserve_number = normalizeNullableText(data.reserve_number)
      payload.customer_id = normalizeNullableText(data.customer_id)
        ? String(data.customer_id)
        : null
    }

    if (data.selected_discount_type == '2') {
      payload.discount_type = data.discount_type ?? DiscountType.percentage
      payload.discount_value = data.discount_value
    } else if (data.selected_discount_type == '1') {
      payload.discount_normal_code = data.discount_normal_code
    } else if (data.selected_discount_type == '3') {
      payload.discount_global_code = data.discount_global_code
    } else if (data.selected_discount_type == '4') {
      payload.use_next_purchase_discount = Boolean(
        data.use_next_purchase_discount ?? true
      )
    } else if (data.selected_discount_type == '5') {
      payload.use_club_points = Boolean(data.use_club_points)
    }

    return payload
  }

  /* ═══════════════════════════════════════════════════════════════
     Submit Handlers
     ═══════════════════════════════════════════════════════════════ */

  const handleUpdateOrder = async (data: OrderRequestProps) => {
    if (!validateCustomerOrReserve(data)) return
    if (!validateNewGuestFields(data)) return

    if (
      data.selected_discount_type === '4' &&
      customerDiscountInfo?.nextPurchaseDiscountExpired
    ) {
      toast.error('کد تخفیف خرید بعدی منقضی شده است و قابل استفاده نیست.')
      return
    }

    try {
      setIsSubmitLoading(true)

      const order = cart.map((item) => ({
        quantity: item.count,
        food_id: item.id,
        description: data.order?.[item.id]?.description || '',
      }))

      const payload = buildOrderPayload(data, order)
      payload.send_sms = true

      const response = await apiRequest(ORDER_API.updateById(payload), {
        order: orderId,
      })
      toast.success(response?.message || 'سفارش با موفقیت بروزرسانی شد')

      clearCart()
      methods.reset()
      setHasDiscount(false)
      setSelectedOption(null)
      setExpiredDiscountMessage('')
      setGuestMode('existing')
      setCustomerDiscountInfo(null)
      router.push(DASHBOARD_PATH.MAIN)
      setIsUpdating(false)
    } catch (error) {
      console.error('Failed to submit order:', error)

      const errorMessage = (error as any)?.response?.data?.message || ''
      if (errorMessage.includes('|expired')) {
        setExpiredDiscountMessage('کد تخفیف منقضی شده است')
        return
      } else {
        setExpiredDiscountMessage('')
        handleApiErrors(
          error as ValidationErrorResponseType<any>,
          methods.setError
        )
      }
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const onSubmit = async (data: OrderRequestProps) => {
    if (!validateCustomerOrReserve(data)) return
    if (!validateNewGuestFields(data)) return

    if (
      data.selected_discount_type === '4' &&
      customerDiscountInfo?.nextPurchaseDiscountExpired
    ) {
      toast.error('کد تخفیف خرید بعدی منقضی شده است و قابل استفاده نیست.')
      return
    }

    try {
      setIsSubmitLoading(true)

      const order = cart.map((item) => ({
        quantity: item.count,
        food_id: item.id,
        description: data.order?.[item.id]?.description || '',
      }))

      const payload = buildOrderPayload(data, order)
      payload.send_sms = false

      const response = await apiRequest(ORDER_API.create(payload))
      toast.success(response?.message || 'سفارش با موفقیت ثبت شد')

      clearCart()
      methods.reset()
      setHasDiscount(false)
      setSelectedOption(null)
      setExpiredDiscountMessage('')
      setGuestMode('existing')
      setCustomerDiscountInfo(null)
    } catch (error) {
      console.error('Failed to submit order:', error)

      const errorMessage = (error as any)?.response?.data?.message || ''
      if (errorMessage.includes('|expired')) {
        setExpiredDiscountMessage('کد تخفیف منقضی شده است')
        return
      } else {
        setExpiredDiscountMessage('')
        handleApiErrors(
          error as ValidationErrorResponseType<any>,
          methods.setError
        )
      }
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleDeleteOrder = () => {
    methods.reset()
    clearCart()
    setSelectedOption(null)
    setHasDiscount(false)
    setExpiredDiscountMessage('')
    setSelectedResidentOption(null)
    setGuestMode('existing')
    setCustomerDiscountInfo(null)
    router.push(DASHBOARD_PATH.MAIN)
  }

  const hasRateServiceEnabled = hasRateService === '1'

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return isLoadingOrder ? (
    <div className="mt-5 min-w-[410px] whitespace-nowrap p-3 text-center text-lg">
      {LOADING_CONTENT_TEXT}...
    </div>
  ) : (
    <FormProvider {...methods}>
      <Form
        className={`relative min-w-[410px] pb-3 ${className ?? ''}`}
        onSubmit={methods.handleSubmit(
          isUpdating ? handleUpdateOrder : onSubmit
        )}
      >
        <div className="z-20 flex w-[99%] items-center justify-between bg-white py-3">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <IoBagHandle className="size-5" />
            {ORDERS_LIST_LABEL}
          </h2>

          {cart.length ? (
            <Tooltip
              color="danger"
              content="لغو سفارش"
              closeDelay={0}
              delay={0}
            >
              <Button
                isIconOnly
                variant="light"
                color="danger"
                size="sm"
                onPress={handleDeleteOrder}
                className="text-lg active:opacity-50"
              >
                <TbTrash className="size-5" />
              </Button>
            </Tooltip>
          ) : null}
        </div>

        {cart.length ? (
          <div className="w-full">
            <div className="space-y-4">
              <ul className="space-y-3">
                {cart.map((item, index) => (
                  <CheckoutItem item={item} key={index} />
                ))}
              </ul>
              <CheckoutOrderSection
                serviceType={serviceType}
                customerType={customerType || 'resident'}
                guestMode={guestMode}
                setGuestMode={setGuestMode}
                selectedResidentOption={selectedResidentOption}
                setSelectedResidentOption={setSelectedResidentOption}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                customerDiscountInfo={customerDiscountInfo}
                setCustomerDiscountInfo={setCustomerDiscountInfo}
                reservationOptions={reservationOptions}
                setReservationOptions={setReservationOptions}
              />
              <CheckoutDiscountSection
                hasDiscount={hasDiscount}
                setHasDiscount={setHasDiscount}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                discountType={discountType}
                calculatedData={calculatedData}
                expiredDiscountMessage={expiredDiscountMessage}
                customerDiscountInfo={customerDiscountInfo}
                isUpdating={isUpdating}
              />
              {/* خلاصه سفارش */}
              <CheckoutSummarySection
                calculatedData={calculatedData}
                hasRateService={hasRateServiceEnabled}
              />
              {/* نمایش هشدار تخفیف منقضی */}
              {expiredDiscountMessage && (
                <div className="rounded-lg border-2 border-danger-300 bg-danger-50 p-3">
                  <p className="text-sm font-semibold text-danger-700">
                    ⚠️ {expiredDiscountMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button
                color="success"
                className="text-white"
                fullWidth
                radius="full"
                type="submit"
                isLoading={isSubmitLoading}
              >
                {isUpdating ? UPDATE_ORDER_LABEL : CREATE_ORDER_LABEL}
              </Button>
            </div>
          </div>
        ) : (
          <div className="my-12 flex h-full w-full flex-col items-center justify-center gap-5 px-8">
            <TbShoppingBagExclamation className="size-48 text-default-200" />
            <span className="text-center text-xl font-bold text-default-500">
              در حال حاضر سفارشی ندارید!
            </span>
          </div>
        )}
      </Form>
    </FormProvider>
  )
}

export default Checkout
