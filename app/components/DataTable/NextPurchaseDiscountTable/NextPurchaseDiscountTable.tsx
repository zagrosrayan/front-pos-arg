// components/discount/NextPurchaseDiscountTable.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client'

import {
  ACCEPT_LABEL,
  CREATE_DISCOUNT_CODE_LABEL,
  DISCOUNT_INFO_LABEL,
  MINIMUM_PRICE_LABEL,
  NAME_LABEL,
} from '@/app/constant/label'
import FormInput from '@/app/components/ui/FormInput'
import FormNumberInput from '@/app/components/ui/FormNumberInput'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { NEXT_PURCHASE_DISCOUNT_API } from '@/routes/api/discount'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import {
  NextPurchaseDiscountRequestProps,
  NextPurchaseDiscountResponseProps,
} from '@/types/discountTypes'
import {
  handleApiErrors,
  isValidationErrorResponse,
} from '@/utils/handleApiError'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from '@heroui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'

type TargetCustomerType = 'resident' | 'Non_resident'

type FormValues = NextPurchaseDiscountRequestProps & {
  discount_sms_template: string
  reminder_sms_template: string
  profit_manager_ids: number[]
  target_customer_types: TargetCustomerType[]
}

/* ─────────────────────────────────────────────
   مودال قالب پیامک – قابل استفاده مجدد
   ───────────────────────────────────────────── */

type SmsTemplateModalProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  helperText?: string
  chips: string[]
  chipColor?: 'primary' | 'warning' | 'success'
  fieldName: 'discount_sms_template' | 'reminder_sms_template'
  control: Control<FormValues>
  placeholder?: string
  chipDescriptions: Record<string, string>
}

const SmsTemplateModal = ({
  isOpen,
  onOpenChange,
  title,
  helperText,
  chips,
  chipColor = 'primary',
  fieldName,
  control,
  placeholder,
  chipDescriptions,
}: SmsTemplateModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>

            <ModalBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <Chip key={c} size="sm" variant="flat" color={chipColor}>
                    {`{${c}}`}
                  </Chip>
                ))}
              </div>

              <div className="rounded-lg bg-default-50 px-3 py-2 text-[11px] leading-relaxed text-default-600">
                <p className="mb-1 font-semibold">توضیح متغیرها:</p>
                <ul className="space-y-0.5">
                  {chips.map((c) => (
                    <li key={c}>
                      <span className="font-semibold">{`{${c}}`}</span>{' '}
                      <span>– {chipDescriptions[c]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {helperText ? (
                <p className="text-xs text-default-500">{helperText}</p>
              ) : null}

              <Controller
                name={fieldName}
                control={control}
                rules={{ required: 'پر کردن این فیلد الزامی است.' }}
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    label="متن پیامک"
                    placeholder={placeholder}
                    minRows={4}
                    maxRows={8}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                بستن
              </Button>
              <Button color="primary" onPress={onClose}>
                تایید
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

/* ─────────────────────────────────────────────
   دکمه نمایش/ویرایش قالب پیامک
   ───────────────────────────────────────────── */

type SmsFieldButtonProps = {
  title: string
  preview?: string
  emptyText: string
  onPress: () => void
  error?: string
  color?: 'primary' | 'warning' | 'success'
}

const SmsFieldButton = ({
  title,
  preview,
  emptyText,
  onPress,
  error,
  color = 'primary',
}: SmsFieldButtonProps) => {
  const txt = (preview || '').trim()

  return (
    <div>
      <Button
        type="button"
        color={error ? 'danger' : color}
        fullWidth
        size="lg"
        radius="sm"
        onPress={onPress}
      >
        {title}
      </Button>

      <p className="mt-2 truncate text-xs text-default-500">
        {error ? error : txt ? `پیش‌نمایش: ${txt}` : emptyText}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   کامپوننت اصلی
   ───────────────────────────────────────────── */

type ProfitManagerItem = { id: number; name?: string; slug?: string }

const NextPurchaseDiscountTable = () => {
  const infoDisclosure = useDisclosure()
  const deleteDisclosure = useDisclosure()
  const discountSmsDisclosure = useDisclosure()
  const reminderSmsDisclosure = useDisclosure()

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      is_active: true,
      usage_limit: 1,
      discount_sms_template: '',
      reminder_sms_template: '',
      profit_manager_ids: [],
      target_customer_types: [],
    } as any,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [existingDiscount, setExistingDiscount] =
    useState<NextPurchaseDiscountResponseProps | null>(null)
  const [profitManagers, setProfitManagers] = useState<ProfitManagerItem[]>([])
  const [isLoadingProfitManagers, setIsLoadingProfitManagers] = useState(false)

  const discountSmsPreview = methods.watch('discount_sms_template')
  const reminderSmsPreview = methods.watch('reminder_sms_template')

  /* ── متغیرهای پیامک تخفیف و یادآوری ── */
  const discountSmsChips = useMemo(
    () => [
      'name',
      'order_number',
      'mobile',
      'discount_ccode',
      'discount_value',
      'minimum_purchase',
      'expiration_date',
    ],
    []
  )

  const discountSmsChipDescriptions: Record<string, string> = useMemo(
    () => ({
      name: 'نام مشتری',
      order_number: 'شماره سفارش',
      mobile: 'شماره موبایل مشتری',
      discount_ccode: 'کد تخفیف',
      discount_value: 'مبلغ یا درصد تخفیف',
      minimum_purchase: 'حداقل مبلغ خرید برای اعمال تخفیف',
      expiration_date: 'تاریخ انقضای تخفیف',
    }),
    []
  )

  /* ── توابع کمکی ── */

  const extractData = useCallback(
    (data: any): NextPurchaseDiscountResponseProps | null => {
      if (!data) return null
      if (data.items) {
        if (Array.isArray(data.items) && data.items.length > 0)
          return data.items[0]
        if (typeof data.items === 'object' && !Array.isArray(data.items))
          return data.items
      }
      if (data.item) return data.item
      if (data.id || data.name) return data
      return null
    },
    []
  )

  const fetchExistingDiscount = useCallback(async () => {
    try {
      const response = await apiRequest<any>(
        NEXT_PURCHASE_DISCOUNT_API.getAll()
      )
      setExistingDiscount(extractData(response?.data))
    } catch (error) {
      console.error(
        'fetchExistingDiscount error:',
        JSON.stringify((error as any)?.response?.data ?? error, null, 2)
      )
      setExistingDiscount(null)
    }
  }, [extractData])

  const fetchProfitManagers = useCallback(async () => {
    try {
      setIsLoadingProfitManagers(true)
      const response = await apiRequest<any>(PROFIT_MANAGER_API.getAll())
      const items: ProfitManagerItem[] =
        response?.data?.items || response?.data?.data || response?.data || []
      setProfitManagers(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error(
        'fetchProfitManagers error:',
        JSON.stringify((error as any)?.response?.data ?? error, null, 2)
      )
      setProfitManagers([])
    } finally {
      setIsLoadingProfitManagers(false)
    }
  }, [])

  useEffect(() => {
    fetchExistingDiscount()
  }, [fetchExistingDiscount])

  useEffect(() => {
    fetchProfitManagers()
  }, [fetchProfitManagers])

  /* ── ارسال فرم ── */

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)

      // اعتبارسنجی متن‌های پیامک
      let hasError = false

      if (!data.discount_sms_template.trim()) {
        methods.setError('discount_sms_template', {
          type: 'required',
          message: 'متن پیامک ارسال کد تخفیف الزامی است.',
        })
        hasError = true
      }
      if (!data.reminder_sms_template.trim()) {
        methods.setError('reminder_sms_template', {
          type: 'required',
          message: 'متن پیامک یادآوری الزامی است.',
        })
        hasError = true
      }

      if (hasError) return

      const payload: NextPurchaseDiscountRequestProps = {
        name: data.name,
        minimum_purchase_amount: Number(
          String(data.minimum_purchase_amount).replace(/,/g, '')
        ),
        discount_percentage: Number(data.discount_percentage),
        discount_validity_days:
          data.discount_validity_days !== undefined &&
          data.discount_validity_days !== null
            ? Number(data.discount_validity_days)
            : undefined,
        reminder_days_before_expiration:
          data.reminder_days_before_expiration !== undefined &&
          data.reminder_days_before_expiration !== null
            ? Number(data.reminder_days_before_expiration)
            : undefined,
        discount_sms_template: data.discount_sms_template,
        reminder_sms_template: data.reminder_sms_template,
        profit_manager_ids: data.profit_manager_ids,
        target_customer_types: data.target_customer_types,
        is_active: data.is_active,
        usage_limit: 1,
      }

      const response = await apiRequest<any>(
        NEXT_PURCHASE_DISCOUNT_API.create(payload)
      )

      if (response) {
        methods.reset({
          is_active: true,
          usage_limit: 1,
          discount_sms_template: '',
          reminder_sms_template: '',
          profit_manager_ids: [],
          target_customer_types: [],
        } as any)

        let createdItem = extractData(response.data)

        if (!createdItem) {
          const listResponse = await apiRequest<any>(
            NEXT_PURCHASE_DISCOUNT_API.getAll()
          )
          createdItem = extractData(listResponse?.data)
        }

        if (createdItem) {
          setExistingDiscount(createdItem)
          infoDisclosure.onOpen()
        }
      }
    } catch (error) {
      if (isValidationErrorResponse<FormValues>(error)) {
        handleApiErrors(error, methods.setError)
      } else {
        console.error(
          'API Error:',
          JSON.stringify((error as any)?.response?.data ?? error, null, 2)
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  /* ── حذف ── */

  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    deleteDisclosure.onOpen()
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      const response = await apiRequest(
        NEXT_PURCHASE_DISCOUNT_API.delete(deleteId)
      )
      if (response) {
        setExistingDiscount(null)
        deleteDisclosure.onClose()
      }
    } catch (error) {
      console.error(
        'Delete Error:',
        JSON.stringify((error as any)?.response?.data ?? error, null, 2)
      )
    } finally {
      setIsDeleting(false)
    }
  }

  /* ── مقادیر محاسباتی برای نمایش ── */

  const discountSmsError =
    methods.formState.errors.discount_sms_template?.message
  const reminderSmsError =
    methods.formState.errors.reminder_sms_template?.message

  const profitManagerMap = useMemo(() => {
    const m = new Map<number, string>()
    profitManagers.forEach((pm) =>
      m.set(pm.id, pm.name || pm.slug || `مرکز درآمد ${pm.id}`)
    )
    return m
  }, [profitManagers])

  const selectedProfitManagersText = useMemo(() => {
    const ids = ((existingDiscount as any)?.profit_manager_ids ||
      []) as number[]
    if (!Array.isArray(ids) || ids.length === 0) return '---'
    return ids.map((id) => profitManagerMap.get(id) || `#${id}`).join('، ')
  }, [existingDiscount, profitManagerMap])

  const targetCustomerTypesText = useMemo(() => {
    const t = ((existingDiscount as any)?.target_customer_types ||
      []) as TargetCustomerType[]
    if (!Array.isArray(t) || t.length === 0) return '---'
    const map: Record<TargetCustomerType, string> = {
      resident: 'مقیم',
      Non_resident: 'غیر مقیم',
    }
    return t.map((x) => map[x] || x).join('، ')
  }, [existingDiscount])

  /* ══════════════════════════════════════════════
     رندر
     ══════════════════════════════════════════════ */

  return (
    <div className="flex flex-col gap-5">
      {/* ─── فرم ایجاد تنظیمات جدید ─── */}
      {!existingDiscount && (
        <div className="space-y-10">
          <div className="space-y-5">
            <h1 className="px-3 text-xl font-bold text-default-700">
              ایجاد تنظیمات جدید برای تخفیف بعدی :
            </h1>

            <FormLayout<FormValues>
              onSubmit={handleSubmit}
              methods={methods}
              className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {/* ── فیلدهای اصلی ── */}
              <FormInput<FormValues>
                name="name"
                type="text"
                label="نام طرح تخفیف"
                isRequired
                description="نام طرح تخفیف الزامی است."
              />

              <FormNumberInput<FormValues>
                name="minimum_purchase_amount"
                label="حداقل مبلغ خرید (ریال)"
                isRequired
                isSeparator
                description="حداقل مبلغ خرید الزامی است."
              />

              <FormNumberInput<FormValues>
                name="discount_percentage"
                label="درصد تخفیف"
                maxValue={100}
                isRequired
                description="درصد تخفیف الزامی است."
              />

              <FormNumberInput<FormValues>
                name="discount_validity_days"
                label="مدت اعتبار تخفیف (روز)"
                description="کد تخفیف چند روز پس از صدور معتبر باشد"
                maxLength={3}
                isRequired
              />

              <FormNumberInput<FormValues>
                name="reminder_days_before_expiration"
                label="تعداد روز یادآوری قبل از انقضا"
                description="چند روز قبل از انقضا، پیامک یادآوری ارسال شود"
                maxLength={3}
                isRequired
              />

              {/* ── دکمه‌های تنظیم پیامک ── */}
              <SmsFieldButton
                title="تنظیم متن پیامک ارسال کد تخفیف خرید بعدی"
                preview={discountSmsPreview}
                emptyText="متن پیامک ارسال کد تخفیف هنوز تنظیم نشده است."
                onPress={discountSmsDisclosure.onOpen}
                error={discountSmsError}
                color="primary"
              />

              <SmsFieldButton
                title="تنظیم متن پیامک یادآوری قبل از انقضا"
                preview={reminderSmsPreview}
                emptyText="متن پیامک یادآوری هنوز تنظیم نشده است."
                onPress={reminderSmsDisclosure.onOpen}
                error={reminderSmsError}
                color="warning"
              />

              {/* ── مراکز درآمد (تیک‌زنی) ── */}
              <div className="mt-2 sm:col-span-2 md:col-span-3">
                <Controller
                  name="profit_manager_ids"
                  control={methods.control}
                  rules={{
                    required: 'حداقل یک مرکز درآمد باید انتخاب شود.',
                  }}
                  render={({ field, fieldState }) => (
                    <CheckboxGroup
                      label="مراکز درآمد"
                      value={(field.value || []).map(String)}
                      onValueChange={(vals) =>
                        field.onChange(vals.map((x) => Number(x)))
                      }
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      description="مراکز درآمدی که این طرح روی آن‌ها فعال است انتخاب کنید."
                      classNames={{
                        base: 'gap-2',
                        wrapper:
                          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2',
                      }}
                    >
                      {profitManagers.map((pm) => (
                        <Checkbox key={pm.id} value={String(pm.id)}>
                          {pm.name || pm.slug || `مرکز درآمد ${pm.id}`}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  )}
                />
              </div>

              {/* ── نوع مشتری هدف (مقیم / غیرمقیم) ── */}
              <div className="mt-1">
                <Controller
                  name="target_customer_types"
                  control={methods.control}
                  rules={{
                    validate: (v) =>
                      Array.isArray(v) && v.length > 0
                        ? true
                        : 'حداقل یکی از گزینه‌های مقیم/غیرمقیم باید انتخاب شود.',
                  }}
                  render={({ field, fieldState }) => (
                    <CheckboxGroup
                      label="نوع مشتری هدف"
                      value={(field.value || []) as any}
                      onValueChange={(vals) =>
                        field.onChange(vals as TargetCustomerType[])
                      }
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      orientation="horizontal"
                      classNames={{ base: 'gap-3' }}
                      description="حداقل یک گزینه باید انتخاب شود."
                    >
                      <Checkbox value="resident">مقیم</Checkbox>
                      <Checkbox value="Non_resident">غیر مقیم</Checkbox>
                    </CheckboxGroup>
                  )}
                />
              </div>

              {/* ── دکمه ثبت ── */}
              <Button
                color="success"
                className="text-white"
                fullWidth
                type="submit"
                size="lg"
                radius="sm"
                isLoading={isLoading}
              >
                {CREATE_DISCOUNT_CODE_LABEL}
              </Button>
            </FormLayout>
          </div>
        </div>
      )}

      {/* ─── نمایش تنظیمات موجود ─── */}
      {existingDiscount && (
        <div className="space-y-5">
          <div className="rounded-lg border-2 border-warning-300 bg-warning-50 p-4">
            <p className="text-warning-700">
              یک تنظیمات فعال دارید . برای تعریف تنظیمات جدید لطفا تنظیمات قبلی
              را حذف کنید .
            </p>
          </div>

          <h2 className="text-xl font-bold text-default-700">
            تنظیمات فعلی تخفیف بعدی
          </h2>

          <div className="overflow-x-auto rounded-lg border border-default-200">
            <table className="w-full min-w-max table-auto text-sm">
              <thead className="bg-default-100 text-default-600">
                <tr>
                  <th className="p-3 text-right font-semibold">شناسه</th>
                  <th className="p-3 text-right font-semibold">{NAME_LABEL}</th>
                  <th className="p-3 text-right font-semibold">
                    {MINIMUM_PRICE_LABEL}
                  </th>
                  <th className="p-3 text-right font-semibold">درصد</th>
                  <th className="p-3 text-right font-semibold">
                    اعتبار تخفیف (روز)
                  </th>
                  <th className="p-3 text-right font-semibold">
                    یادآوری قبل از انقضا (روز)
                  </th>
                  <th className="p-3 text-right font-semibold">مراکز درآمد</th>
                  <th className="p-3 text-right font-semibold">نوع مشتری</th>
                  <th className="p-3 text-right font-semibold">
                    متن پیامک تخفیف
                  </th>
                  <th className="p-3 text-right font-semibold">
                    متن پیامک یادآوری
                  </th>
                  <th className="p-3 text-center font-semibold">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-default-200">
                <tr className="align-top hover:bg-default-50">
                  <td className="p-3 text-default-700">
                    {existingDiscount?.id || '-'}
                  </td>
                  <td className="p-3 text-default-700">
                    {existingDiscount?.name || '-'}
                  </td>
                  <td className="p-3 text-default-700">
                    {Number(
                      existingDiscount?.minimum_purchase_amount || 0
                    ).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3 text-default-700">
                    {Number(
                      existingDiscount?.discount_percentage || 0
                    ).toLocaleString('fa-IR')}{' '}
                    %
                  </td>
                  <td className="p-3 text-default-700">
                    {existingDiscount?.discount_validity_days
                      ? `${existingDiscount.discount_validity_days} روز`
                      : '---'}
                  </td>
                  <td className="p-3 text-default-700">
                    {existingDiscount?.reminder_days_before_expiration
                      ? `${existingDiscount.reminder_days_before_expiration} روز`
                      : '---'}
                  </td>
                  <td className="min-w-[180px] p-3 text-default-700">
                    {selectedProfitManagersText}
                  </td>
                  <td className="min-w-[140px] p-3 text-default-700">
                    {targetCustomerTypesText}
                  </td>
                  <td className="min-w-[260px] whitespace-pre-wrap break-words p-3 text-default-700">
                    {(existingDiscount as any)?.discount_sms_template?.trim()
                      ? (existingDiscount as any).discount_sms_template
                      : '---'}
                  </td>
                  <td className="min-w-[260px] whitespace-pre-wrap break-words p-3 text-default-700">
                    {(existingDiscount as any)?.reminder_sms_template?.trim()
                      ? (existingDiscount as any).reminder_sms_template
                      : '---'}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        existingDiscount?.id &&
                        openDeleteModal(existingDiscount.id)
                      }
                      className="cursor-pointer whitespace-nowrap rounded-full bg-danger-500 px-4 py-2 text-white transition-opacity hover:opacity-80"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── مودال‌های پیامک ─── */}

      {/* پیامک ارسال کد تخفیف خرید بعدی */}
      <SmsTemplateModal
        isOpen={discountSmsDisclosure.isOpen}
        onOpenChange={discountSmsDisclosure.onOpenChange}
        title="تنظیم متن پیامک ارسال کد تخفیف خرید بعدی"
        helperText="می‌توانید بی‌نهایت متغیر داخل متن قرار دهید."
        chips={discountSmsChips}
        chipColor="primary"
        fieldName="discount_sms_template"
        control={methods.control}
        placeholder={`{name} کاربر گرامی\nشماره سفارش شما {order_number}\nکد تخفیف: {discount_ccode}\nمعتبر تا: {expiration_date}`}
        chipDescriptions={discountSmsChipDescriptions}
      />

      {/* پیامک یادآوری قبل از انقضا */}
      <SmsTemplateModal
        isOpen={reminderSmsDisclosure.isOpen}
        onOpenChange={reminderSmsDisclosure.onOpenChange}
        title="تنظیم متن پیامک یادآوری قبل از انقضا"
        helperText="این پیامک بر اساس تعداد روز یادآوری قبل از انقضا ارسال می‌شود."
        chips={discountSmsChips}
        chipColor="warning"
        fieldName="reminder_sms_template"
        control={methods.control}
        placeholder={`{name} عزیز، کد تخفیف {discount_ccode} شما تا {expiration_date} معتبر است. از دست ندهید!`}
        chipDescriptions={discountSmsChipDescriptions}
      />

      {/* ─── مودال اطلاعات پس از ایجاد ─── */}
      <Modal
        isOpen={infoDisclosure.isOpen}
        onOpenChange={infoDisclosure.onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {DISCOUNT_INFO_LABEL}
              </ModalHeader>

              <ModalBody>
                <dl className="flex min-w-80 shrink-0 flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">شناسه</dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.id ?? '-'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">
                      {NAME_LABEL}
                    </dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.name || '-'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">درصد تخفیف</dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.discount_percentage !== undefined &&
                      existingDiscount?.discount_percentage !== null
                        ? `${Number(
                            existingDiscount.discount_percentage
                          ).toLocaleString('fa-IR')}%`
                        : '-'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">
                      {MINIMUM_PRICE_LABEL}
                    </dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.minimum_purchase_amount !==
                        undefined &&
                      existingDiscount?.minimum_purchase_amount !== null
                        ? `${Number(
                            existingDiscount.minimum_purchase_amount
                          ).toLocaleString('fa-IR')} ریال`
                        : '-'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">
                      مدت اعتبار تخفیف (روز)
                    </dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.discount_validity_days
                        ? `${existingDiscount.discount_validity_days} روز`
                        : '---'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">
                      تعداد روز یادآوری قبل از انقضا
                    </dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.reminder_days_before_expiration
                        ? `${existingDiscount.reminder_days_before_expiration} روز`
                        : '---'}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-2">
                    <dt className="text-small text-default-500">مراکز درآمد</dt>
                    <dd className="whitespace-pre-wrap break-words font-semibold text-default-700">
                      {selectedProfitManagersText}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-2">
                    <dt className="text-small text-default-500">نوع مشتری</dt>
                    <dd className="whitespace-pre-wrap break-words font-semibold text-default-700">
                      {targetCustomerTypesText}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-2">
                    <dt className="text-small text-default-500">
                      متن پیامک ارسال کد تخفیف خرید بعدی
                    </dt>
                    <dd className="whitespace-pre-wrap break-words font-semibold text-default-700">
                      {(existingDiscount as any)?.discount_sms_template?.trim()
                        ? (existingDiscount as any).discount_sms_template
                        : '---'}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-2">
                    <dt className="text-small text-default-500">
                      متن پیامک یادآوری قبل از انقضا
                    </dt>
                    <dd className="whitespace-pre-wrap break-words font-semibold text-default-700">
                      {(existingDiscount as any)?.reminder_sms_template?.trim()
                        ? (existingDiscount as any).reminder_sms_template
                        : '---'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">وضعیت</dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.is_active ? 'فعال' : 'غیرفعال'}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-small text-default-500">
                      محدودیت استفاده
                    </dt>
                    <dd className="font-semibold text-default-700">
                      {existingDiscount?.usage_limit ?? 1}
                    </dd>
                  </div>
                </dl>
              </ModalBody>

              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  {ACCEPT_LABEL}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── مودال تایید حذف ─── */}
      <Modal
        isOpen={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onOpenChange}
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                حذف تنظیمات تخفیف بعدی
              </ModalHeader>

              <ModalBody>
                <p>آیا از حذف این تنظیمات اطمینان دارید؟</p>
                <p className="text-small text-default-500">
                  این عملیات غیرقابل بازگشت است.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  انصراف
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                >
                  بله، حذف کن
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default NextPurchaseDiscountTable
