/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'

export const CLUB_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/club-setting',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/club-setting',
    method: 'POST',
    data,
  }),
  delete: (id: number): AxiosRequestConfig => ({
    url: `/v1/club-setting/${id}`,
    method: 'DELETE',
  }),
}
