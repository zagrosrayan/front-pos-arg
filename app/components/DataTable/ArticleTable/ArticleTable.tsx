/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CANCEL_LABEL,
  CREATE_LABEL,
  TYPE_SLUG,
  NAME_LABEL,
  CATEGORY_FOOD_LABEL,
  FOOD_LIST,
  UPDATE_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { ARTICLE_API } from '@/routes/api/article'
import { ArticleRequestProps, ArticleResponseProps } from '@/types/articleTypes'
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

const ArticleTable = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const methods = useForm<ArticleRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
      type: null,
    },
  })
  const updateMethods = useForm<ArticleRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
      type: null,
    },
  })
  const [selectedArticle, setSelectedArticle] =
    useState<ArticleResponseProps | null>(null)
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  const [isUpdateLoading, setIsUpdateLoading] = useState(false)
  const [tableKey, setTableKey] = useState(0)
  const [formKey, setFormKey] = useState(0)
  const [updatedKey, setUpdatedKey] = useState(0)

  // const profitManagerId = methods.watch('profit_manager_id')
  // const articleId = methods.watch('article_id')

  // const updateProfitManagerId = updateMethods.watch('profit_manager_id')
  // const updateArticleId = updateMethods.watch('article_id')

  useEffect(() => {
    if (formKey || updatedKey) {
      //test
    }
  }, [formKey, updatedKey])

  useEffect(() => {
    setFormKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    setUpdatedKey((prev) => prev + 1)
  }, [])

  const handleUpdateModalOpen = (article: ArticleResponseProps) => {
    setSelectedArticle(article)
    updateMethods.reset({
      name: article?.name,
      slug: article?.slug,
      type: article.type,
    })
    onOpen()
  }

  const handleCreateArticle = async (data: any) => {
    try {
      setIsCreateLoading(true)
      const response = await apiRequest(ARTICLE_API.create(data))
      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      methods.reset()
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<ArticleRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsCreateLoading(false)
    }
  }

  const handleUpdateArticle = async (data: ArticleRequestProps) => {
    try {
      setIsUpdateLoading(true)
      const response = await apiRequest(ARTICLE_API.updateById(data), {
        article: selectedArticle?.id,
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

  const columns: ColumnsData<ArticleResponseProps>[] = [
    {
      name: 'ایجاد دسته بندی غذا ',
      uid: 'id',
      render: (article: ArticleResponseProps) => <span>{article.id}</span>,
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (article: ArticleResponseProps) => <span>{article.name}</span>,
    },
    {
      name: TYPE_SLUG,
      uid: 'slug',
      render: (article: ArticleResponseProps) => (
        <span>{article.slug ?? '-------'}</span>
      ),
    },

    {
      name: 'عملیات',
      uid: 'actions',
      render: (article: ArticleResponseProps) => (
        <div className="relative flex items-center justify-start gap-2">
          <Tooltip content="ویرایش وضعیت" closeDelay={0} delay={0}>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-lg text-default-400 active:opacity-50"
              onPress={() => handleUpdateModalOpen(article)}
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
            {CATEGORY_FOOD_LABEL} :
          </h1>
          <FormLayout<ArticleRequestProps>
            onSubmit={handleCreateArticle}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            methods={methods}
          >
            <FormInput<ArticleRequestProps> name="name" label={NAME_LABEL} />
            <FormInput<ArticleRequestProps> name="slug" label={TYPE_SLUG} />

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
      <h2 className="text-xl font-bold text-default-700">{FOOD_LIST}</h2>
      <DataTable<ArticleResponseProps>
        columns={columns}
        apiMethods={ARTICLE_API}
        key={tableKey}
        dataTableId="article_table"
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {UPDATE_LABEL}
              </ModalHeader>
              <FormLayout<ArticleRequestProps>
                onSubmit={handleUpdateArticle}
                methods={updateMethods}
              >
                <ModalBody>
                  <FormInput<ArticleRequestProps>
                    name="name"
                    label={NAME_LABEL}
                  />
                  <FormInput<ArticleRequestProps>
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

export default ArticleTable
