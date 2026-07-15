'use client'

import FormInput from '@/app/components/ui/FormInput'
import { LOGIN_LABEL, PASSWORD_LABEL } from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { ResetPasswordRequestProps } from '@/types/authTypes'
import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
// import { useForm } from 'react-hook-form'

const ResetPasswordForm = () => {
  const router = useRouter()
  const methods = useForm<ResetPasswordRequestProps>()

  //   const methods = useForm<LoginFormRequestProps>({ mode: 'onChange' })
  return (
    <FormLayout<ResetPasswordRequestProps>
      onSubmit={() => router.push('/dashboard')}
      className="flex flex-col items-center"
      methods={methods}
    >
      <div className="mx-auto mt-8 w-full max-w-xs flex-1 space-y-8">
        <FormInput<ResetPasswordRequestProps>
          name="password"
          type={'password'}
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
        >
          {LOGIN_LABEL}
        </Button>
      </div>
    </FormLayout>
  )
}

export default ResetPasswordForm
