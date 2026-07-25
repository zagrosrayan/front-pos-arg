/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const LOG_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/log',
  }),
}
