/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const PROFIT_MANAGER_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/profit-manager/list',
  }),

  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/profit-manager/create',
    method: 'POST',
    data,
  }),
  updateById: (data: any): AxiosRequestConfig => ({
    url: '/v1/profit-manager/update/{profit}',
    method: 'PUT',
    data,
  }),
}
