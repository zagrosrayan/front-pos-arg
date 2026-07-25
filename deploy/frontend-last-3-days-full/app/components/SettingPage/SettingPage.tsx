'use client'

import { Button } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
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
}

type SettingView = {
  id: number
  tax: number
  rate_service: number
  created_at: string
  updated_at: string
}

type FormValues = {
  tax: number | string
  rate_service: number | string
}

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
  }
}

export default function SettingPage() {
  const SETTING_ID = 1

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      tax: 0,
      rate_service: 0,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [lastSetting, setLastSetting] = useState<SettingView | null>(null)

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

  const onSubmit = async (form: FormValues) => {
    const payload = {
      tax: Number(form.tax),
      rate_service: Number(form.rate_service),
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
                  <th className="p-3 text-right font-semibold">
                    آخرین بروزرسانی
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
                    {lastSetting.updated_at ? lastSetting.updated_at : '---'}
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
