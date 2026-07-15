/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import FormInput from '@/app/components/ui/FormInput'
import {
  LOGIN_LABEL,
  PASSWORD_LABEL,
  USERNAME_LABEL,
} from '@/app/constant/label'
import { setUserInfo } from '@/app/features/auth/authSlice'
import useAuth from '@/app/hook/useAuth'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { AUTH_API } from '@/routes/api/auth'
import { DASHBOARD_PATH } from '@/routes/path'
import {
  LoginFormRequestProps,
  LoginFormResponseProps,
} from '@/types/authTypes'
import { UserInfoProps } from '@/types/userTypes'
import {
  handleApiErrors,
  isValidationErrorResponse,
} from '@/utils/handleApiError'
import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'

const LoginForm = () => {
  const router = useRouter()
  const methods = useForm<LoginFormRequestProps>({ mode: 'onChange' })
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const [token, setToken] = useAuth()

  const handleLogin = async (data: LoginFormRequestProps) => {
    try {
      setIsLoading(true)
      const response = await apiRequest<LoginFormResponseProps>(
        AUTH_API.login(data)
      )
      // console.log('done here' + response?.data?.items?.token)

      setToken(response?.data.items.token as string)
      // console.log('done here'+response?.data.items.token);
      dispatch(setUserInfo(response?.data.items.user as UserInfoProps))
      router.push(DASHBOARD_PATH.MAIN)
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<LoginFormRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <FormLayout<LoginFormRequestProps>
      onSubmit={handleLogin}
      className="flex flex-col items-center"
      methods={methods}
    >
      <div className="mx-auto mt-8 w-full max-w-xs flex-1 space-y-8">
        <FormInput<LoginFormRequestProps>
          name="username"
          type="text"
          label={USERNAME_LABEL}
          isRequired
        />
        <FormInput<LoginFormRequestProps>
          name="password"
          type="password"
          label={PASSWORD_LABEL}
          isRequired
        />
        <Button
          color="success"
          className="text-white"
          type="submit"
          fullWidth
          size="lg"
          radius="sm"
          isLoading={isLoading}
        >
          {LOGIN_LABEL}
        </Button>
      </div>
    </FormLayout>
  )
}

export default LoginForm
