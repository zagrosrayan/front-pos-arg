'use client'
import {
  NAME_LABEL,
  PROFIT_MANAGER_LABEL,
  ROLE_LABEL,
  USERNAME_LABEL,
  USERS_LABEL,
  USERS_LIST_LABEL,
} from '@/app/constant/label'
import { ASSIGN_ROLE_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { USER_API } from '@/routes/api/user'
import { ROLE_API } from '@/routes/api/role'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'

import { RoleAssignRequestProps } from '@/types/roleTypes'
import { UserInfoProps } from '@/types/userTypes'
import {
  handleApiErrors,
  isValidationErrorResponse,
} from '@/utils/handleApiError'
import { Button, Chip } from '@heroui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormSelect from '../../ui/FormSelect'
import DataTable, { ColumnsData } from '../DataTable'

const UserTable = () => {
  const methods = useForm<RoleAssignRequestProps>({
    mode: 'onChange',
  })
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (data: RoleAssignRequestProps) => {
    data.profit_manager_id = data.profit_manager_id.toString()
    console.log('ssss', data)
    try {
      setIsLoading(true)

      const response = await apiRequest(ROLE_API.assign(data))
      toast.success(response?.message)
      methods.reset()
      setTableKey((prev) => prev + 1)
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<RoleAssignRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const [tableKey, setTableKey] = useState(0)

  const columns: ColumnsData<UserInfoProps>[] = [
    {
      name: 'شناسه',
      uid: 'id',
      render: (user: UserInfoProps) => <span>{user.id}</span>,
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (user: UserInfoProps) => <span>{user.name ?? '-------'}</span>,
    },
    {
      name: USERNAME_LABEL,
      uid: 'username',
      render: (user: UserInfoProps) => (
        <span>{user.username ?? '-------'}</span>
      ),
    },
    {
      name: PROFIT_MANAGER_LABEL,
      uid: 'profit_manager',
      render: (user: UserInfoProps) => (
        <span>{user.profit_manager?.name ?? '-------'}</span>
      ),
    },
    {
      name: ROLE_LABEL,
      uid: 'role',
      render: (user: UserInfoProps) =>
        user.roles.length ? (
          <Chip>{user.roles[0]?.name ?? '-------'}</Chip>
        ) : (
          '---'
        ),
    },
  ]
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            {ASSIGN_ROLE_TEXT} :
          </h1>
          <FormLayout<RoleAssignRequestProps>
            onSubmit={handleSubmit}
            methods={methods}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
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
            <FormSelect<RoleAssignRequestProps>
              name="profit_manager_id"
              apiMethods={PROFIT_MANAGER_API}
              label={PROFIT_MANAGER_LABEL}
              keyIndex="id"
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
          </FormLayout>
        </div>
      </div>
      <h2 className="text-xl font-bold text-default-700">{USERS_LIST_LABEL}</h2>
      <DataTable
        columns={columns}
        apiMethods={USER_API}
        key={tableKey}
        dataTableId="user_table"
      />
    </div>
  )
}

export default UserTable
