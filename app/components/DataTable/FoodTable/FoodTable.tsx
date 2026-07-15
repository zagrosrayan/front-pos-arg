// / eslint-disable @typescript-eslint/no-explicit-any /
import {
  ADD_FOOD_LABEL,
  CANCEL_LABEL,
  CATEGORY_FOOD_LABEL,
  CREATE_LABEL,
  EDIT_ORDER_LABEL,
  NAME_LABEL,
  FOOD_LIST_LABEL,
  PROFIT_MANAGER_LABEL,
  UPDATE_LABEL,
  PRICE_LABEL,
  DESCRIPTION_LABEl,
  TYPE_SLUG,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { ARTICLE_API } from '@/routes/api/article'
import { FOOD_API } from '@/routes/api/food'
import { FoodRequestProps, FoodResponseProps } from '@/types/foodTypes'
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
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import { toast } from 'react-toastify'
import TextInputWithDelay from '@/app/components/ui/SearchInputWithDelay/SearchInputWithDelay'

const FoodTable = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [filters, setFilters] = useState<{ name: string }>({ name: '' }) // Initial filters

  const methods = useForm<FoodRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
    },
    // اضافه کردن اعتبارسنجی
    criteriaMode: 'all',
    resolver: async (data) => {
      const errors: any = {}
      if (!data.name) {
        errors.name = 'نام غذا الزامی است.'
      }
      if (!data.slug) {
        errors.slug = 'اسلاگ غذا الزامی است.'
      }
      if (!data.price) {
        errors.price = 'قیمت غذا الزامی است.'
      }
      if (!data.description) {
        errors.description = 'قیمت غذا الزامی است.'
      }
      if (!data.article_id) {
        errors.article_id = 'دسته‌بندی غذا الزامی است.'
      }
      if (!data.profit_manager_id) {
        errors.profit_manager_id = 'مدیر سود الزامی است.'
      }
      return {
        values:
          errors.name ||
          errors.slug ||
          errors.price ||
          errors.article_id ||
          errors.profit_manager_id
            ? {}
            : data,
        errors,
      }
    },
  })

  const updateMethods = useForm<FoodRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
    },
  })
  const [selectedFood, setSelectedFood] = useState<FoodResponseProps | null>(
    null
  )
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

  const handleUpdateModalOpen = (food: FoodResponseProps) => {
    setSelectedFood(food)
    updateMethods.reset({
      name: food?.name,
      slug: food?.slug,
      price: food.price,
      description: food.description,

      article_id: food?.article,
      profit_manager_id: food?.profit_manager,
    })
    onOpen()
  }

  const handleCreateFood = async (data: any) => {
    if (
      !data.name ||
      !data.slug ||
      !data.price ||
      !data.article_id ||
      !data.profit_manager_id ||
      !data.description
    ) {
      toast.error('لطفاً همه فیلدها را تکمیل کنید.')
      return
    }

    data.article_id = data.article_id.toString()
    data.profit_manager_id = data.profit_manager_id.toString()
    data.price = data.price.toLocaleString()

    try {
      setIsCreateLoading(true)
      const response = await apiRequest(FOOD_API.create(data))

      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      methods.reset()
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<FoodRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsCreateLoading(false)
    }
  }

  const handleUpdateFood = async (data: FoodRequestProps) => {
    data.article_id = data.article_id ? data.article_id.toString() : ''
    data.profit_manager_id = data.profit_manager_id
      ? data.profit_manager_id.toString()
      : ''
    data.price = data.price.toLocaleString()

    try {
      setIsUpdateLoading(true)
      const response = await apiRequest(FOOD_API.updateById(data), {
        food: selectedFood?.id,
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

  const columns: ColumnsData<FoodResponseProps>[] = [
    {
      name: 'شناسه غذا',
      uid: 'id',
      render: (food: FoodResponseProps) => <span>{food.id}</span>,
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (food: FoodResponseProps) => <span>{food.name}</span>,
    },
    {
      name: TYPE_SLUG,
      uid: 'slug',
      render: (food: FoodResponseProps) => (
        <span>{food.slug ?? '-------'}</span>
      ),
    },

    {
      name: PRICE_LABEL,
      uid: 'price',
      render: (food: FoodResponseProps) => (
        <span>
          {food.price ? Number(food.price).toLocaleString() : '------'}
        </span>
      ),
    },
    {
      name: DESCRIPTION_LABEl,
      uid: 'description',
      render: (food: FoodResponseProps) => <span>{food.name}</span>,
    },
    {
      name: CATEGORY_FOOD_LABEL,
      uid: 'article_id',
      render: (food: FoodResponseProps) => (
        <span>{food.article ? food.article.name : '------'}</span>
      ),
    },
    {
      name: PROFIT_MANAGER_LABEL,
      uid: 'profit_manager_id',
      render: (food: FoodResponseProps) => (
        <span>{food.profit_manager ? food.profit_manager.name : '------'}</span>
      ),
    },
    {
      name: 'عملیات',
      uid: 'actions',
      render: (food: FoodResponseProps) => (
        <div className="relative flex items-center justify-start gap-2">
          <Tooltip content="ویرایش وضعیت" closeDelay={0} delay={0}>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-lg text-default-400 active:opacity-50"
              onPress={() => handleUpdateModalOpen(food)}
            >
              <TbEdit />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]

  const formatPrice = (value: string) => {
    // فقط اعداد را از ورودی جدا می‌کنیم
    const numericValue = value.replace(/\D/g, '')

    // فرمت‌دهی به عدد با سه رقم جدا
    return numericValue ? Number(numericValue).toLocaleString() : ''
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            {ADD_FOOD_LABEL} :
          </h1>
          <FormLayout<FoodRequestProps>
            onSubmit={handleCreateFood}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            methods={methods}
          >
            <FormInput<FoodRequestProps> name="name" label={NAME_LABEL} />
            <FormInput<FoodRequestProps> name="slug" label={TYPE_SLUG} />

            <FormInput<FoodRequestProps>
              name="price"
              type="number"
              label={PRICE_LABEL}
              value={methods.getValues('price')}
              onChange={(e) => {
                const formattedValue = formatPrice(e.target.value)
                methods.setValue('price', formattedValue)
              }}
              onBlur={() => {
                const value = methods.getValues('price')
                if (!/^\d+$/.test(value.replace(/,/g, ''))) {
                  methods.setError('price', {
                    type: 'manual',
                    message: 'لطفاً فقط عداد وارد کنید.',
                  })
                }
              }}
            />
            <FormInput<FoodRequestProps>
              name="description"
              label={DESCRIPTION_LABEl}
            />

            <FormSelect<FoodRequestProps>
              name="article_id"
              apiMethods={ARTICLE_API}
              label={CATEGORY_FOOD_LABEL}
            />

            <FormSelect<FoodRequestProps>
              name="profit_manager_id"
              apiMethods={PROFIT_MANAGER_API}
              label={PROFIT_MANAGER_LABEL}
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
      <h2 className="text-xl font-bold text-default-700">{FOOD_LIST_LABEL}</h2>
      <div className="sticky top-0 z-20 h-fit w-full bg-white pb-2 md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
        <TextInputWithDelay
          setValue={(value) => {
            setFilters({ name: value })
          }}
        />
      </div>
      <DataTable
        columns={columns}
        apiMethods={FOOD_API}
        key={tableKey}
        dataTableId="food_table"
        extraFilterParameters={filters}
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {EDIT_ORDER_LABEL}
              </ModalHeader>
              <FormLayout<FoodRequestProps>
                onSubmit={handleUpdateFood}
                methods={updateMethods}
              >
                <ModalBody>
                  <FormInput<FoodRequestProps> name="name" label={NAME_LABEL} />
                  <FormInput<FoodRequestProps> name="slug" label={TYPE_SLUG} />
                  <FormInput<FoodRequestProps>
                    name="price"
                    type="number"
                    label={PRICE_LABEL}
                  />
                  <FormInput<FoodRequestProps>
                    name="description"
                    label={DESCRIPTION_LABEl}
                  />

                  <FormSelect<FoodRequestProps>
                    name="article_id"
                    apiMethods={ARTICLE_API}
                    label={CATEGORY_FOOD_LABEL}
                  />
                  <FormSelect<FoodRequestProps>
                    name="profit_manager_id"
                    apiMethods={PROFIT_MANAGER_API}
                    label={PROFIT_MANAGER_LABEL}
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

export default FoodTable
