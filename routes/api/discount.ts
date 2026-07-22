/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const DISCOUNT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/discount/list',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/discount/store',
    method: 'POST',
    data,
  }),
  getValid: (): AxiosRequestConfig => ({
    url: '/v1/discount/valid',
  }),
  toggleActive: (id: number): AxiosRequestConfig => ({
    url: `/v1/discount/update-status/${id}`,
    method: 'GET',
  }),
  delete: (id: number): AxiosRequestConfig => ({
    url: `/v1/discount/destroy/${id}`,
    method: 'DELETE',
  }),
}

export const GLOBAL_DISCOUNT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/discount/global',
    method: 'GET',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/discount/store/global',
    method: 'POST',
    data,
  }),
  toggleActive: (id: number): AxiosRequestConfig => ({
    url: `/v1/discount/update-status/${id}`,
    method: 'GET',
  }),
  delete: (id: number): AxiosRequestConfig => ({
    url: `/v1/discount/destroy/${id}`,
    method: 'DELETE',
  }),
}

export const NEXT_PURCHASE_DISCOUNT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/next-purchase-discount',
    method: 'GET',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/next-purchase-discount',
    method: 'POST',
    data,
  }),
  update: (id: number, data: any): AxiosRequestConfig => ({
    url: `/v1/next-purchase-discount/${id}`,
    method: 'PUT',
    data,
  }),
  delete: (id: number): AxiosRequestConfig => ({
    url: `/v1/next-purchase-discount/${id}`,
    method: 'DELETE',
  }),
}

export const GLOBAL_DISCOUNT_REPORT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/reports/discount-used-global',
  }),
}

export const DISCOUNT_REPORT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/reports/discount-used-normal',
  }),
}
