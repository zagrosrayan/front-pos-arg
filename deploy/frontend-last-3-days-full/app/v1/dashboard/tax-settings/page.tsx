'use client'

import {
  RATE_SERVICE_LABEL,
  SAVE_SETTINGS_LABEL,
  TAX_SETTINGS_LABEL,
  TAX_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { SETTING_API } from '@/routes/api/setting'
import { SettingRequestProps, SettingResponseProps } from '@/types/settingTypes'
import { ValidationErrorResponseType } from '@/types/errorTypes'
import { handleApiErrors } from '@/utils/handleApiError'
import { Button } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormNumberInput from '@/app/components/ui/FormNumberInput'

const TaxSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingSettings, setExistingSettings] =
    useState<SettingResponseProps | null>(null)

  const settingIdRef = useRef<number | null>(null)

  const methods = useForm<SettingRequestProps>({
    mode: 'onChange',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<{
          items: SettingResponseProps
        }>(SETTING_API.getAll())

        const settings = response?.data?.items

        if (settings) {
          settingIdRef.current = settings.id
          setExistingSettings(settings)
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
      }

      const response = await apiRequest(SETTING_API.updateById(payload))
      toast.success(response?.message || 'تنظیمات با موفقیت ذخیره شد')

      const updatedResponse = await apiRequest<{
        items: SettingResponseProps
      }>(SETTING_API.getAll())
      setExistingSettings(updatedResponse?.data?.items || null)

      methods.reset()
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

      <div className="space-y-5">
        <h2 className="text-xl font-bold text-default-700">ویرایش تنظیمات</h2>

        <FormLayout<SettingRequestProps>
          onSubmit={onSubmit}
          methods={methods}
          className="space-y-6"
        >
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

      {existingSettings && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-default-700">
            تنظیمات فعلی مالیات
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
