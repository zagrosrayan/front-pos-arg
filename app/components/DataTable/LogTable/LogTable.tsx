'use client'
import {
  DATE_LABEL,
  NAME_LABEL,
  OPERATION_LABEL,
  REPORT_LABEL,
  STATUS_LABEL,
  USER_LOG_LABEL,
  USERNAME_LABEL,
} from '@/app/constant/label'
import { REPORTING_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { LOG_API } from '@/routes/api/log'
import { TYPE_API } from '@/routes/api/type'
import { USER_API } from '@/routes/api/user'
import { LogResponseProps } from '@/types/logTypes'
import { Button } from '@heroui/react'
import { useState } from 'react'
import FormDatePicker from '../../ui/FormDatePicker'
import FormInput from '../../ui/FormInput'
import FormSelect from '../../ui/FormSelect'
import DataTable, { ColumnsData } from '../DataTable'
import { useForm } from 'react-hook-form'

const LogTable = () => {
  const [filters, setFilters] = useState({}) // Initial filters
  const [currentKey, setCurrentKey] = useState(0) // Initial filters
  const methods = useForm()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    const updatedFilters = { ...filters, ...data }
    setFilters(updatedFilters)
    setCurrentKey((prev) => prev + 1)
  }

  const columns: ColumnsData<LogResponseProps>[] = [
    {
      name: 'کد',
      uid: 'code',
      render: (log: LogResponseProps) => <span>{log.id}</span>,
    },
    {
      name: 'تاریخ',
      uid: 'date',
      render: (log: LogResponseProps) => (
        <span dir="ltr">
          {new Date(log.date as string).toLocaleString('fa-IR')}
        </span>
      ),
    },
    {
      name: USERNAME_LABEL,
      uid: 'username',
      render: (log: LogResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {log.user.username}
        </span>
      ),
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (log: LogResponseProps) => (
        <span className="whitespace-nowrap">{log.user.name}</span>
      ),
    },
    {
      name: STATUS_LABEL,
      uid: 'status',
      render: (log: LogResponseProps) => <span>{log.status_type.name}</span>,
    },
    {
      name: OPERATION_LABEL,
      uid: 'operation',
      render: (log: LogResponseProps) => <span>{log.operation_type.name}</span>,
    },
    {
      name: 'ماژول',
      uid: 'module',
      render: (log: LogResponseProps) => <span>{log.loggable_type}</span>,
    },
    {
      name: 'IP',
      uid: 'ip',
      render: (log: LogResponseProps) => <span>{log.ip}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            {REPORTING_TEXT} :
          </h1>
          <FormLayout
            onSubmit={handleFormSubmit}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            methods={methods}
          >
            <FormSelect
              name="user_id"
              apiMethods={USER_API}
              label={USERNAME_LABEL}
              keyIndex="id"
              valueIndex="id"
              labelIndex="username"
            />
            <FormSelect
              name="status"
              apiMethods={TYPE_API}
              label={STATUS_LABEL}
              extraFilterParameters={{ category: 'log_status' }}
              keyIndex="id"
              valueIndex="id"
              labelIndex="name"
            />
            <FormSelect
              name="operation"
              apiMethods={TYPE_API}
              label={OPERATION_LABEL}
              extraFilterParameters={{ category: 'log_operation' }}
              keyIndex="id"
              valueIndex="id"
              labelIndex="name"
            />
            <FormDatePicker name="date" label={DATE_LABEL} />
            <FormInput name="ip" label="IP" />
            <Button
              color="success"
              size="lg"
              type="submit"
              radius="sm"
              className="my-auto w-fit text-white"
            >
              {REPORT_LABEL}
            </Button>
          </FormLayout>
        </div>
      </div>
      <h2 className="text-xl font-bold text-default-700">{USER_LOG_LABEL}</h2>
      <DataTable
        columns={columns}
        apiMethods={LOG_API}
        key={currentKey}
        dataTableId="log_table"
        extraFilterParameters={filters}
      />
    </div>
  )
}

export default LogTable
