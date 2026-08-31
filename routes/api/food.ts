import { AxiosRequestConfig } from 'axios'

export const FOOD_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/food/list',
  }),

  create: (data: FormData): AxiosRequestConfig => ({
    url: '/v1/food/create',
    method: 'POST',
    data,
  }),

  // برای آپلود فایل در PHP/Laravel، درخواست را POST می‌فرستیم
  // و داخل FormData مقدار _method=PUT قرار می‌گیرد.
  updateById: (data: FormData): AxiosRequestConfig => ({
    url: '/v1/food/update/{food}',
    method: 'POST',
    data,
  }),
}

export const FOOD_REPORTING_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/food/reporting',
  }),
}
