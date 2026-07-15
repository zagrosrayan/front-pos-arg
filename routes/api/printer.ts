/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const PRINTER_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/printer/list',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/printer/create',
    method: 'POST',
    data,
  }),
  updateById: (data: any): AxiosRequestConfig => ({
    url: '/v1/printer/update/{printer}',
    method: 'PUT',
    data,
  }),
  printInvoice: (): AxiosRequestConfig => ({
    url: '/v1/print-hp-invoice/{order}',
  }),
}
