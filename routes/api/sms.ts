/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const SMS_API = {
  sendSingle: (data: any): AxiosRequestConfig => ({
    url: '/v1/sms/send-single',
    method: 'POST',
    data,
  }),
  sendBulk: (data: any): AxiosRequestConfig => ({
    url: '/v1/sms/send-bulk',
    method: 'POST',
    data,
  }),
}
