import {
  LoginFormRequestProps,
  ResetPasswordRequestProps,
} from '@/types/authTypes'
import { AxiosRequestConfig } from 'axios'

export const AUTH_API = {
  login: (data: LoginFormRequestProps): AxiosRequestConfig => ({
    method: 'POST',
    url: '/v1/auth/login',
    data: data,
  }),
  resetPassword: (data: ResetPasswordRequestProps): AxiosRequestConfig => ({
    method: 'POST',
    url: '/v1/auth/reset-password',
    data: data,
  }),
  getUserInfo: (): AxiosRequestConfig => ({
    url: '/v1/user',
  }),
}
