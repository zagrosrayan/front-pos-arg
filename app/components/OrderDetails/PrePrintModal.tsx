/* eslint-disable */

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  cn,
  Chip,
} from '@heroui/react'
import FormLayout from '@/app/layout/FormLayout'
import {
  CANCEL_LABEL,
  RESIDENT_CUSTOMER,
  NAME_LABEL,
  PHONE_LABEL,
  GUEST_CUSTOMER,
  CEREMONIES_CUSTOMER,
  CREDIT_CUSTOMER,
  EMPLOYEE_CUSTOMER,
} from '@/app/constant/label'
import FormInput from '@/app/components/ui/FormInput'
import { AsyncPaginate } from 'react-select-async-paginate'
import { CUSTOMER_API } from '@/routes/api/customer'
import { apiRequest } from '@/lib/axios'
import ResidentSelectionSection from './ResidentSelectionSection'
import { UseFormReturn } from 'react-hook-form'
import { OrderRequestProps } from '@/types/orderType'
import CheckoutDiscountSection from '@/app/components/Checkout/CheckoutDiscountSection'

/* ═══════════════════════════════════════════════════════════════
   تایپ‌ها
   ═══════════════════════════════════════════════════════════════ */

interface DiscountDisplayInfo {
  typeLabel: string
  code: string | null
  isExpired: boolean
  expiresAt: string | null
  amount: number
  percentage: number | null
}

interface PrePrintModalProps {
  isOpen: boolean
  onOpenChange: () => void
  methods: UseFormReturn<OrderRequestProps>
  onSubmit: (data: OrderRequestProps) => void
  tabSelected: string
  handleTabChange: (key: string) => void
  residentSelectProps: any
  customerType: string
  setCustomerType: (type: string) => void
  selectedCustomer: any
  setSelectedCustomer: (customer: any) => void
  discountDisplayInfo?: DiscountDisplayInfo
}

type SelectOption = { value: any; label: string; data?: any } | null

const EXPIRED_TOKEN = '|expired'
const EXPIRED_UI_MESSAGE = 'این تخفیف منقضی شده است.'

const hasExpiredTag = (msg?: unknown) => {
  if (!msg) return false
  return String(msg).includes(EXPIRED_TOKEN)
}

/** بررسی انقضای تخفیف */
const isDiscountExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const PrePrintModal = ({
  isOpen,
  onOpenChange,
  methods,
  onSubmit,
  tabSelected,
  handleTabChange,
  residentSelectProps,
  customerType,
  setCustomerType,
  selectedCustomer,
  setSelectedCustomer,
  discountDisplayInfo,
}: PrePrintModalProps) => {
  const [hasDiscount, setHasDiscount] = useState(false)
  const [selectedDiscountOption, setSelectedDiscountOption] =
    useState<any>(null)
  const [expiredDiscountMessage, setExpiredDiscountMessage] =
    useState<string>('')

  const selectedDiscountType = methods.watch('selected_discount_type') as any
  const discountNormalCode = methods.watch('discount_normal_code') as any
  const discountGlobalCode = methods.watch('discount_global_code') as any
  const discountValue = methods.watch('discount_value') as any
  const useClubPoints = methods.watch('use_club_points') as any
  const useNextPurchaseDiscount = methods.watch(
    'use_next_purchase_discount'
  ) as any

  const computedHasDiscount = useMemo(() => {
    return (
      Boolean(String(selectedDiscountType ?? '').trim()) ||
      Boolean(discountNormalCode) ||
      Boolean(discountGlobalCode) ||
      Boolean(Number(discountValue ?? 0) > 0) ||
      Boolean(useClubPoints) ||
      Boolean(useNextPurchaseDiscount)
    )
  }, [
    selectedDiscountType,
    discountNormalCode,
    discountGlobalCode,
    discountValue,
    useClubPoints,
    useNextPurchaseDiscount,
  ])

  useEffect(() => {
    if (!isOpen) return
    setHasDiscount(computedHasDiscount)

    if (discountDisplayInfo?.isExpired) {
      setExpiredDiscountMessage(EXPIRED_UI_MESSAGE)
    }
  }, [isOpen, computedHasDiscount, discountDisplayInfo])

  useEffect(() => {
    if (computedHasDiscount) setHasDiscount(true)
  }, [computedHasDiscount])

  useEffect(() => {
    if (!isOpen) return

    const t = String(selectedDiscountType ?? '').trim()
    if (t === '1' && discountNormalCode) {
      setSelectedDiscountOption({
        value: discountNormalCode,
        label: String(discountNormalCode),
        data: { code: discountNormalCode },
      })
      return
    }

    if (t === '3' && discountGlobalCode) {
      setSelectedDiscountOption({
        value: discountGlobalCode,
        label: String(discountGlobalCode),
        data: { code: discountGlobalCode },
      })
      return
    }

    setSelectedDiscountOption(null)
  }, [isOpen, selectedDiscountType, discountNormalCode, discountGlobalCode])

  const errorsHash = useMemo(() => {
    try {
      return JSON.stringify(methods.formState.errors ?? {})
    } catch {
      return String(Date.now())
    }
  }, [methods.formState.errors])

  useEffect(() => {
    if (!isOpen) return
    if (!hasDiscount) {
      if (!discountDisplayInfo?.isExpired) {
        setExpiredDiscountMessage('')
      }
      return
    }

    const err: any = methods.formState.errors as any
    const candidates: Array<[string, any]> = [
      ['selected_discount_type', err?.selected_discount_type?.message],
      ['discount_normal_code', err?.discount_normal_code?.message],
      ['discount_global_code', err?.discount_global_code?.message],
      ['discount_value', err?.discount_value?.message],
      ['use_next_purchase_discount', err?.use_next_purchase_discount?.message],
      ['use_club_points', err?.use_club_points?.message],
    ]

    const expiredFields = candidates
      .filter(([, m]) => hasExpiredTag(m))
      .map(([f]) => f)

    if (expiredFields.length > 0) {
      setExpiredDiscountMessage(EXPIRED_UI_MESSAGE)
      methods.clearErrors(expiredFields as any)
      return
    }

    if (!discountDisplayInfo?.isExpired) {
      setExpiredDiscountMessage('')
    }
  }, [errorsHash, isOpen, hasDiscount, discountDisplayInfo, methods])

  const discountType = String(selectedDiscountType ?? '').trim() || undefined

  const buildCustomerSelectValue = (mode: 'name' | 'phone'): SelectOption => {
    if (!selectedCustomer) return null
    return {
      value: selectedCustomer.id,
      label:
        mode === 'name'
          ? selectedCustomer.name || 'نامشخص'
          : selectedCustomer.phone || 'نامشخص',
      data: selectedCustomer,
    }
  }

  /** فرمت نمایش مشتری با اطلاعات تخفیف */
  const formatCustomerOption = (option: any, mode: 'name' | 'phone') => {
    const data = option?.data
    if (!data) return <span>{option?.label || 'نامشخص'}</span>

    const hasNextDiscount = Boolean(data.next_purchase_discount_code)
    const discountExpired = isDiscountExpired(
      data.next_purchase_discount_expires_at
    )

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold">{option.label}</span>
          {hasNextDiscount && (
            <Chip
              size="sm"
              color={discountExpired ? 'danger' : 'success'}
              variant="flat"
            >
              {discountExpired ? 'تخفیف منقضی' : 'دارای تخفیف'}
            </Chip>
          )}
        </div>
        <span className="text-sm text-default-500">
          {mode === 'name'
            ? `تلفن: ${data.phone || 'نامشخص'}`
            : `نام: ${data.name || 'نامشخص'}`}
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
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      scrollBehavior="inside"
      classNames={{ base: cn('overflow-y-auto') }}
    >
      <ModalContent className="min-h-[450px]">
        {(onClose) => (
          <FormLayout methods={methods} onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              تأیید اطلاعات قبل از پرینت
            </ModalHeader>

            <ModalBody className="min-h-[450px] w-full">
              {/* هشدار تخفیف منقضی شده */}
              {discountDisplayInfo?.isExpired && (
                <div className="mb-4 rounded-lg border-2 border-danger-300 bg-danger-50 p-3">
                  <p className="text-sm font-semibold text-danger-700">
                    ⚠️ کد تخفیف "
                    {discountDisplayInfo.code || discountDisplayInfo.typeLabel}"
                    منقضی شده است و در فاکتور اعمال نخواهد شد.
                  </p>
                </div>
              )}

              {/* نمایش اطلاعات تخفیف فعلی */}
              {discountDisplayInfo &&
                discountDisplayInfo.typeLabel !== 'بدون تخفیف' && (
                  <div
                    className={cn(
                      'mb-4 rounded-lg border-2 p-3',
                      discountDisplayInfo.isExpired
                        ? 'border-danger-200 bg-danger-50'
                        : 'border-success-200 bg-success-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        تخفیف اعمال شده:
                      </span>
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={
                            discountDisplayInfo.isExpired ? 'danger' : 'success'
                          }
                          variant="flat"
                        >
                          {discountDisplayInfo.typeLabel}
                        </Chip>
                        {discountDisplayInfo.code && (
                          <span
                            className={cn(
                              'text-sm',
                              discountDisplayInfo.isExpired
                                ? 'text-danger-700 line-through'
                                : 'text-success-700'
                            )}
                          >
                            کد: {discountDisplayInfo.code}
                          </span>
                        )}
                      </div>
                    </div>
                    {discountDisplayInfo.amount > 0 && (
                      <p
                        className={cn(
                          'mt-1 text-sm',
                          discountDisplayInfo.isExpired
                            ? 'text-danger-600 line-through'
                            : 'text-success-600'
                        )}
                      >
                        مبلغ تخفیف:{' '}
                        {discountDisplayInfo.amount.toLocaleString('fa-IR')}{' '}
                        ریال
                      </p>
                    )}
                  </div>
                )}

              <Tabs
                aria-label="Tabs"
                variant="underlined"
                color="success"
                selectedKey={tabSelected}
                onSelectionChange={(key) => handleTabChange(String(key))}
              >
                <Tab
                  key="resident"
                  title={RESIDENT_CUSTOMER}
                  className="flex flex-col gap-y-3"
                >
                  <ResidentSelectionSection {...residentSelectProps} />
                </Tab>

                <Tab
                  key="guest"
                  title={GUEST_CUSTOMER}
                  className="flex flex-col gap-y-3"
                >
                  <Tabs
                    aria-label="tabs"
                    selectedKey={customerType}
                    onSelectionChange={(key) => {
                      if (key == null) return
                      const next = key.toString()
                      setCustomerType(next)
                      methods.setValue('customer_type', 'guest' as any)
                      if (next === 'new') {
                        setSelectedCustomer(null)
                        methods.setValue('customer_id', null as any)
                      } else {
                        methods.setValue(
                          'customer_id',
                          selectedCustomer?.id ?? null,
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          } as any
                        )
                      }
                    }}
                    className="mb-4"
                  >
                    <Tab key="existing" title="مشتری موجود" />
                    <Tab key="new" title="مشتری جدید" />
                  </Tabs>

                  {customerType === 'existing' ? (
                    <>
                      <AsyncPaginate
                        inputId="customer-name-search"
                        placeholder="جستجو نام مشتری..."
                        value={buildCustomerSelectValue('name')}
                        loadOptions={async (
                          searchQuery,
                          _loadedOptions,
                          additional: any
                        ) => {
                          const page = additional?.page || 1
                          try {
                            const response = await apiRequest<any>({
                              url: CUSTOMER_API.getAll().url,
                              method: 'GET',
                              params: { name: searchQuery, page },
                            })
                            const options = (response?.data?.items || []).map(
                              (item: any) => ({
                                value: item.id,
                                label: item.name || 'نامشخص',
                                data: item,
                              })
                            )
                            return {
                              options,
                              hasMore:
                                response?.data?.current_page <
                                response?.data?.last_page,
                              additional: { page: page + 1 },
                            }
                          } catch (error) {
                            console.error(
                              'Error loading customers by name:',
                              error
                            )
                            return { options: [], hasMore: false }
                          }
                        }}
                        onChange={(opt: any) => {
                          const data = opt?.data || null
                          setSelectedCustomer(data)
                          methods.setValue('customer_type', 'guest' as any)
                          methods.setValue('customer_id', data?.id ?? null, {
                            shouldDirty: true,
                            shouldValidate: true,
                          } as any)
                        }}
                        onInputChange={(value) => value}
                        additional={{ page: 1 }}
                        loadingMessage={() => 'در حال بارگذاری...'}
                        noOptionsMessage={() => 'موردی یافت نشد'}
                        formatOptionLabel={(option: any) =>
                          formatCustomerOption(option, 'name')
                        }
                        className="react-select-container mb-4"
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

                      <AsyncPaginate
                        inputId="customer-phone-search"
                        placeholder="جستجو تلفن مشتری..."
                        value={buildCustomerSelectValue('phone')}
                        loadOptions={async (
                          searchQuery,
                          _loadedOptions,
                          additional: any
                        ) => {
                          const page = additional?.page || 1
                          try {
                            const response = await apiRequest<any>({
                              url: CUSTOMER_API.getAll().url,
                              method: 'GET',
                              params: { phone: searchQuery, page },
                            })
                            const options = (response?.data?.items || []).map(
                              (item: any) => ({
                                value: item.id,
                                label: item.phone || 'نامشخص',
                                data: item,
                              })
                            )
                            return {
                              options,
                              hasMore:
                                response?.data?.current_page <
                                response?.data?.last_page,
                              additional: { page: page + 1 },
                            }
                          } catch (error) {
                            console.error(
                              'Error loading customers by phone:',
                              error
                            )
                            return { options: [], hasMore: false }
                          }
                        }}
                        onChange={(opt: any) => {
                          const data = opt?.data || null
                          setSelectedCustomer(data)
                          methods.setValue('customer_type', 'guest' as any)
                          methods.setValue('customer_id', data?.id ?? null, {
                            shouldDirty: true,
                            shouldValidate: true,
                          } as any)
                        }}
                        onInputChange={(value) => value}
                        additional={{ page: 1 }}
                        loadingMessage={() => 'در حال بارگذاری...'}
                        noOptionsMessage={() => 'موردی یافت نشد'}
                        formatOptionLabel={(option: any) =>
                          formatCustomerOption(option, 'phone')
                        }
                        className="react-select-container mb-4"
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
                    </>
                  ) : (
                    <div className="flex flex-col gap-y-3">
                      <FormInput<OrderRequestProps>
                        name="name"
                        label={NAME_LABEL}
                        rules={{ required: 'نام مشتری الزامی است' }}
                      />
                      <FormInput<OrderRequestProps>
                        name="phone"
                        label={PHONE_LABEL}
                        type="number"
                        maxLength={11}
                        rules={{
                          required: 'شماره تلفن الزامی است.',
                          pattern: {
                            value: /^09\d{9}$/,
                            message:
                              'شماره تلفن باید با 09 شروع شده و 11 رقم باشد.',
                          },
                        }}
                      />
                    </div>
                  )}
                </Tab>

                <Tab
                  key="ceremonies"
                  title={CEREMONIES_CUSTOMER}
                  className="flex flex-col gap-y-3"
                >
                  <ResidentSelectionSection {...residentSelectProps} />
                </Tab>

                <Tab
                  key="credit"
                  title={CREDIT_CUSTOMER}
                  className="flex flex-col gap-y-3"
                >
                  <ResidentSelectionSection {...residentSelectProps} />
                </Tab>

                <Tab
                  key="employee"
                  title={EMPLOYEE_CUSTOMER}
                  className="flex flex-col gap-y-3"
                >
                  <ResidentSelectionSection {...residentSelectProps} />
                </Tab>
              </Tabs>

              <div className="mt-6 rounded-lg border border-default-200 bg-default-50 p-3">
                <CheckoutDiscountSection
                  hasDiscount={hasDiscount}
                  setHasDiscount={setHasDiscount}
                  selectedOption={selectedDiscountOption}
                  setSelectedOption={setSelectedDiscountOption}
                  discountType={discountType}
                  calculatedData={undefined}
                  expiredDiscountMessage={expiredDiscountMessage}
                />
              </div>
            </ModalBody>

            <ModalFooter className="mr-auto">
              <Button color="danger" variant="light" onPress={onClose}>
                {CANCEL_LABEL}
              </Button>
              <Button color="success" type="submit" className="text-white">
                تایید و پرینت
              </Button>
            </ModalFooter>
          </FormLayout>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PrePrintModal
