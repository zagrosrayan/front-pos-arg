/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ADD_PRINTER_LABEL,
  CANCEL_LABEL,
  CATEGORY_FOOD_LABEL,
  CREATE_LABEL,
  DELETE_ORDER_LABEL,
  FOOD_LABEL,
  LOCATION_LABEL,
  NAME_LABEL,
  PRINTERS_LIST_LABEL,
  PROFIT_MANAGER_LABEL,
  TYPE_LABEL,
  UPDATE_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { ARTICLE_API } from '@/routes/api/article'
import { FOOD_API } from '@/routes/api/food'
import { PRINTER_API } from '@/routes/api/printer'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'

import { PrinterRequestProps, PrinterResponseProps } from '@/types/printerTypes'
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
import FormSelect from '../../ui/FormSelect'
import DataTable, { ColumnsData } from '../DataTable'
import { toast } from 'react-toastify'
import { TYPE_API } from '@/routes/api/type'

const PrinterTable = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const methods = useForm<PrinterRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
      type: null,
    },
  })
  const updateMethods = useForm<PrinterRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
      type: null,
    },
  })
  const [selectedPrinter, setSelectedPrinter] =
    useState<PrinterResponseProps | null>(null)
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
    setFormKey((prev) => prev + 1)
  }, [profitManagerId, articleId])

  useEffect(() => {
    setUpdatedKey((prev) => prev + 1)
  }, [updateProfitManagerId, updateArticleId])

  const handleUpdateModalOpen = (printer: PrinterResponseProps) => {
    setSelectedPrinter(printer)
    updateMethods.reset({
      name: printer?.name,
      location: printer?.location,
      article_id: printer?.article,
      food_id: printer?.food,
      profit_manager_id: printer?.profit_manager,
      type: printer.type,
    })
    onOpen()
  }

  const handleCreatePrinter = async (data: any) => {
    try {
      setIsCreateLoading(true)
      const response = await apiRequest(PRINTER_API.create(data))
      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      methods.reset()
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<PrinterRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsCreateLoading(false)
    }
  }

  const handleUpdatePrinter = async (data: PrinterRequestProps) => {
    try {
      setIsUpdateLoading(true)
      const response = await apiRequest(PRINTER_API.updateById(data), {
        printer: selectedPrinter?.id,
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

  const columns: ColumnsData<PrinterResponseProps>[] = [
    {
      name: 'شناسه پرینتر',
      uid: 'id',
      render: (printer: PrinterResponseProps) => <span>{printer.id}</span>,
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (printer: PrinterResponseProps) => <span>{printer.name}</span>,
    },
    {
      name: LOCATION_LABEL,
      uid: 'location',
      render: (printer: PrinterResponseProps) => (
        <span>{printer.location ?? '-------'}</span>
      ),
    },
    {
      name: PROFIT_MANAGER_LABEL,
      uid: 'profit_manager_id',
      render: (printer: PrinterResponseProps) => (
        <span>
          {printer.profit_manager ? printer.profit_manager.name : '------'}
        </span>
      ),
    },
    {
      name: CATEGORY_FOOD_LABEL,
      uid: 'article_id',
      render: (printer: PrinterResponseProps) => (
        <span>{printer.article ? printer.article.name : '------'}</span>
      ),
    },
    {
      name: FOOD_LABEL,
      uid: 'food_id',
      render: (printer: PrinterResponseProps) => (
        <span>{printer.food ? printer.food.name : '------'}</span>
      ),
    },
    {
      name: TYPE_LABEL,
      uid: 'type',
      render: (printer: PrinterResponseProps) => (
        <span>{printer.type ? printer.type.name : '------'}</span>
      ),
    },
    {
      name: 'عملیات',
      uid: 'actions',
      render: (printer: PrinterResponseProps) => (
        <div className="relative flex items-center justify-start gap-2">
          <Tooltip content="ویرایش پرینتر" closeDelay={0} delay={0}>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-lg text-default-400 active:opacity-50"
              onPress={() => handleUpdateModalOpen(printer)}
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
            {ADD_PRINTER_LABEL} :
          </h1>
          <FormLayout<PrinterRequestProps>
            onSubmit={handleCreatePrinter}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            methods={methods}
          >
            <FormInput<PrinterRequestProps> name="name" label={NAME_LABEL} />
            <FormInput<PrinterRequestProps>
              name="location"
              label={LOCATION_LABEL}
            />
            <FormSelect<PrinterRequestProps>
              name="profit_manager_id"
              apiMethods={PROFIT_MANAGER_API}
              label={PROFIT_MANAGER_LABEL}
            />
            <FormSelect<PrinterRequestProps>
              name="article_id"
              apiMethods={ARTICLE_API}
              label={CATEGORY_FOOD_LABEL}
            />

            <FormSelect<PrinterRequestProps>
              name="food_id"
              apiMethods={FOOD_API}
              key={formKey}
              label={FOOD_LABEL}
              extraFilterParameters={{
                ...(articleId ? { article_id: articleId } : {}),
                ...(profitManagerId
                  ? { profit_manager_id: profitManagerId }
                  : {}),
              }}
            />
            <FormSelect<PrinterRequestProps>
              name="type"
              apiMethods={TYPE_API}
              label={TYPE_LABEL}
              extraFilterParameters={{ category: 'printer_type' }}
            />
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
        {PRINTERS_LIST_LABEL}
      </h2>
      <DataTable
        columns={columns}
        apiMethods={PRINTER_API}
        key={tableKey}
        dataTableId="printer_table"
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {DELETE_ORDER_LABEL}
              </ModalHeader>
              <FormLayout<PrinterRequestProps>
                onSubmit={handleUpdatePrinter}
                methods={updateMethods}
              >
                <ModalBody>
                  <FormInput<PrinterRequestProps>
                    name="name"
                    label={NAME_LABEL}
                  />
                  <FormInput<PrinterRequestProps>
                    name="location"
                    label={LOCATION_LABEL}
                  />
                  <FormSelect<PrinterRequestProps>
                    name="profit_manager_id"
                    apiMethods={PROFIT_MANAGER_API}
                    label={PROFIT_MANAGER_LABEL}
                  />
                  <FormSelect<PrinterRequestProps>
                    name="article_id"
                    apiMethods={ARTICLE_API}
                    label={CATEGORY_FOOD_LABEL}
                  />

                  <FormSelect<PrinterRequestProps>
                    name="food_id"
                    apiMethods={FOOD_API}
                    key={updatedKey}
                    label={FOOD_LABEL}
                    extraFilterParameters={{
                      ...(updateArticleId
                        ? { article_id: updateArticleId }
                        : {}),
                      ...(updateProfitManagerId
                        ? { profit_manager_id: updateProfitManagerId }
                        : {}),
                    }}
                  />
                  <FormSelect<PrinterRequestProps>
                    name="type"
                    apiMethods={TYPE_API}
                    label={TYPE_LABEL}
                    extraFilterParameters={{ category: 'printer_type' }}
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

export default PrinterTable
