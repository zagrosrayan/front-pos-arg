import { AxiosRequestConfig } from 'axios'

export const CUSTOMER_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/customers/list',
  }),
}

export const CUSTOMER_ORDERS_API = (customerId: string | number) => ({
  getAll: (): AxiosRequestConfig => ({
    url: `/v1/customers/${customerId}/orders`,
  }),
})

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
