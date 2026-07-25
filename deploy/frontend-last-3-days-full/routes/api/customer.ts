import { AxiosRequestConfig } from 'axios'

export const CUSTOMER_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/customers/list',
  }),
}

export const CUSTOMER_REPORT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/reports/customers',
  }),
}

export const RESIDENT_CUSTOMER_REPORT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/reports/resident-customers',
  }),
}
