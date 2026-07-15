'use client'

import {
  RATE_SERVICE_LABEL,
  SAVE_SETTINGS_LABEL,
  SEND_SMS_LABEL,
  TAX_SETTINGS_LABEL,
  SMS_TEMPLATE_LABEL,
  SMS_VARIABLES_LABEL,
  TAX_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { SETTING_API } from '@/routes/api/setting'
import { SettingRequestProps, SettingResponseProps } from '@/types/settingTypes'
import { ValidationErrorResponseType } from '@/types/errorTypes'
import { handleApiErrors } from '@/utils/handleApiError'
import { Button, Switch, Textarea } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormNumberInput from '@/app/components/ui/FormNumberInput'

/* ═══════════════════════════════════════════════════════════════
   متغیرهای قابل استفاده در پیامک
   ═══════════════════════════════════════════════════════════════ */

const SMS_VARIABLES = [
  { key: '{name}', label: 'نام مشتری' },
  { key: '{order_number}', label: 'شماره سفارش' },
  { key: '{price}', label: 'قیمت کل' },
  { key: '{date}', label: 'تاریخ' },
]

/* ═══════════════════════════════════════════════════════════════
   کامپوننت اصلی
   ═══════════════════════════════════════════════════════════════ */

const TaxSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templateValue, setTemplateValue] = useState('')
  const [sendSmsEnabled, setSendSmsEnabled] = useState(false)
  const [existingSettings, setExistingSettings] =
    useState<SettingResponseProps | null>(null)

  // استفاده از useRef برای settingId
  const settingIdRef = useRef<number | null>(null)

  const methods = useForm<SettingRequestProps>({
    mode: 'onChange',
  })

  /* ═══════════════════════════════════════════════════════════════
     دریافت تنظیمات
     ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<{
          items: SettingResponseProps
        }>(SETTING_API.getAll())

        const settings = response?.data?.items

        if (settings) {
          // ذخیره ID در ref
          settingIdRef.current = settings.id

          const sendSms =
            settings.send_order_complete_sms === true ||
            String(settings.send_order_complete_sms) === '1'

          // فقط state های مورد نیاز برای جدول رو set می‌کنیم
          setSendSmsEnabled(sendSms)
          setExistingSettings(settings)

          // فرم و textarea رو خالی نگه می‌داریم
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast.error('خطا در دریافت تنظیمات')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  /* ═══════════════════════════════════════════════════════════════
     ذخیره تنظیمات
     ═══════════════════════════════════════════════════════════════ */

  const onSubmit = async (data: SettingRequestProps) => {
    const currentId = settingIdRef.current

    if (!currentId) {
      toast.error('شناسه تنظیمات یافت نشد')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        id: currentId,
        tax: Number(data.tax),
        rate_service: Number(data.rate_service),
        send_order_complete_sms: sendSmsEnabled,
        order_complete_sms_template: templateValue,
      }

      const response = await apiRequest(SETTING_API.updateById(payload))
      toast.success(response?.message || 'تنظیمات با موفقیت ذخیره شد')

      // به‌روزرسانی تنظیمات موجود
      const updatedResponse = await apiRequest<{
        items: SettingResponseProps
      }>(SETTING_API.getAll())
      setExistingSettings(updatedResponse?.data?.items || null)

      // فرم رو خالی می‌کنیم
      methods.reset()
      setTemplateValue('')
    } catch (error) {
      console.error('Failed to update settings:', error)
      handleApiErrors(
        error as ValidationErrorResponseType<SettingRequestProps>,
        methods.setError
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     افزودن متغیر به متن پیامک
     ═══════════════════════════════════════════════════════════════ */

  const insertVariable = (variable: string) => {
    setTemplateValue((prev) => prev + variable)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-lg">در حال بارگذاری...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-5">
      <h1 className="text-2xl font-bold text-default-700">
        {TAX_SETTINGS_LABEL}
      </h1>
      {/* فرم ویرایش تنظیمات */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-default-700">ویرایش تنظیمات</h2>

        <FormLayout<SettingRequestProps>
          onSubmit={onSubmit}
          methods={methods}
          className="space-y-6"
        >
          {/* مالیات و حق سرویس */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormNumberInput<SettingRequestProps>
              name="tax"
              label={TAX_LABEL}
              placeholder="مثال: 9"
              min={0}
              maxValue={100}
              isRequired
              requiredMessage="مالیات الزامی است"
            />

            <FormNumberInput<SettingRequestProps>
              name="rate_service"
              label={RATE_SERVICE_LABEL}
              placeholder="مثال: 5"
              min={0}
              maxValue={100}
              isRequired
              requiredMessage="حق سرویس الزامی است"
            />
          </div>

          {/* فعال/غیرفعال کردن پیامک */}
          <div className="rounded-lg border-2 border-default-100 p-4">
            <Switch
              isSelected={sendSmsEnabled}
              onValueChange={setSendSmsEnabled}
              color="success"
            >
              <span className="font-semibold">{SEND_SMS_LABEL}</span>
            </Switch>
          </div>

          {/* متن قالب پیامک */}
          {sendSmsEnabled && (
            <div className="space-y-4">
              {/* متغیرهای قابل استفاده */}
              <div className="rounded-lg border-2 border-default-100 p-4">
                <p className="mb-3 font-semibold text-default-700">
                  {SMS_VARIABLES_LABEL}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SMS_VARIABLES.map((variable) => (
                    <Button
                      key={variable.key}
                      color="success"
                      variant="flat"
                      size="sm"
                      type="button"
                      onPress={() => insertVariable(variable.key)}
                    >
                      {variable.label} ({variable.key})
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-default-500">
                  💡 روی هر متغیر کلیک کنید تا به متن پیامک اضافه شود
                </p>
              </div>

              {/* Textarea برای متن پیامک */}
              <Textarea
                value={templateValue}
                onValueChange={setTemplateValue}
                label={SMS_TEMPLATE_LABEL}
                placeholder="مثال: سلام {name}، سفارش شما به شماره {order_number} آماده شد."
                minRows={5}
              />
            </div>
          )}

          {/* دکمه ذخیره */}
          <div className="flex justify-end">
            <Button
              type="submit"
              color="success"
              size="lg"
              className="text-white"
              isLoading={isSubmitting}
            >
              {SAVE_SETTINGS_LABEL}
            </Button>
          </div>
        </FormLayout>
      </div>
      {/* نمایش تنظیمات موجود */}
      {existingSettings && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-default-700">
            تنظیمات فعلی مالیات و پیامک
          </h2>

          <div className="overflow-x-auto rounded-lg border border-default-200">
            <table className="w-full min-w-max table-auto text-sm">
              <thead className="bg-default-100 text-default-600">
                <tr>
                  <th className="p-3 text-right font-semibold">شناسه</th>
                  <th className="p-3 text-right font-semibold">{TAX_LABEL}</th>
                  <th className="p-3 text-right font-semibold">
                    {RATE_SERVICE_LABEL}
                  </th>
                  <th className="p-3 text-right font-semibold">
                    وضعیت ارسال پیامک
                  </th>
                  <th className="p-3 text-right font-semibold">
                    متن پیامک تکمیل سفارش
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-default-200">
                <tr className="align-top hover:bg-default-50">
                  <td className="p-3 text-default-700">
                    {existingSettings?.id || '-'}
                  </td>
                  <td className="p-3 text-default-700">
                    {Number(existingSettings?.tax || 0).toLocaleString('fa-IR')}{' '}
                    %
                  </td>
                  <td className="p-3 text-default-700">
                    {Number(existingSettings?.rate_service || 0).toLocaleString(
                      'fa-IR'
                    )}{' '}
                    %
                  </td>
                  <td className="p-3 text-default-700">
                    {existingSettings?.send_order_complete_sms === true ||
                    String(existingSettings?.send_order_complete_sms) === '1'
                      ? 'فعال'
                      : 'غیرفعال'}
                  </td>
                  <td className="min-w-[260px] whitespace-pre-wrap break-words p-3 text-default-700">
                    {existingSettings?.order_complete_sms_template?.trim()
                      ? existingSettings.order_complete_sms_template
                      : '---'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaxSettingsPage
