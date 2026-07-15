'use client'

import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Chip,
  useDisclosure,
} from '@heroui/react'
import { Controller, useForm } from 'react-hook-form'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import FormLayout from '@/app/layout/FormLayout'
import FormNumberInput from '@/app/components/ui/FormNumberInput'
import { apiRequest } from '@/lib/axios'

type ApiEnvelope<T> = {
  status: number
  message: string
  data: {
    items?: T | T[]
    item?: T
  }
}

type SettingApiItem = {
  id: number
  tax: string
  rate_service: string
  created_at: string
  updated_at: string
  order_complete_sms_template: string
  send_order_complete_sms: string
}

type SettingView = {
  id: number
  tax: number
  rate_service: number
  created_at: string
  updated_at: string
  order_complete_sms_template: string
  send_order_complete_sms: boolean
}

type FormValues = {
  tax: number | string
  rate_service: number | string
  send_order_complete_sms: boolean
  order_complete_sms_template: string
}

const normalizeText = (v: unknown) => (v == null ? '' : String(v)).trim()
const toBool01 = (v: unknown) => String(v ?? '0') === '1'

const extractSetting = (
  res: ApiEnvelope<SettingApiItem> | null
): SettingView | null => {
  const items = res?.data?.items
  const raw =
    (items && !Array.isArray(items) ? (items as SettingApiItem) : null) ||
    (Array.isArray(items) ? (items[0] as SettingApiItem) : null) ||
    (res?.data?.item as SettingApiItem | undefined) ||
    null

  if (!raw) return null

  return {
    id: Number(raw.id),
    tax: Number(raw.tax ?? 0),
    rate_service: Number(raw.rate_service ?? 0),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
    order_complete_sms_template: String(raw.order_complete_sms_template ?? ''),
    send_order_complete_sms: toBool01(raw.send_order_complete_sms),
  }
}

const SmsTemplateModal = ({
  isOpen,
  onOpenChange,
  control,
  chips,
  chipDescriptions,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  control: any
  chips: string[]
  chipDescriptions: Record<string, string>
}) => (
  <Modal
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    size="lg"
    scrollBehavior="inside"
  >
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">
            تنظیم متن پیامک تکمیل سفارش
          </ModalHeader>
          <ModalBody className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Chip key={c} size="sm" variant="flat" color="primary">
                  {`{${c}}`}
                </Chip>
              ))}
            </div>

            <div className="rounded-lg bg-default-50 px-3 py-2 text-[11px] leading-relaxed text-default-600">
              <p className="mb-1 font-semibold">توضیح متغیرها:</p>
              <ul className="space-y-0.5">
                {chips.map((c) => (
                  <li key={c}>
                    <span className="font-semibold">{`{${c}}`}</span> –{' '}
                    <span>{chipDescriptions[c]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Controller
              name="order_complete_sms_template"
              control={control}
              rules={{ required: 'متن پیامک الزامی است.' }}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  label="متن پیامک"
                  minRows={5}
                  maxRows={10}
                  placeholder="سلام {name}، سفارش شما به شماره {order_number} آماده شد."
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

export default function SettingPage() {
  const smsModal = useDisclosure()
  const SETTING_ID = 1

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      tax: 0,
      rate_service: 0,
      send_order_complete_sms: false,
      order_complete_sms_template: '',
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [lastSetting, setLastSetting] = useState<SettingView | null>(null)

  const sendSms = methods.watch('send_order_complete_sms')
  const smsPreview = methods.watch('order_complete_sms_template')

  const chips = useMemo(() => ['name', 'order_number', 'price', 'date'], [])
  const chipDescriptions = useMemo(
    () => ({
      name: 'نام مشتری',
      order_number: 'شماره سفارش',
      price: 'مبلغ نهایی (ریال)',
      date: 'تاریخ تکمیل سفارش',
    }),
    []
  )

  const fetchSetting = useCallback(async () => {
    try {
      setIsFetching(true)
      const res = await apiRequest<SettingApiItem>({
        url: '/v1/setting',
        method: 'GET',
      })

      const setting = extractSetting(res as any)
      setLastSetting(setting)

      if (setting) {
        methods.reset({
          tax: setting.tax,
          rate_service: setting.rate_service,
          send_order_complete_sms: setting.send_order_complete_sms,
          order_complete_sms_template: setting.order_complete_sms_template,
        })
      }
    } catch (e) {
      console.error('Error fetching setting:', e)
      toast.error('خطا در دریافت تنظیمات.')
      setLastSetting(null)
    } finally {
      setIsFetching(false)
    }
  }, [methods])

  useEffect(() => {
    fetchSetting()
  }, [fetchSetting])

  useEffect(() => {
    if (!sendSms) methods.clearErrors('order_complete_sms_template')
  }, [sendSms, methods])

  const onSubmit = async (form: FormValues) => {
    if (
      form.send_order_complete_sms &&
      !String(form.order_complete_sms_template || '').trim()
    ) {
      methods.setError('order_complete_sms_template', {
        type: 'manual',
        message: 'متن پیامک الزامی است.',
      })
      return
    }

    const payload = {
      tax: Number(form.tax),
      rate_service: Number(form.rate_service),
      send_order_complete_sms: form.send_order_complete_sms ? 1 : 0,
      order_complete_sms_template: String(
        form.order_complete_sms_template ?? ''
      ),
    }

    try {
      setIsLoading(true)
      await apiRequest<any>(
        {
          url: '/v1/setting/update/{id}',
          method: 'PUT',
          data: payload,
        },
        { id: SETTING_ID },
        { silent: false }
      )

      toast.success('تنظیمات با موفقیت ذخیره شد.')
      await fetchSetting()
    } catch (e) {
      console.error('Error updating setting:', e)
      toast.error('خطا در ذخیره تنظیمات.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-default-700">تنظیمات عمومی</h1>
        <Button variant="flat" onPress={fetchSetting} isLoading={isFetching}>
          بروزرسانی
        </Button>
      </div>

      <FormLayout<FormValues>
        onSubmit={onSubmit}
        methods={methods}
        className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <FormNumberInput<FormValues>
          name="tax"
          label="مالیات (درصد)"
          isRequired
          maxValue={100}
        />
        <FormNumberInput<FormValues>
          name="rate_service"
          label="حق سرویس (درصد)"
          isRequired
          maxValue={100}
        />
        <div className="mt-4">
          <Controller
            name="send_order_complete_sms"
            control={methods.control}
            render={({ field }) => (
              <Checkbox
                isSelected={!!field.value}
                onValueChange={field.onChange}
              >
                ارسال پیامک تکمیل سفارش فعال باشد
              </Checkbox>
            )}
          />
        </div>
        <div>
          <Button
            type="button"
            color={
              methods.formState.errors.order_complete_sms_template
                ? 'danger'
                : 'primary'
            }
            fullWidth
            size="lg"
            radius="sm"
            onPress={smsModal.onOpen}
            isDisabled={!sendSms}
          >
            تنظیم متن پیامک تکمیل سفارش
          </Button>

          <p className="mt-2 truncate text-xs text-default-500">
            {methods.formState.errors.order_complete_sms_template?.message
              ? String(
                  methods.formState.errors.order_complete_sms_template?.message
                )
              : !sendSms
                ? 'ارسال پیامک غیرفعال است.'
                : normalizeText(smsPreview)
                  ? `پیش‌نمایش: ${normalizeText(smsPreview)}`
                  : 'متن پیامک هنوز تنظیم نشده است.'}
          </p>
        </div>

        <Button
          color="success"
          className="text-white"
          fullWidth
          type="submit"
          size="lg"
          radius="sm"
          isLoading={isLoading}
        >
          ذخیره تنظیمات
        </Button>
      </FormLayout>

      <SmsTemplateModal
        isOpen={smsModal.isOpen}
        onOpenChange={smsModal.onOpenChange}
        control={methods.control}
        chips={chips}
        chipDescriptions={chipDescriptions}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-default-700">
          آخرین تنظیمات ذخیره‌شده
        </h2>

        {lastSetting ? (
          <div className="overflow-x-auto rounded-lg border border-default-200">
            <table className="w-full min-w-max table-auto text-sm">
              <thead className="bg-default-100 text-default-600">
                <tr>
                  <th className="p-3 text-right font-semibold">شناسه</th>
                  <th className="p-3 text-right font-semibold">مالیات (%)</th>
                  <th className="p-3 text-right font-semibold">حق سرویس (%)</th>
                  <th className="p-3 text-right font-semibold">ارسال پیامک</th>
                  <th className="p-3 text-right font-semibold">
                    آخرین بروزرسانی
                  </th>
                  <th className="p-3 text-right font-semibold">
                    متن قالب پیامک
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-default-200">
                <tr className="align-top hover:bg-default-50">
                  <td className="p-3 text-default-700">{lastSetting.id}</td>
                  <td className="p-3 text-default-700">
                    {Number(lastSetting.tax).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3 text-default-700">
                    {Number(lastSetting.rate_service).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3 text-default-700">
                    {lastSetting.send_order_complete_sms ? 'فعال' : 'غیرفعال'}
                  </td>
                  <td className="p-3 text-default-700">
                    {lastSetting.updated_at ? lastSetting.updated_at : '---'}
                  </td>
                  <td className="min-w-[320px] whitespace-pre-wrap break-words p-3 text-default-700">
                    {lastSetting.order_complete_sms_template?.trim()
                      ? lastSetting.order_complete_sms_template
                      : '---'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-default-200 bg-default-50 p-4 text-sm text-default-600">
            تنظیماتی موجود نیست.
          </div>
        )}
      </div>
    </div>
  )
}
