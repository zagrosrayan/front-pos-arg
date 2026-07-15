'use client'

import { ROLE_LABEL, USERS_LABEL } from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'

import { ASSIGN_ROLE_TEXT } from '@/app/constant/text'
import { ROLE_API } from '@/routes/api/role'
import { USER_API } from '@/routes/api/user'
import { RoleAssignRequestProps } from '@/types/roleTypes'
import {
  handleApiErrors,
  isValidationErrorResponse,
} from '@/utils/handleApiError'
import { Button } from '@heroui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormSelect from '../../ui/FormSelect'

const AssignRoleForm = () => {
  const methods = useForm<RoleAssignRequestProps>({
    mode: 'onChange',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: RoleAssignRequestProps) => {
    try {
      setIsLoading(true)
      const response = await apiRequest(ROLE_API.assign(data))
      toast.success(response?.message)
      methods.reset()
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<RoleAssignRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <FormLayout<RoleAssignRequestProps>
      onSubmit={handleSubmit}
      methods={methods}
    >
      <h1 className="text-2xl font-bold">{ASSIGN_ROLE_TEXT}</h1>
      <div className="mx-auto mt-8 w-full max-w-xs flex-1 space-y-8">
        <FormSelect<RoleAssignRequestProps>
          name="users"
          apiMethods={USER_API}
          label={USERS_LABEL}
          keyIndex="id"
          valueIndex="id"
          labelIndex="username"
          selectionMode="multiple"
        />
        <FormSelect<RoleAssignRequestProps>
          name="role"
          apiMethods={ROLE_API}
          label={ROLE_LABEL}
          keyIndex="name"
          valueIndex="name"
          labelIndex="name"
        />

        <Button
          color="success"
          className="text-white"
          fullWidth
          type="submit"
          size="lg"
          radius="sm"
          isLoading={isLoading}
        >
          {ASSIGN_ROLE_TEXT}
        </Button>
      </div>
    </FormLayout>
  )
}

export default AssignRoleForm
