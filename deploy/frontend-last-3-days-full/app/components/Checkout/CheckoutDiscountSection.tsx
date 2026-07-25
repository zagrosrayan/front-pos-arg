/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { DISCOUNT } from '@/app/constant/label'
import { apiRequest } from '@/lib/axios'
import { DISCOUNT_API } from '@/routes/api/discount'
import { CalculateItems } from '@/types/apiTypes'
import { DiscountType, OrderRequestProps } from '@/types/orderType'
import {
  cn,
  Select as NextSelect,
  SelectItem,
  Switch,
  RadioGroup,
  Radio,
  Input,
  Chip,
} from '@heroui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { AsyncPaginate } from 'react-select-async-paginate'
import SwitchField from '../ui/SwitchField'

/* ═══════════════════════════════════════════════════════════════
   تایپ‌ها
   ═══════════════════════════════════════════════════════════════ */

/** اطلاعات تخفیف مشتری */
interface CustomerDiscountInfo {
  hasNextPurchaseDiscount: boolean
  nextPurchaseDiscountCode?: string
  nextPurchaseDiscountExpired: boolean
  nextPurchaseDiscountExpiresAt?: string
  clubPoints: number
}

interface CheckoutDiscountSectionProps {
  hasDiscount: boolean
  setHasDiscount: (value: boolean) => void
  selectedOption: any
  setSelectedOption: (value: any) => void
  discountType: string | undefined
  calculatedData?: {
    items: CalculateItems
  }
  expiredDiscountMessage?: string
  /** اطلاعات تخفیف مشتری انتخاب‌شده */
  customerDiscountInfo?: CustomerDiscountInfo | null
  /** آیا در حالت ویرایش سفارش هستیم */
  isUpdating?: boolean
}

const EXPIRED_TOKEN = '|expired'
const EXPIRED_UI_MESSAGE = 'کد تخفیف منقضی شده است'

const isExpiredTagged = (msg?: unknown) => {
  if (!msg) return false
  return String(msg).includes(EXPIRED_TOKEN)
}

const CheckoutDiscountSection = ({
  hasDiscount,
  setHasDiscount,
  selectedOption,
  setSelectedOption,
  discountType,
  calculatedData,
  expiredDiscountMessage = '',
  customerDiscountInfo = null,
  isUpdating = false,
}: CheckoutDiscountSectionProps) => {
  const methods = useFormContext<OrderRequestProps>()
  const [expiredWarning, setExpiredWarning] = useState<string>('')

  // برای اینکه useEffect روی تغییرات errors درست trigger شود
  const errorsHash = useMemo(() => {
    try {
      return JSON.stringify(methods.formState.errors ?? {})
    } catch {
      return String(Date.now())
    }
  }, [methods.formState.errors])

  useEffect(() => {
    if (!hasDiscount) {
      setExpiredWarning('')
      return
    }
    if (isExpiredTagged(expiredDiscountMessage)) {
      setExpiredWarning(EXPIRED_UI_MESSAGE)
      return
    }

    // بررسی انقضای تخفیف خرید بعدی مشتری
    if (
      discountType === '4' &&
      customerDiscountInfo?.nextPurchaseDiscountExpired
    ) {
      setExpiredWarning(EXPIRED_UI_MESSAGE)
      return
    }

    const err: any = methods.formState.errors as any

    const expiredFields: any[] = []
    const fieldsToCheck: any[] = [
      'selected_discount_type',
      'discount_normal_code',
      'discount_global_code',
      'discount_value',
      'use_next_purchase_discount',
      'use_club_points',
    ]

    for (const f of fieldsToCheck) {
      const m = err?.[f]?.message
      if (isExpiredTagged(m)) expiredFields.push(f)
    }

    if (expiredFields.length > 0) {
      setExpiredWarning(EXPIRED_UI_MESSAGE)
      methods.clearErrors(expiredFields as any)
      return
    }

    setExpiredWarning('')
  }, [
    errorsHash,
    expiredDiscountMessage,
    hasDiscount,
    methods,
    discountType,
    customerDiscountInfo,
  ])

  return (
    <div className="mx-2">
      <Switch
        isSelected={hasDiscount}
        onValueChange={(e) => {
          setHasDiscount(e)

          if (!e) {
            methods.setValue('selected_discount_type', '' as any)
            methods.setValue('discount_normal_code', null as any)
            methods.setValue('discount_global_code', null as any)
            methods.setValue('discount_value', 0 as any)
            methods.setValue('use_club_points', null as any)
            methods.setValue('use_next_purchase_discount', false as any)
            setSelectedOption(null)
            setExpiredWarning('')
            methods.clearErrors([
              'selected_discount_type',
              'discount_normal_code',
              'discount_global_code',
              'discount_value',
              'use_club_points',
              'use_next_purchase_discount',
            ] as any)
          }
        }}
        classNames={{
          base: cn('flex-row-reverse'),
          label: cn('me-2 ms-0'),
          wrapper: 'ml-8',
        }}
      >
        تخفیف
      </Switch>

      {/* هشدار منقضی با استایل قرمز */}
      {hasDiscount && expiredWarning ? (
        <div className="mx-2 mt-2 rounded-lg border-2 border-danger-300 bg-danger-50 p-2">
          <p className="text-sm font-semibold text-danger-700">
            ⚠️ {expiredWarning}
          </p>
        </div>
      ) : null}

      {hasDiscount && (
        <Controller
          name="selected_discount_type"
          control={methods.control}
          defaultValue={undefined}
          render={({ field }) => (
            <NextSelect
              label="نوع تخفیف"
              placeholder="انتخاب کنید"
              selectedKeys={field.value ? new Set([field.value]) : undefined}
              className="mt-3 w-full max-w-xs"
              onChange={(val) => {
                const nextType = val.target.value as string
                const customerType = methods.getValues('customer_type')
                const customerId = methods.getValues('customer_id')

                // فقط برای تخفیف خرید بعدی و امتیاز باشگاه نیاز به مشتری است
                if (
                  (nextType === '4' || nextType === '5') &&
                  (customerType !== 'guest' || !customerId)
                ) {
                  methods.setValue('selected_discount_type', '' as any)
                  setSelectedOption(null)
                  methods.setValue('discount_normal_code', null as any)
                  methods.setValue('discount_global_code', null as any)
                  methods.setValue('discount_value', 0 as any)
                  methods.setValue('use_club_points', null as any)
                  methods.setValue('use_next_purchase_discount', false as any)

                  methods.setError('customer_id' as any, {
                    type: 'manual',
                    message:
                      'برای استفاده از تخفیف خرید بعدی یا امتیاز باشگاه، انتخاب مشتری مهمان الزامی است.',
                  })

                  return
                }

                // بررسی انقضای تخفیف خرید بعدی
                if (
                  nextType === '4' &&
                  customerDiscountInfo?.nextPurchaseDiscountExpired
                ) {
                  setExpiredWarning(EXPIRED_UI_MESSAGE)
                }

                field.onChange(nextType)
                setSelectedOption(null)

                // فقط اگر تخفیف منقضی نشده، هشدار رو پاک کن
                if (
                  !(
                    nextType === '4' &&
                    customerDiscountInfo?.nextPurchaseDiscountExpired
                  )
                ) {
                  setExpiredWarning('')
                }

                methods.setValue('discount_normal_code', null as any)
                methods.setValue('discount_global_code', null as any)
                methods.setValue('discount_value', 0 as any)
                methods.setValue('use_club_points', null as any)
                methods.setValue('use_next_purchase_discount', nextType === '4')

                methods.clearErrors([
                  'discount_normal_code',
                  'discount_global_code',
                  'discount_value',
                  'use_club_points',
                  'use_next_purchase_discount',
                  'customer_id',
                ] as any)
              }}
              variant="bordered"
            >
              <SelectItem key="1" value="1">
                تخفیف ساده
              </SelectItem>
              <SelectItem key="2" value="2">
                دستی
              </SelectItem>
              <SelectItem key="3" value="3">
                تخفیف همگانی
              </SelectItem>
              <SelectItem key="4" value="4">
                تخفیف خرید بعدی
              </SelectItem>
              <SelectItem key="5" value="5">
                امتیاز باشگاه مشتریان
              </SelectItem>
            </NextSelect>
          )}
        />
      )}

      <div className="flex flex-col p-2">
        {/* تخفیف ساده */}
        {discountType === '1' && (
          <div className="m-2">
            <label
              htmlFor="discount_normal_code"
              className="block text-sm font-medium text-gray-700"
            >
              کد تخفیف ساده <span className="text-red-500">*</span>
            </label>

            <AsyncPaginate
              inputId="discount_normal_code"
              name="discount_normal_code"
              placeholder="انتخاب کنید"
              isClearable
              debounceTimeout={350}
              clearCacheOnSearchChange
              value={
                selectedOption
                  ? {
                      value: selectedOption.value,
                      label: selectedOption.label,
                      data: selectedOption.data,
                    }
                  : null
              }
              loadOptions={async (searchQuery, _loaded, additional: any) => {
                const page = additional?.page || 1
                const q = String(searchQuery ?? '').trim()
                try {
                  const response = await apiRequest<any>({
                    ...DISCOUNT_API.getValid(),
                    params: {
                      page,
                      scope: 'normal',
                      search: q || '',
                    },
                  })

                  let items = response?.data?.items || []

                  if (q) {
                    const qLower = q.toLowerCase()
                    items = items.filter((it: any) => {
                      const code = String(it.code ?? '').toLowerCase()
                      const name = String(it.name ?? '').toLowerCase()
                      return code.includes(qLower) || name.includes(qLower)
                    })
                  }

                  const validDiscounts = items.filter(
                    (item: any) => item.code !== null
                  )

                  const options = validDiscounts.map((item: any) => ({
                    value: item.code,
                    label: item.name,
                    data: item,
                  }))

                  return {
                    options,
                    hasMore:
                      response?.data?.current_page < response?.data?.last_page,
                    additional: { page: page + 1 },
                  }
                } catch (error) {
                  console.error('Error loading discount options:', error)
                  return { options: [], hasMore: false }
                }
              }}
              formatOptionLabel={(option: any, { context }: any) => (
                <div className="flex flex-col">
                  {context === 'menu' && option.data ? (
                    <>
                      <span className="font-bold">{option.label}</span>
                      <span className="text-sm text-default-500">
                        کد: {option.data.code}
                      </span>
                    </>
                  ) : (
                    <span>{option.label}</span>
                  )}
                </div>
              )}
              onChange={(newOption) => {
                methods.setValue(
                  'discount_normal_code',
                  (newOption as any)?.value || null
                )
                setSelectedOption(newOption)
                setExpiredWarning('')
                methods.clearErrors('discount_normal_code' as any)
              }}
              onInputChange={(value) => value}
              additional={{ page: 1 }}
              loadingMessage={() => 'در حال بارگذاری...'}
              noOptionsMessage={() => 'موردی یافت نشد'}
              className="react-select-container mt-1"
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

            {methods.formState.errors.discount_normal_code &&
              !isExpiredTagged(
                methods.formState.errors.discount_normal_code.message
              ) && (
                <p className="mt-1 text-sm text-red-600">
                  {methods.formState.errors.discount_normal_code.message as any}
                </p>
              )}
          </div>
        )}

        {/* تخفیف دستی */}
        {discountType === '2' && (
          <div className="flex flex-col p-2">
            <Controller
              control={methods.control}
              name="discount_type"
              render={({ field }) => (
                <RadioGroup
                  name="discount_type"
                  orientation="horizontal"
                  defaultValue={DiscountType.percentage}
                  value={field.value}
                  onChange={(val) => field.onChange(val.target.value)}
                  classNames={{ base: cn('flex flex-col m-2') }}
                >
                  <Radio value={DiscountType.fixed}>مبلغ ثابت</Radio>
                  <Radio value={DiscountType.percentage}>درصد</Radio>
                </RadioGroup>
              )}
            />

            <Controller
              control={methods.control}
              name="discount_value"
              rules={{
                required: 'مقدار تخفیف الزامی است',
                min: { value: 0, message: 'مقدار باید بیشتر از 0 باشد' },
              }}
              render={({ field, fieldState }) => (
                <div className="m-2">
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    label={DISCOUNT}
                    placeholder="مقدار تخفیف را وارد کنید"
                    variant="bordered"
                    isRequired
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => {
                      const cleaned = value.replace(/[^0-9]/g, '')
                      const numValue =
                        cleaned === '' ? 0 : parseInt(cleaned, 10)
                      field.onChange(numValue)
                    }}
                    onFocus={(e) => {
                      if (field.value === 0) {
                        e.target.select()
                      }
                    }}
                  />
                </div>
              )}
            />
          </div>
        )}

        {/* تخفیف همگانی */}
        {discountType === '3' && (
          <div className="m-2">
            <label
              htmlFor="discount_global_code"
              className="block text-sm font-medium text-gray-700"
            >
              کد تخفیف همگانی <span className="text-red-500">*</span>
            </label>

            <AsyncPaginate
              inputId="discount_global_code"
              name="discount_global_code"
              placeholder="انتخاب کنید"
              isClearable
              debounceTimeout={350}
              clearCacheOnSearchChange
              value={
                selectedOption
                  ? {
                      value: selectedOption.value,
                      label: selectedOption.label,
                      data: selectedOption.data,
                    }
                  : null
              }
              loadOptions={async (searchQuery, _loaded, additional: any) => {
                const page = additional?.page || 1
                const q = String(searchQuery ?? '').trim()
                try {
                  const response = await apiRequest<any>({
                    ...DISCOUNT_API.getValid(),
                    params: {
                      page,
                      scope: 'global',
                      search: q || '',
                    },
                  })

                  let items = response?.data?.items || []

                  if (q) {
                    const qLower = q.toLowerCase()
                    items = items.filter((it: any) => {
                      const code = String(it.code ?? '').toLowerCase()
                      const name = String(it.name ?? '').toLowerCase()
                      return code.includes(qLower) || name.includes(qLower)
                    })
                  }

                  const validDiscounts = items.filter(
                    (item: any) => item.code !== null
                  )

                  const options = validDiscounts.map((item: any) => ({
                    value: item.code,
                    label: item.name,
                    data: item,
                  }))

                  return {
                    options,
                    hasMore:
                      response?.data?.current_page < response?.data?.last_page,
                    additional: { page: page + 1 },
                  }
                } catch (error) {
                  console.error('Error loading global discounts:', error)
                  return { options: [], hasMore: false }
                }
              }}
              formatOptionLabel={(option: any, { context }: any) => (
                <div className="flex flex-col">
                  {context === 'menu' && option.data ? (
                    <>
                      <span className="font-bold">{option.label}</span>
                      <span className="text-sm text-default-500">
                        کد: {option.data.code}
                      </span>
                    </>
                  ) : (
                    <span>{option.label}</span>
                  )}
                </div>
              )}
              onChange={(newOption) => {
                methods.setValue(
                  'discount_global_code',
                  (newOption as any)?.value || null
                )
                setSelectedOption(newOption)
                setExpiredWarning('')
                methods.clearErrors('discount_global_code' as any)
              }}
              onInputChange={(value) => value}
              additional={{ page: 1 }}
              loadingMessage={() => 'در حال بارگذاری...'}
              noOptionsMessage={() => 'موردی یافت نشد'}
              className="react-select-container mt-1"
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

            {methods.formState.errors.discount_global_code &&
              !isExpiredTagged(
                methods.formState.errors.discount_global_code.message
              ) && (
                <p className="mt-1 text-sm text-red-600">
                  {methods.formState.errors.discount_global_code.message as any}
                </p>
              )}
          </div>
        )}

        {/* تخفیف خرید بعدی */}
        {discountType === '4' && (
          <div className="m-2">
            {/* نمایش وضعیت تخفیف خرید بعدی مشتری */}
            {customerDiscountInfo && (
              <div
                className={cn(
                  'mb-3 rounded-lg border-2 p-3',
                  customerDiscountInfo.nextPurchaseDiscountExpired
                    ? 'border-danger-200 bg-danger-50'
                    : 'border-success-200 bg-success-50'
                )}
              >
                {customerDiscountInfo.hasNextPurchaseDiscount ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        کد تخفیف خرید بعدی:
                      </span>
                      <span
                        className={cn(
                          'font-bold',
                          customerDiscountInfo.nextPurchaseDiscountExpired
                            ? 'text-danger-700'
                            : 'text-success-700'
                        )}
                      >
                        {customerDiscountInfo.nextPurchaseDiscountCode}
                      </span>
                      {customerDiscountInfo.nextPurchaseDiscountExpired && (
                        <Chip size="sm" color="danger" variant="flat">
                          منقضی شده
                        </Chip>
                      )}
                    </div>
                    {customerDiscountInfo.nextPurchaseDiscountExpiresAt &&
                      !customerDiscountInfo.nextPurchaseDiscountExpired && (
                        <p className="mt-1 text-xs text-default-500">
                          معتبر تا:{' '}
                          {new Date(
                            customerDiscountInfo.nextPurchaseDiscountExpiresAt
                          ).toLocaleDateString('fa-IR')}
                        </p>
                      )}
                  </>
                ) : (
                  <p className="text-sm text-default-600">
                    این مشتری تخفیف خرید بعدی ندارد.
                  </p>
                )}
              </div>
            )}

            {/* هشدار اگر تخفیف منقضی شده */}
            {customerDiscountInfo?.nextPurchaseDiscountExpired && (
              <div className="mb-3 rounded-lg border-2 border-danger-300 bg-danger-50 p-2">
                <p className="text-sm font-semibold text-danger-700">
                  ⚠️ کد تخفیف خرید بعدی این مشتری منقضی شده است و قابل استفاده
                  نیست.
                </p>
              </div>
            )}

            <SwitchField
              name="use_next_purchase_discount"
              label="استفاده از تخفیف خرید بعدی"
              deactivateLabel="برای اعمال تخفیف خرید بعدی فعال کنید"
              activeLabel="فعال"
              isDisabled={
                customerDiscountInfo?.nextPurchaseDiscountExpired ||
                !customerDiscountInfo?.hasNextPurchaseDiscount
              }
            />
          </div>
        )}

        {/* امتیاز باشگاه */}
        {discountType === '5' && (
          <>
            {/* نمایش امتیاز باشگاه مشتری */}
            {customerDiscountInfo && (
              <div className="m-2 mb-3 rounded-lg border-2 border-default-200 bg-default-50 p-3">
                <p className="text-sm">
                  امتیاز باشگاه مشتری:{' '}
                  <strong className="text-primary">
                    {customerDiscountInfo.clubPoints.toLocaleString('fa-IR')}
                  </strong>{' '}
                  امتیاز
                </p>
              </div>
            )}

            <SwitchField
              name="use_club_points"
              label="استفاده از امتیاز"
              activeLabel={
                String(
                  Number(
                    calculatedData?.items.club_points_remaining
                  ).toLocaleString('fa-IR') ?? 0
                ) + ' امتیاز'
              }
              deactivateLabel="برای مشاهده و اعمال امتیاز لطفا فعال کنید"
              isDisabled={
                !customerDiscountInfo || customerDiscountInfo.clubPoints <= 0
              }
            />

            {calculatedData?.items.club_points_used ? (
              <div className="mt-5 text-sm text-default-500">
                امتیاز های استفاده شده :{' '}
                {Number(calculatedData?.items.club_points_used).toLocaleString(
                  'fa-IR'
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default CheckoutDiscountSection
