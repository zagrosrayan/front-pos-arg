import { AxiosRequestConfig } from 'axios'

export const ARTICLE_API = {
  getAll: (): AxiosRequestConfig => ({
    url: '/v1/article/list',
  }),
  create: (data: any): AxiosRequestConfig => ({
    url: '/v1/article/create',
    method: 'POST',
    data,
  }),
  updateById: (data: any): AxiosRequestConfig => ({
    url: '/v1/article/update/{article}',
    method: 'PUT',
    data,
  }),
}
