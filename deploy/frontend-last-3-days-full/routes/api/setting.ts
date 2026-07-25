import { AxiosRequestConfig } from 'axios'

export const SETTING_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/setting',
    method: 'GET',
  }),

  updateById: (data: any): AxiosRequestConfig => ({
    url: `/v1/setting/update/${data.id}`,
    method: 'PUT',
    data,
  }),
}
