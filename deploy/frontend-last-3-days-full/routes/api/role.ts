/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const ROLE_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/role/list',
  }),
  assign: (data: any): AxiosRequestConfig => ({
    url: '/v1/role/assign',
    method: 'POST',
    data,
  }),
}
