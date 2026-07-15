import { AxiosRequestConfig } from 'axios'

export const FOOD_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/food/list',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/food/create',
    method: 'POST',
    data,
  }),
  updateById: (data: any): AxiosRequestConfig => ({
    url: '/v1/food/update/{food}',
    method: 'PUT',
    data,
  }),
}

export const FOOD_REPORTING_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/food/reporting',
  }),
}
