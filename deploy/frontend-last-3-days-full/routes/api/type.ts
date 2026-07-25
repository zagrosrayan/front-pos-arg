import { AxiosRequestConfig } from 'axios'

export const TYPE_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/type/list',
  }),
}
