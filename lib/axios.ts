/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_REQUEST_ERROR } from '@/app/constant/error'
import { AUTH_PATH } from '@/routes/path'
import { ApiResponseType } from '@/types/apiTypes'
import { preprocessData } from '@/utils/handleData'
import { processUrl } from '@/utils/processUrl'
import { storageManager } from '@/utils/storage/StorageManager'
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
} from 'axios'
import { toast } from 'react-toastify'

export const TOKEN_KEY = 'auth_token'

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || '',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to include custom headers
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? storageManager.getItem('local', TOKEN_KEY as string)
      : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// API request function
const apiRequest = async <T>(
  config: AxiosRequestConfig,
  params?: Record<string, any> | null,
  payload?: { silent?: boolean; optionalKeys?: (keyof T)[] }
): Promise<ApiResponseType<T> | null> => {
  try {
    if (config.url) {
      config.url = processUrl(config.url, params || {})
    }

    if (config.data) {
      config.data = preprocessData(config.data, payload?.optionalKeys)
    }

    // Make the API request
    const { data: response } = (await apiClient.request<T>(
      config
    )) as AxiosResponse<ApiResponseType<T>>

    return response
  } catch (error: any) {
    if (error?.response?.status === 422) {
      const errorData = error?.response?.data
      const validationErrors = errorData?.data?.items
      const directErrors = errorData?.errors

      if (validationErrors) {
        Object.values(validationErrors).forEach((errorMessages) => {
          if (Array.isArray(errorMessages)) {
            errorMessages.forEach((message) => {
              toast.error(message)
            })
          }
        })
      } else if (directErrors && Array.isArray(directErrors)) {
        directErrors.forEach((message: string) => {
          toast.error(message)
        })
      } else {
        toast.error(errorData?.message || 'خطا در اعتبارسنجی داده‌ها')
      }
    }
    if (axios.isCancel(error)) {
      console.warn('Request was canceled:', error.message)
      return null
    } else if (axios.isAxiosError(error)) {
      if (error.response) {
        const { data: response } = error.response as AxiosResponse<
          ApiResponseType<T>
        >

        if (response) {
          if (
            [HttpStatusCode.Unauthorized].includes(
              error.status as HttpStatusCode
            ) &&
            window.location.pathname != AUTH_PATH.LOGIN
          ) {
            storageManager.removeItem('local', TOKEN_KEY)
            window.location.href = AUTH_PATH.LOGIN
          } else if (
            [HttpStatusCode.Forbidden].includes(
              error.status as HttpStatusCode
            ) &&
            window.location.pathname != AUTH_PATH.LOGIN
          ) {
            toast.error(response.message)
          } else {
            if (response.message && !payload?.silent) {
              toast.error(response.message)
            }
          }
        } else if (process.env.NODE_ENV == 'development' && !payload?.silent) {
          console.error(error)
          toast.error(error.message as string)
        } else if (!payload?.silent) {
          toast.error(API_REQUEST_ERROR)
        }

        // Throw the response data for custom handling
        throw response ?? undefined
      } else if (!payload?.silent) {
        toast.error(API_REQUEST_ERROR)
        throw error.response ?? 'An error occurred during the API request.'
      } else {
        throw error.response ?? 'An error occurred during the API request.'
      }
    } else {
      console.error('Non-Axios error:', error)
      throw new Error('An error occurred during the API request.')
    }
  }
}

async function downloadFile(config: AxiosRequestConfig, filename: string) {
  try {
    const response = await apiClient.request<Blob>({
      ...config,
      responseType: 'blob', // force blob for file downloads
    })

    const blob = new Blob([response.data])
    const fileURL = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = fileURL
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('File download failed:', error)
    throw error
  }
}

export { apiClient, apiRequest, downloadFile }
