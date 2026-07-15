/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const ORDER_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/order/list',
  }),
  report: (): AxiosRequestConfig => ({
    url: '/v1/order/reporting',
  }),
  ajaxCalculate: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/ajax/calculate',
    method: 'POST',
    data,
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/create',
    method: 'POST',
    data,
  }),
  completeResident: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/complete/resident/{order}',
    method: 'POST',
    data,
  }),
  completeGuest: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/complete/guest/{order}',
    method: 'POST',
    data,
  }),
  completeOrder: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/complete/{order}',
    method: 'POST',
    data,
  }),
  prePrint: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/pre-invoice/{order}',
    method: 'POST',
    data,
  }),
  deleteById: (): AxiosRequestConfig => ({
    url: '/v1/order/delete/{order}',
    method: 'DELETE',
  }),
  updateById: (data: any): AxiosRequestConfig => ({
    url: '/v1/order/update/{order}',
    method: 'PUT',
    data,
  }),
}

export const ORDER_REPORTING_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/order/reporting',
  }),
}
