import { AxiosRequestConfig } from 'axios'

export const USER_RESIDENT_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/user/guest',
  }),
}

export const USER_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/user/list',
  }),
}
