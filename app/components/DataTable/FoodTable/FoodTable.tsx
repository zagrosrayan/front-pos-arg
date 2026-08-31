/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { TbEdit } from 'react-icons/tb'
import FormInput from '../../ui/FormInput'
import FormSelect from '../../ui/FormSelect'
import DataTable, { ColumnsData } from '../DataTable'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import { toast } from 'react-toastify'
import TextInputWithDelay from '@/app/components/ui/SearchInputWithDelay/SearchInputWithDelay'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const getSelectId = (
  value: string | number | null | undefined | { id?: string | number | null }
) => {
  if (value === null || value === undefined) return ''

  if (typeof value === 'object') {
    return value.id !== null && value.id !== undefined ? String(value.id) : ''
  }

  return String(value)
}

const normalizePrice = (value: string | number | null | undefined) =>
  String(value ?? '')
    .replace(/,/g, '')
    .trim()

const buildFoodFormData = (
  data: FoodRequestProps,
  image: File | null,
  spoofPut = false
) => {
  const formData = new FormData()

  formData.append('name', data.name ?? '')
  formData.append('slug', data.slug ?? '')
  formData.append('price', normalizePrice(data.price))
  formData.append('description', data.description ?? '')
  formData.append('article_id', getSelectId(data.article_id))
  formData.append('profit_manager_id', getSelectId(data.profit_manager_id))

  if (data.status !== null && data.status !== undefined) {
    formData.append('status', String(data.status))
  }

  if (image) {
    formData.append('image', image)
  }

  if (spoofPut) {
    formData.append('_method', 'PUT')
  }

  return formData
}

const FoodImageField = ({
  label,
  file,
  existingUrl,
  onChange,
}: {
  label: string
  file: File | null
  existingUrl?: string | null
  onChange: (file: File | null) => void
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingUrl ?? null
  )

  useEffect(() => {
    if (!file) {
      setPreviewUrl(existingUrl ?? null)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file, existingUrl])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null

    if (!selectedFile) {
      onChange(null)
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('فرمت تصویر باید JPG، PNG یا WEBP باشد.')
      event.target.value = ''
      onChange(null)
      return
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.')
      event.target.value = ''
      onChange(null)
      return
    }

    onChange(selectedFile)
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-sm text-default-600">{label}</span>

      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-medium border border-default-200 bg-default-50 px-3 py-2 transition hover:border-default-400">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="پیش‌نمایش تصویر غذا"
            className="size-12 shrink-0 rounded-medium object-cover"
          />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-medium bg-default-100 text-xs text-default-500">
            بدون عکس
          </span>
        )}

        <span className="min-w-0 text-sm text-default-600">
          {file ? file.name : existingUrl ? 'تعویض تصویر' : 'انتخاب تصویر'}
          <span className="mt-1 block text-[11px] text-default-400">
            JPG / PNG / WEBP — حداکثر ۵MB
          </span>
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {file && (
        <Button
          type="button"
          size="sm"
          variant="light"
          color="danger"
          className="w-fit"
          onPress={() => onChange(null)}
        >
          حذف انتخاب
        </Button>
      )}
    </div>
  )
}

const FoodTable = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [filters, setFilters] = useState<{ name: string }>({ name: '' })

  const methods = useForm<FoodRequestProps>({
    mode: 'onChange',
    defaultValues: {
      status: null,
    },
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
        errors.description = 'توضیحات غذا الزامی است.'
      }
      if (!data.article_id) {
        errors.article_id = 'دسته‌بندی غذا الزامی است.'
      }
      if (!data.profit_manager_id) {
        errors.profit_manager_id = 'مرکز درآمد الزامی است.'
      }

      return {
        values:
          errors.name ||
          errors.slug ||
          errors.price ||
          errors.description ||
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
  const [createImage, setCreateImage] = useState<File | null>(null)
  const [updateImage, setUpdateImage] = useState<File | null>(null)
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
      // نگه‌داشتن رفتار فعلی فرم‌های select
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
    setUpdateImage(null)

    updateMethods.reset({
      name: food.name,
      slug: food.slug,
      price: food.price,
      description: food.description,
      status: food.status,
      article_id: food.article,
      profit_manager_id: food.profit_manager,
      food_id: food.id,
      image: null,
    })

    onOpen()
  }

  const handleCreateFood = async (data: FoodRequestProps) => {
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

    try {
      setIsCreateLoading(true)

      const formData = buildFoodFormData(data, createImage)
      const response = await apiRequest(FOOD_API.create(formData))

      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      setCreateImage(null)
      methods.reset({
        status: null,
      })
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
    if (!selectedFood?.id) {
      toast.error('غذای انتخاب‌شده معتبر نیست.')
      return
    }

    try {
      setIsUpdateLoading(true)

      const formData = buildFoodFormData(data, updateImage, true)
      const response = await apiRequest(FOOD_API.updateById(formData), {
        food: selectedFood.id,
      })

      toast.success(response?.message)
      setTableKey((prev) => prev + 1)
      setUpdateImage(null)
      setSelectedFood(null)
      onClose()
    } catch (error) {
      console.error(error)

      if (isValidationErrorResponse<FoodRequestProps>(error)) {
        handleApiErrors(error, updateMethods.setError)
      }
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
      name: 'تصویر',
      uid: 'image',
      render: (food: FoodResponseProps) =>
        food.image_url ? (
          <img
            src={food.image_url}
            alt={food.name}
            className="size-14 rounded-medium border border-default-100 object-cover"
          />
        ) : (
          <span className="text-xs text-default-400">بدون تصویر</span>
        ),
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
      render: (food: FoodResponseProps) => (
        <span className="line-clamp-2 max-w-72">
          {food.description || '------'}
        </span>
      ),
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
          <Tooltip content="ویرایش غذا" closeDelay={0} delay={0}>
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
    const numericValue = value.replace(/\D/g, '')
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
                    message: 'لطفاً فقط عدد وارد کنید.',
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

            <FoodImageField
              label="تصویر غذا"
              file={createImage}
              onChange={setCreateImage}
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
          {(modalOnClose) => (
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

                  <FoodImageField
                    label="تصویر غذا"
                    file={updateImage}
                    existingUrl={selectedFood?.image_url}
                    onChange={setUpdateImage}
                  />
                </ModalBody>

                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      setUpdateImage(null)
                      setSelectedFood(null)
                      modalOnClose()
                    }}
                  >
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
