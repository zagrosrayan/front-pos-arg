'use client'

import TextInputWithDelay from '@/app/components/ui/SearchInputWithDelay/SearchInputWithDelay'
import {
  ACCEPT_LABEL,
  CODE_LABEL,
  CREATE_DISCOUNT_CODE_LABEL,
  DISCOUNT_INFO_LABEL,
  DISCOUNT_LABEL,
  EXPIRED_DATE_LABEL,
  MINIMUM_PRICE_LABEL,
  NAME_LABEL,
  START_DATE_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { GLOBAL_DISCOUNT_API } from '@/routes/api/discount'
import {
  GlobalDiscountRequestProps,
  GlobalDiscountResponseProps,
} from '@/types/discountTypes'
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
  Snippet,
  useDisclosure,
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import FormDatePicker from '@/app/components/ui/FormDatePicker'
import FormInput from '@/app/components/ui/FormInput'
import FormNumberInput from '@/app/components/ui/FormNumberInput'
import SwitchField from '@/app/components/ui/SwitchField'
import DataTable, { ColumnsData } from '@/app/components/DataTable/DataTable'
import { copyToClipboard, withEndOfDay, withStartOfDay } from '@/utils'

interface ItemsType {
  items: GlobalDiscountResponseProps
}

const GlobalDiscountTable = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const deleteDisclosure = useDisclosure()

  const methods = useForm<GlobalDiscountRequestProps>({
    mode: 'onChange',
    defaultValues: { is_unlimited: true, is_special: false },
  })

  const unlimitedValue = methods.watch('is_unlimited')

  const [isLoading, setIsLoading] = useState(false)
  const [discountData, setDiscountData] =
    useState<GlobalDiscountResponseProps | null>(null)

  // کلید رفرش جدول
  const [tableKey, setTableKey] = useState(0)
  const [filters, setFilters] = useState<{ name: string }>({ name: '' })

  // استیت‌های لوکال برای دکمه‌ها
  const [toggleLoadingStates, setToggleLoadingStates] = useState<
    Record<number, boolean>
  >({})
  const [deleteLoadingStates, setDeleteLoadingStates] = useState<
    Record<number, boolean>
  >({})

  // استیت برای ذخیره تغییرات لوکال (برای اینکه بدون رفرش جدول، وضعیت دکمه عوض شود)
  // کلید: آیدی، مقدار: وضعیت جدید (true/false)
  const [localStatusOverrides, setLocalStatusOverrides] = useState<
    Record<number, boolean>
  >({})

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeletingModal, setIsDeletingModal] = useState(false)

  useEffect(() => {}, [filters, filters.name])

  const handleSubmit = async (data: GlobalDiscountRequestProps) => {
    try {
      setIsLoading(true)

      const payload = {
        ...data,
        discount_value: Number(String(data.discount_value).replace(/,/g, '')),
      }

      if (payload.is_unlimited) {
        payload.starts_at = ''
        payload.expires_at = ''
      }

      if (payload.starts_at) {
        payload.starts_at = withStartOfDay(payload.starts_at)
      }
      if (payload.expires_at) {
        payload.expires_at = withEndOfDay(payload.expires_at)
      }

      const response = await apiRequest<ItemsType>(
        GLOBAL_DISCOUNT_API.create(payload)
      )

      if (response) {
        methods.reset()
        setDiscountData(response?.data.items as GlobalDiscountResponseProps)
        onOpen()
        setTableKey((prev) => prev + 1) // برای آیتم جدید مجبوریم رفرش کنیم
      }
    } catch (error) {
      if (isValidationErrorResponse<GlobalDiscountRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      } else {
        console.error(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      setToggleLoadingStates((prev) => ({ ...prev, [id]: true }))

      const response = await apiRequest(GLOBAL_DISCOUNT_API.toggleActive(id))

      if (response) {
        // به جای رفرش کل جدول، فقط وضعیت این آیتم را لوکال آپدیت می‌کنیم
        setLocalStatusOverrides((prev) => ({ ...prev, [id]: !currentStatus }))
      }
    } catch (error) {
      console.error('Toggle active failed:', error)
    } finally {
      setToggleLoadingStates((prev) => ({ ...prev, [id]: false }))
    }
  }

  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    deleteDisclosure.onOpen()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      setIsDeletingModal(true)
      setDeleteLoadingStates((prev) => ({ ...prev, [deleteId]: true }))

      const response = await apiRequest(GLOBAL_DISCOUNT_API.delete(deleteId))

      if (response) {
        // برای حذف مجبوریم جدول را رفرش کنیم تا ردیف حذف شود
        setTableKey((prev) => prev + 1)
        deleteDisclosure.onClose()
      }
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeletingModal(false)
      setDeleteLoadingStates((prev) => ({ ...prev, [deleteId]: false }))
    }
  }

  const columns: ColumnsData<GlobalDiscountResponseProps>[] = [
    {
      name: 'شناسه',
      uid: 'id',
      render: (discount: GlobalDiscountResponseProps) => (
        <span>{discount.id}</span>
      ),
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (discount: GlobalDiscountResponseProps) => (
        <span>{discount.name}</span>
      ),
    },
    {
      name: CODE_LABEL,
      uid: 'code',
      render: (discount: GlobalDiscountResponseProps) => (
        <Snippet symbol={false} onCopy={() => copyToClipboard(discount.code)}>
          {discount.code ?? '-------'}
        </Snippet>
      ),
    },
    {
      name: 'میزان تخفیف',
      uid: 'discount_value',
      render: (discount: GlobalDiscountResponseProps) => (
        <span>
          {Number(discount.discount_value).toLocaleString('fa-IR') ?? '-------'}{' '}
          {discount.discount_type == 'fixed' ? 'ریال' : '%'}
        </span>
      ),
    },
    {
      name: START_DATE_LABEL,
      uid: 'starts_at',
      render: (discount: GlobalDiscountResponseProps) => (
        <span dir="ltr">
          {discount.starts_at
            ? new Date(discount.starts_at).toLocaleDateString('fa-IR')
            : '------'}
        </span>
      ),
    },
    {
      name: EXPIRED_DATE_LABEL,
      uid: 'expires_at',
      render: (discount: GlobalDiscountResponseProps) => (
        <span>
          {' '}
          {discount.expires_at
            ? new Date(discount.expires_at).toLocaleDateString('fa-IR')
            : '------'}
        </span>
      ),
    },
    {
      name: 'وضعیت',
      uid: 'isActive',
      render: (discount: GlobalDiscountResponseProps) => {
        // استفاده از وضعیت لوکال اگر موجود باشد، وگرنه وضعیت اصلی دیتابیس
        const isActive = localStatusOverrides.hasOwnProperty(discount.id)
          ? localStatusOverrides[discount.id]
          : discount.is_active

        return (
          <button
            onClick={() => handleToggleActive(discount.id, isActive)}
            disabled={toggleLoadingStates[discount.id]}
            className={`${isActive ? 'bg-success-500' : 'bg-danger-500'} ${
              toggleLoadingStates[discount.id]
                ? 'cursor-wait opacity-50'
                : 'cursor-pointer hover:opacity-80'
            } whitespace-nowrap rounded-full px-4 py-2 text-center text-white transition-opacity`}
          >
            {toggleLoadingStates[discount.id]
              ? 'در حال بارگذاری...'
              : isActive
                ? 'فعال'
                : 'غیر فعال'}
          </button>
        )
      },
    },
    {
      name: 'عملیات',
      uid: 'actions',
      render: (discount: GlobalDiscountResponseProps) => (
        <button
          onClick={() => openDeleteModal(discount.id)}
          disabled={deleteLoadingStates[discount.id]}
          className={`${
            deleteLoadingStates[discount.id]
              ? 'cursor-wait opacity-50'
              : 'cursor-pointer hover:opacity-80'
          } whitespace-nowrap rounded-full bg-danger-500 px-4 py-2 text-center text-white transition-opacity`}
        >
          {deleteLoadingStates[discount.id] ? 'در حال حذف...' : 'حذف'}
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="px-3 text-xl font-bold text-default-700">
            ایجاد کد تخفیف همگانی :
          </h1>
          <FormLayout<GlobalDiscountRequestProps>
            onSubmit={handleSubmit}
            methods={methods}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          >
            <FormInput<GlobalDiscountRequestProps>
              name="name"
              type="text"
              label="اسم تخفیف"
              isRequired
            />
            <FormInput<GlobalDiscountRequestProps>
              name="code"
              type="text"
              label="کد تخفیف (اختیاری)"
            />

            <FormNumberInput<GlobalDiscountRequestProps>
              name="discount_value"
              label={'میزان تخفیف (ریال)'}
              isRequired
              isSeparator={true}
            />

            <SwitchField<GlobalDiscountRequestProps>
              name="is_unlimited"
              label="مدت تخفیف"
              activeLabel="نامحدود"
              deactivateLabel="محدود"
            />

            <FormDatePicker<GlobalDiscountRequestProps>
              name="starts_at"
              label={START_DATE_LABEL}
              isDisabled={unlimitedValue}
              disabled={unlimitedValue}
            />
            <FormDatePicker<GlobalDiscountRequestProps>
              name="expires_at"
              label={EXPIRED_DATE_LABEL}
              isDisabled={unlimitedValue}
              disabled={unlimitedValue}
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
              {CREATE_DISCOUNT_CODE_LABEL}
            </Button>

            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              isDismissable={false}
              isKeyboardDismissDisabled={true}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      {DISCOUNT_INFO_LABEL}
                    </ModalHeader>
                    <ModalBody>
                      <dl className="flex min-w-80 shrink-0 flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
                        <div className="flex justify-between">
                          <dt className="text-small text-default-500">
                            {NAME_LABEL}
                          </dt>
                          <dd className="flex gap-1 text-small font-semibold text-default-700">
                            <span className="font-semibold">
                              {discountData?.name}
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-small text-default-500">
                            مقدار تخفیف
                          </dt>
                          <dd className="flex gap-1 text-small font-semibold text-default-700">
                            <span className="font-semibold">
                              {Number(
                                discountData?.discount_value
                              ).toLocaleString('fa-IR')}
                            </span>
                            <span className="font-semibold">
                              {discountData?.discount_type == 'fixed'
                                ? 'ریال'
                                : 'درصد'}
                            </span>
                          </dd>
                        </div>
                        {discountData?.minimum_price && (
                          <div className="flex justify-between">
                            <dt className="text-small text-default-500">
                              {MINIMUM_PRICE_LABEL}
                            </dt>
                            <dd className="flex gap-1 text-small font-semibold text-default-700">
                              <span className="font-semibold">
                                {Number(
                                  discountData?.minimum_price
                                ).toLocaleString('fa-IR')}
                              </span>
                              <span className="font-semibold">ریال</span>
                            </dd>
                          </div>
                        )}
                        {discountData?.starts_at && (
                          <div className="flex justify-between">
                            <dt className="text-small text-default-500">
                              {START_DATE_LABEL}
                            </dt>
                            <dd className="flex gap-1 text-small font-semibold text-default-700">
                              <span className="font-semibold" dir="ltr">
                                {new Date(
                                  discountData?.starts_at
                                ).toLocaleString('fa-IR')}
                              </span>
                            </dd>
                          </div>
                        )}
                        {discountData?.expires_at && (
                          <div className="flex justify-between">
                            <dt className="text-small text-default-500">
                              {EXPIRED_DATE_LABEL}
                            </dt>
                            <dd className="flex gap-1 text-small font-semibold text-default-700">
                              <span className="font-semibold" dir="ltr">
                                {new Date(
                                  discountData?.expires_at
                                ).toLocaleString('fa-IR')}
                              </span>
                            </dd>
                          </div>
                        )}

                        <hr
                          className="h-divider w-full shrink-0 border-none bg-default-200"
                          role="separator"
                        />
                        <div className="flex justify-between">
                          <dt className="text-small font-semibold text-default-500">
                            {DISCOUNT_LABEL}
                          </dt>
                          <dd className="flex gap-1 text-large font-semibold text-success">
                            <span className="font-semibold">
                              {discountData?.code}{' '}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" onPress={onClose}>
                        {ACCEPT_LABEL}
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </FormLayout>
        </div>
      </div>
      <h2 className="text-xl font-bold text-default-700">
        لیست کدهای تخفیف همگانی
      </h2>
      <div className="sticky top-0 z-20 h-fit w-full bg-white pb-2 md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
        <TextInputWithDelay
          setValue={(value) => {
            setFilters({ name: value })
          }}
        />
      </div>

      <DataTable
        columns={columns}
        apiMethods={GLOBAL_DISCOUNT_API}
        key={tableKey}
        dataTableId="global_discount_table"
        extraFilterParameters={filters}
      />

      <Modal
        isOpen={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onOpenChange}
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                حذف کد تخفیف
              </ModalHeader>
              <ModalBody>
                <p>آیا از حذف این کد تخفیف اطمینان دارید؟</p>
                <p className="text-small text-default-500">
                  این عملیات غیرقابل بازگشت است.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  انصراف
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteConfirm}
                  isLoading={isDeletingModal}
                >
                  بله، حذف کن
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default GlobalDiscountTable
