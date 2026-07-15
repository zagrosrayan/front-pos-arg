'use client'

import {
  DESC_NUMBER_LABEL,
  HAS_LABEL,
  HAS_NOT_LABEL,
  ORDER_DESTINATION_LABEL,
  SERVICE_COST_LABEL,
} from '@/app/constant/label'
import { apiRequest } from '@/lib/axios'
import { CUSTOMER_API } from '@/routes/api/customer'
import { USER_RESIDENT_API } from '@/routes/api/user'
import { OrderRequestProps, ServiceType } from '@/types/orderType'
import {
  Button,
  ButtonGroup,
  Chip,
  cn,
  Input,
  Radio,
  RadioGroup,
} from '@heroui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { AsyncPaginate } from 'react-select-async-paginate'
import FormInput from '../../ui/FormInput'
import FormRadioGroup from '../../ui/FormRadioGroup'

/* ═══════════════════════════════════════════════════════════════
   تایپ‌ها
   ═══════════════════════════════════════════════════════════════ */

/** حالت انتخاب مشتری مهمان */
export type GuestMode = 'existing' | 'new'

/** اطلاعات تخفیف مشتری */
export interface CustomerDiscountInfo {
  hasNextPurchaseDiscount: boolean
  nextPurchaseDiscountCode?: string
  nextPurchaseDiscountExpired: boolean
  nextPurchaseDiscountExpiresAt?: string
  clubPoints: number
}

interface CheckoutOrderSectionProps {
  serviceType: ServiceType
  customerType: string
  guestMode: GuestMode
  setGuestMode: (mode: GuestMode) => void
  selectedResidentOption: any
  setSelectedResidentOption: (option: any) => void
  selectedCustomer: any
  setSelectedCustomer: (customer: any) => void
  customerDiscountInfo: CustomerDiscountInfo | null
  setCustomerDiscountInfo: (info: CustomerDiscountInfo | null) => void
  reservationOptions: any[]
  setReservationOptions: (options: any[]) => void
}

/* ═══════════════════════════════════════════════════════════════
   توابع کمکی
   ═══════════════════════════════════════════════════════════════ */

const normalizeText = (value: unknown) => {
  if (value === null || value === undefined) return ''
  return (typeof value === 'string' ? value : String(value)).trim()
}

const isMostlyDigits = (v: string) => {
  const s = v.replace(/\s+/g, '')
  if (!s) return false
  return /^[0-9۰-۹+()-]+$/.test(s)
}

const normalizePhoneQuery = (v: string) => {
  const s = normalizeText(v)
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  }
  return s.replace(/[۰-۹]/g, (d) => map[d] ?? d).replace(/\s+/g, '')
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
   کامپوننت
   ═══════════════════════════════════════════════════════════════ */

const CheckoutOrderSection = ({
  serviceType,
  customerType,
  guestMode,
  setGuestMode,
  selectedResidentOption,
  setSelectedResidentOption,
  selectedCustomer,
  setSelectedCustomer,
  customerDiscountInfo,
  setCustomerDiscountInfo,
  reservationOptions,
  setReservationOptions,
}: CheckoutOrderSectionProps) => {
  const methods = useFormContext<OrderRequestProps>()

  /** هندلر انتخاب مشتری از لیست */
  const handleCustomerSelect = (opt: any) => {
    const customer = opt?.data || null
    setSelectedCustomer(customer)
    methods.setValue('customer_id', customer?.id || null)

    if (customer?.id) {
      methods.clearErrors('customer_id' as any)

      const discountInfo: CustomerDiscountInfo = {
        hasNextPurchaseDiscount: Boolean(customer.next_purchase_discount_code),
        nextPurchaseDiscountCode: customer.next_purchase_discount_code,
        nextPurchaseDiscountExpired: isDiscountExpired(
          customer.next_purchase_discount_expires_at
        ),
        nextPurchaseDiscountExpiresAt:
          customer.next_purchase_discount_expires_at,
        clubPoints: customer.club_points || 0,
      }
      setCustomerDiscountInfo(discountInfo)
    } else {
      setCustomerDiscountInfo(null)
    }
  }

  return (
    <>
      {/* نوع سرویس */}
      <dl className="flex flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
        <Controller
          control={methods.control}
          name="service_type"
          render={({ field }) => {
            let gg = ServiceType.dine_in
            switch (field.value) {
              case 'takeaway':
                gg = ServiceType.takeaway
                break
              case 'room_service':
                gg = ServiceType.room_service
                break
            }

            return (
              <RadioGroup
                name="service_type"
                label={ORDER_DESTINATION_LABEL}
                onChange={field.onChange}
                value={gg.toString()}
                isRequired
              >
                <Radio value={ServiceType.dine_in.toString()}>داخل سالن</Radio>
                <Radio value={ServiceType.takeaway.toString()}>بیرون بر</Radio>
                <Radio value={ServiceType.room_service.toString()}>
                  داخل اتاق
                </Radio>
              </RadioGroup>
            )
          }}
        />

        {serviceType == ServiceType.dine_in && (
          <FormInput<OrderRequestProps>
            name="desc_number"
            label={DESC_NUMBER_LABEL}
            type="number"
            isRequired
          />
        )}
      </dl>

      {/* هزینه سرویس */}
      <dl className="flex flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
        <FormRadioGroup<OrderRequestProps>
          name="rate_service"
          label={SERVICE_COST_LABEL}
          orientation="horizontal"
          classNames={{ label: cn('font-bold text-sm') }}
          isDisabled={serviceType === ServiceType.takeaway}
        >
          <Radio value="0">{HAS_NOT_LABEL}</Radio>
          <Radio value="1">{HAS_LABEL}</Radio>
        </FormRadioGroup>
      </dl>

      {/* نوع مشتری */}
      <dl className="flex flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
        <FormRadioGroup<OrderRequestProps>
          name="customer_type"
          label="نوع مشتری"
          orientation="horizontal"
          classNames={{ label: cn('font-bold text-sm') }}
        >
          <Radio value="resident">کاربر مقیم</Radio>
          <Radio
            value="guest"
            disabled={serviceType == ServiceType.room_service}
            isDisabled={serviceType == ServiceType.room_service}
          >
            کاربر مهمان
          </Radio>
        </FormRadioGroup>
      </dl>

      {/* کاربر مقیم */}
      {customerType === 'resident' && (
        <dl className="flex flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            شماره اتاق و رزرو
          </label>

          <AsyncPaginate
            inputId="room-reservation-select"
            placeholder="جستجو کنید..."
            isClearable
            defaultOptions
            loadOptionsOnMenuOpen
            debounceTimeout={350}
            clearCacheOnSearchChange
            value={
              selectedResidentOption?.value ===
              methods.getValues('reserve_number')
                ? selectedResidentOption
                : methods.getValues('reserve_number')
                  ? {
                      value: methods.getValues('reserve_number'),
                      label: `${methods.getValues('room_number')} - ${methods.getValues('reserve_number')}`,
                      data: reservationOptions.find(
                        (item) =>
                          item.Reserve === methods.getValues('reserve_number')
                      ) || {
                        Room: methods.getValues('room_number'),
                        Reserve: methods.getValues('reserve_number'),
                        GuestName: 'نامشخص',
                        company: '',
                        Company: '',
                      },
                    }
                  : null
            }
            loadOptions={async (searchQuery, _loadedOptions, additional) => {
              const page = (additional as any)?.page || 1
              const q = normalizeText(searchQuery)

              try {
                const params: any = { page }
                if (q) params.reserve_number = q

                const response = await apiRequest<any>({
                  ...USER_RESIDENT_API.getAll(),
                  params,
                })

                let items = response?.data?.items || []
                setReservationOptions(items)

                if (q) {
                  const qLower = q.toLowerCase()
                  items = items.filter((it: any) => {
                    const room = String(it.Room ?? '').toLowerCase()
                    const reserve = String(it.Reserve ?? '').toLowerCase()
                    const guest = String(it.GuestName ?? '').toLowerCase()
                    const company = String(
                      it.company ?? it.Company ?? it.CompanyName ?? ''
                    ).toLowerCase()

                    return (
                      room.includes(qLower) ||
                      reserve.includes(qLower) ||
                      guest.includes(qLower) ||
                      company.includes(qLower)
                    )
                  })
                }

                const options = items.map((item: any) => {
                  const company = getResidentCompany(item)
                  return {
                    value: item.Reserve,
                    label: `${item.Room} - ${item.Reserve}${
                      company ? ` - ${company}` : ''
                    }`,
                    data: item,
                  }
                })

                return {
                  options,
                  hasMore:
                    response?.data?.current_page < response?.data?.last_page,
                  additional: { page: page + 1 },
                }
              } catch (error) {
                console.error('Error loading options:', error)
                return { options: [], hasMore: false }
              }
            }}
            formatOptionLabel={(option: any, { context }: any) => {
              const d = option?.data || {}
              const company = getResidentCompany(d)
              const room = d?.Room || 'نامشخص'
              const guest = d?.GuestName || 'نامشخص'
              const reserve = d?.Reserve || option?.value || 'نامشخص'

              if (context === 'menu') {
                return (
                  <div className="flex flex-col">
                    <span className="font-bold">اتاق: {room}</span>
                    <span>مهمان: {guest}</span>
                    <span className="text-sm text-default-500">
                      رزرو: {reserve}
                    </span>
                    {company ? (
                      <span className="text-sm text-default-500">
                        شرکت: {company}
                      </span>
                    ) : null}
                  </div>
                )
              }

              return (
                <span>
                  {room} - {reserve}
                  {company ? ` - ${company}` : ''}
                </span>
              )
            }}
            onChange={(opt: any) => {
              if (opt) {
                methods.setValue('room_number', opt.data.Room || '')
                methods.setValue('reserve_number', opt.value || '')
                setSelectedResidentOption(opt)
              } else {
                methods.setValue('room_number', '')
                methods.setValue('reserve_number', '')
                setSelectedResidentOption(null)
              }
            }}
            onInputChange={(value) => value}
            additional={{ page: 1 }}
            loadingMessage={() => 'در حال بارگذاری...'}
            noOptionsMessage={() => 'موردی یافت نشد'}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
              option: (provided) => ({
                ...provided,
                textAlign: 'right',
                direction: 'rtl',
              }),
            }}
          />

          {methods.formState.errors.reserve_number && (
            <p className="mt-1 text-sm text-red-600">
              {methods.formState.errors.reserve_number.message as any}
            </p>
          )}
        </dl>
      )}

      {/* کاربر مهمان */}
      {customerType === 'guest' && (
        <dl className="flex flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            مشتری
          </label>

          {/* تب‌های انتخاب حالت */}
          <ButtonGroup fullWidth className="w-full">
            <Button
              fullWidth
              variant={guestMode === 'existing' ? 'solid' : 'bordered'}
              color={guestMode === 'existing' ? 'success' : 'default'}
              onPress={() => setGuestMode('existing')}
              className={cn(
                'flex-1 text-xs sm:text-sm',
                guestMode === 'existing' && 'text-white'
              )}
            >
              انتخاب از لیست
            </Button>
            <Button
              fullWidth
              variant={guestMode === 'new' ? 'solid' : 'bordered'}
              color={guestMode === 'new' ? 'success' : 'default'}
              onPress={() => setGuestMode('new')}
              className={cn(
                'flex-1 text-xs sm:text-sm',
                guestMode === 'new' && 'text-white'
              )}
            >
              کاربر جدید
            </Button>
          </ButtonGroup>

          {/* انتخاب از لیست */}
          {guestMode === 'existing' && (
            <>
              <AsyncPaginate
                inputId="customer-search"
                placeholder="جستجوی نام یا شماره..."
                isClearable
                defaultOptions
                loadOptionsOnMenuOpen
                debounceTimeout={350}
                clearCacheOnSearchChange
                value={
                  selectedCustomer
                    ? {
                        value: selectedCustomer.id,
                        label:
                          selectedCustomer.phone ||
                          selectedCustomer.name ||
                          'نامشخص',
                        data: selectedCustomer,
                      }
                    : null
                }
                loadOptions={async (
                  searchQuery,
                  _loadedOptions,
                  additional
                ) => {
                  const page = (additional as any)?.page || 1
                  const raw = normalizeText(searchQuery)
                  const isPhone = isMostlyDigits(raw)
                  const qPhone = normalizePhoneQuery(raw)
                  const qName = raw

                  try {
                    const params: any = { page }
                    if (raw) {
                      if (isPhone) params.phone = qPhone
                      else params.name = qName
                    }

                    const response = await apiRequest<any>({
                      url: CUSTOMER_API.getAll().url,
                      method: 'GET',
                      params,
                    })

                    let items = response?.data?.items || []

                    if (raw) {
                      const qLower = raw.toLowerCase()
                      items = items.filter((it: any) => {
                        const phone = String(it.phone ?? '').toLowerCase()
                        const name = String(it.name ?? '').toLowerCase()
                        return phone.includes(qLower) || name.includes(qLower)
                      })
                    }

                    const options = items.map((item: any) => ({
                      value: item.id,
                      label: `${item.name || 'نامشخص'} - ${item.phone || '---'}`,
                      data: item,
                    }))

                    return {
                      options,
                      hasMore:
                        response?.data?.current_page <
                        response?.data?.last_page,
                      additional: { page: page + 1 },
                    }
                  } catch (error) {
                    console.error('Error loading customers:', error)
                    return { options: [], hasMore: false }
                  }
                }}
                formatOptionLabel={(option, { context }) => {
                  const data = (option as any).data
                  const hasNextDiscount = Boolean(
                    data?.next_purchase_discount_code
                  )
                  const discountExpired = isDiscountExpired(
                    data?.next_purchase_discount_expires_at
                  )

                  return (
                    <div className="flex flex-col">
                      {context === 'menu' && data ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {data.name || 'نامشخص'}
                            </span>
                            {hasNextDiscount && (
                              <Chip
                                size="sm"
                                color={discountExpired ? 'danger' : 'success'}
                                variant="flat"
                              >
                                {discountExpired
                                  ? 'تخفیف منقضی شده'
                                  : 'دارای تخفیف'}
                              </Chip>
                            )}
                          </div>
                          <span className="text-sm text-default-500">
                            تلفن: {data.phone || '---'}
                          </span>
                          {hasNextDiscount && (
                            <span
                              className={cn(
                                'text-xs',
                                discountExpired ? 'text-danger' : 'text-success'
                              )}
                            >
                              کد تخفیف: {data.next_purchase_discount_code}
                              {discountExpired && ' (منقضی شده)'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{(option as any).label}</span>
                      )}
                    </div>
                  )
                }}
                onChange={handleCustomerSelect}
                onInputChange={(value) => value}
                additional={{ page: 1 }}
                loadingMessage={() => 'در حال بارگذاری...'}
                noOptionsMessage={() => 'موردی یافت نشد'}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                  option: (provided) => ({
                    ...provided,
                    textAlign: 'right',
                    direction: 'rtl',
                  }),
                }}
              />

              {methods.formState.errors.customer_id && (
                <p className="mt-1 text-sm text-red-600">
                  {methods.formState.errors.customer_id.message as any}
                </p>
              )}

              {/* نمایش اطلاعات تخفیف مشتری انتخاب‌شده */}
              {customerDiscountInfo && (
                <div
                  className={cn(
                    'mt-2 rounded-lg border-2 p-3',
                    customerDiscountInfo.nextPurchaseDiscountExpired
                      ? 'border-danger-200 bg-danger-50'
                      : 'border-success-200 bg-success-50'
                  )}
                >
                  <p className="text-sm font-semibold">اطلاعات تخفیف مشتری:</p>

                  {customerDiscountInfo.hasNextPurchaseDiscount && (
                    <div className="mt-1">
                      <span
                        className={cn(
                          'text-sm',
                          customerDiscountInfo.nextPurchaseDiscountExpired
                            ? 'text-danger-700'
                            : 'text-success-700'
                        )}
                      >
                        کد تخفیف خرید بعدی:{' '}
                        <strong>
                          {customerDiscountInfo.nextPurchaseDiscountCode}
                        </strong>
                      </span>
                      {customerDiscountInfo.nextPurchaseDiscountExpired && (
                        <Chip
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="mr-2"
                        >
                          منقضی شده
                        </Chip>
                      )}
                      {customerDiscountInfo.nextPurchaseDiscountExpiresAt &&
                        !customerDiscountInfo.nextPurchaseDiscountExpired && (
                          <p className="mt-1 text-xs text-default-500">
                            معتبر تا:{' '}
                            {new Date(
                              customerDiscountInfo.nextPurchaseDiscountExpiresAt
                            ).toLocaleDateString('fa-IR')}
                          </p>
                        )}
                    </div>
                  )}

                  {customerDiscountInfo.clubPoints > 0 && (
                    <p className="mt-1 text-sm text-default-700">
                      امتیاز باشگاه:{' '}
                      <strong>
                        {customerDiscountInfo.clubPoints.toLocaleString(
                          'fa-IR'
                        )}
                      </strong>{' '}
                      امتیاز
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* کاربر جدید */}
          {guestMode === 'new' && (
            <div className="flex flex-col gap-3">
              <Controller
                control={methods.control}
                name={'customer_name' as any}
                rules={{ required: 'نام مشتری الزامی است.' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="نام مشتری"
                    placeholder="نام مشتری را وارد کنید"
                    isRequired
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    variant="bordered"
                    size="sm"
                  />
                )}
              />

              <Controller
                control={methods.control}
                name={'customer_mobile' as any}
                rules={{
                  required: 'شماره موبایل الزامی است.',
                  pattern: {
                    value: /^09[0-9]{9}$/,
                    message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد.',
                  },
                }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="شماره موبایل"
                    placeholder="09xxxxxxxxx"
                    isRequired
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    variant="bordered"
                    size="sm"
                    type="tel"
                    maxLength={11}
                  />
                )}
              />
            </div>
          )}
        </dl>
      )}
    </>
  )
}

export default CheckoutOrderSection
