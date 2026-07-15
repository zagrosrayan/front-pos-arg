/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CANCEL_LABEL,
  CREATE_LABEL,
  EDIT_ORDER_LABEL,
  TYPE_SLUG,
  NAME_LABEL,
  PROFIT_MANAGER_LABEL,
  PROFIT_MANAGER_LIST,
  UPDATE_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import { ProfitRequestProps, ProfitResponseProps } from '@/types/profitTypes'
import {
  handleApiErrors,
  isValidationErrorResponse,
} from '@/utils/handleApiError'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { TbEdit } from 'react-icons/tb'
import FormInput from '../../ui/FormInput'
import DataTable, { ColumnsData } from '../DataTable'
import { toast } from 'react-toastify'

const ProfitTable = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const methods = useForm<ProfitRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
      type: null,
    },
  })
  const updateMethods = useForm<ProfitRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
      type: null,
    },
  })
  const [selectedProfit, setSelectedProfit] =
    useState<ProfitResponseProps | null>(null)
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  const [isUpdateLoading, setIsUpdateLoading] = useState(false)
  const [tableKey, setTableKey] = useState(0)
  const [formKey, setFormKey] = useState(0)
  const [updatedKey, setUpdatedKey] = useState(0)

  const profitManagerId = methods.watch('profit_manager_id')
  const articleId = methods.watch('article_id')

  const updateProfitManagerId = updateMethods.watch('profit_manager_id')
  const updateArticleId = updateMethods.watch('article_id')

  useEffect(() => {
    if (formKey || updatedKey) {
      //test
    }
  }, [formKey, updatedKey])

  useEffect(() => {
    setFormKey((prev) => prev + 1)
  }, [profitManagerId, articleId])

  useEffect(() => {
    setUpdatedKey((prev) => prev + 1)
  }, [updateProfitManagerId, updateArticleId])

  const handleUpdateModalOpen = (profit: ProfitResponseProps) => {
    setSelectedProfit(profit)
    updateMethods.reset({
      name: profit?.name,
      slug: profit?.slug,

      type: profit.type,
    })
    onOpen()
  }

  const handleCreateProfit = async (data: any) => {
    try {
      setIsCreateLoading(true)
      const response = await apiRequest(PROFIT_MANAGER_API.create(data))
      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      methods.reset()
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<ProfitRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsCreateLoading(false)
    }
  }

  const handleUpdateProfit = async (data: ProfitRequestProps) => {
    try {
      setIsUpdateLoading(true)
      const response = await apiRequest(PROFIT_MANAGER_API.updateById(data), {
        profit: selectedProfit?.id,
      })
      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdateLoading(false)
    }
  }

  const columns: ColumnsData<ProfitResponseProps>[] = [
    {
      name: 'شناسه مرکز درآمد ',
      uid: 'id',
      render: (profit: ProfitResponseProps) => <span>{profit.id}</span>,
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (profit: ProfitResponseProps) => <span>{profit.name}</span>,
    },
    {
      name: TYPE_SLUG,
      uid: 'slug',
      render: (profit: ProfitResponseProps) => (
        <span>{profit.slug ?? '-------'}</span>
      ),
    },

    {
      name: 'عملیات',
      uid: 'actions',
      render: (profit: ProfitResponseProps) => (
        <div className="relative flex items-center justify-start gap-2">
          <Tooltip content="ویرایش وضعیت" closeDelay={0} delay={0}>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-lg text-default-400 active:opacity-50"
              onPress={() => handleUpdateModalOpen(profit)}
            >
              <TbEdit />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            {PROFIT_MANAGER_LABEL} :
          </h1>
          <FormLayout<ProfitRequestProps>
            onSubmit={handleCreateProfit}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            methods={methods}
          >
            <FormInput<ProfitRequestProps> name="name" label={NAME_LABEL} />
            <FormInput<ProfitRequestProps> name="slug" label={TYPE_SLUG} />

            <Button
              color="success"
              size="lg"
              type="submit"
              className="my-auto w-fit text-white"
              radius="sm"
              isLoading={isCreateLoading}
            >
              {CREATE_LABEL}
            </Button>
          </FormLayout>
        </div>
      </div>
      <h2 className="text-xl font-bold text-default-700">
        {PROFIT_MANAGER_LIST}
      </h2>
      <DataTable
        columns={columns}
        apiMethods={PROFIT_MANAGER_API}
        key={tableKey}
        dataTableId="profit_table"
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {EDIT_ORDER_LABEL}
              </ModalHeader>
              <FormLayout<ProfitRequestProps>
                onSubmit={handleUpdateProfit}
                methods={updateMethods}
              >
                <ModalBody>
                  <FormInput<ProfitRequestProps>
                    name="name"
                    label={NAME_LABEL}
                  />
                  <FormInput<ProfitRequestProps>
                    name="slug"
                    label={TYPE_SLUG}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    {CANCEL_LABEL}
                  </Button>
                  <Button
                    color="success"
                    type="submit"
                    isLoading={isUpdateLoading}
                    className="text-white"
                  >
                    {UPDATE_LABEL}
                  </Button>
                </ModalFooter>
              </FormLayout>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ProfitTable
