'use client'

import TextInputWithDelay from '@/app/components/ui/SearchInputWithDelay/SearchInputWithDelay'
import {
  CODE_LABEL,
  EXPIRED_DATE_LABEL,
  NAME_LABEL,
  PROFIT_MANAGER_LABEL,
  START_DATE_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { DISCOUNT_API } from '@/routes/api/discount'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import {
  DiscountRequestProps,
  DiscountResponseProps,
} from '@/types/discountTypes'
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
import FormSelect from '@/app/components/ui/FormSelect'
import SwitchField from '@/app/components/ui/SwitchField'
import DataTable, { ColumnsData } from '../DataTable'
import { copyToClipboard } from '@/utils'

const DiscountTable = () => {
  const deleteDisclosure = useDisclosure()

  const methods = useForm({
    mode: 'onChange',
  })

  // استیت‌های مدیریت جدول و لودینگ
  const [tableKey, setTableKey] = useState(0)
  const [filters, setFilters] = useState<{ name: string }>({ name: '' })

  // استیت‌های لودینگ جداگانه برای هر دکمه
  const [toggleLoadingStates, setToggleLoadingStates] = useState<
    Record<number, boolean>
  >({})
  const [deleteLoadingStates, setDeleteLoadingStates] = useState<
    Record<number, boolean>
  >({})

  // استیت برای تغییر لوکال وضعیت فعال/غیرفعال (بدون رفرش جدول)
  const [localStatusOverrides, setLocalStatusOverrides] = useState<
    Record<number, boolean>
  >({})

  // استیت‌های مدیریت حذف
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeletingModal, setIsDeletingModal] = useState(false)

  useEffect(() => {}, [filters, filters.name])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    data.is_special = data.is_special ? '1' : '0'
    const updatedFilters = { ...filters, ...data }
    setFilters(updatedFilters)
    setTableKey((prev) => prev + 1)
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      setToggleLoadingStates((prev) => ({ ...prev, [id]: true }))

      const response = await apiRequest(DISCOUNT_API.toggleActive(id))

      if (response) {
        // آپدیت لوکال وضعیت دکمه بدون رفرش کل جدول
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

      const response = await apiRequest(DISCOUNT_API.delete(deleteId))

      if (response) {
        // برای حذف مجبوریم جدول را رفرش کنیم تا ردیف پاک شود
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

  const columns: ColumnsData<DiscountResponseProps>[] = [
    {
      name: 'شناسه',
      uid: 'id',
      render: (discount: DiscountResponseProps) => <span>{discount.id}</span>,
    },
    {
      name: 'نوع تخفیف',
      uid: 'type',
      render: (discount: DiscountResponseProps) => (
        <span>{discount.discount_type == 'percentage' ? 'درصدی' : 'عددی'}</span>
      ),
    },
    {
      name: NAME_LABEL,
      uid: 'name',
      render: (discount: DiscountResponseProps) => <span>{discount.name}</span>,
    },
    {
      name: 'نام مشتری',
      uid: 'customer_name',
      render: (discount: DiscountResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {discount.customer?.name
            ? discount.customer?.name
            : (discount.reserve?.GuestName ?? '-------')}
        </span>
      ),
    },
    {
      name: 'شماره اتاق مشتری',
      uid: 'room',
      render: (discount: DiscountResponseProps) => (
        <span className="whitespace-nowrap text-amber-600">
          {discount.reserve?.Room ?? '-------'}
        </span>
      ),
    },
    {
      name: 'مرکز درآمد',
      uid: 'profit',
      render: (discount: DiscountResponseProps) => (
        <span>{discount.profit_manager?.name ?? '----'}</span>
      ),
    },
    {
      name: CODE_LABEL,
      uid: 'code',
      render: (discount: DiscountResponseProps) => (
        <Snippet symbol={false} onCopy={() => copyToClipboard(discount.code)}>
          {discount.code ?? '-------'}
        </Snippet>
      ),
    },
    {
      name: 'میزان تخفیف',
      uid: 'discount_value',
      render: (discount: DiscountResponseProps) => (
        <span>
          {Number(discount.discount_value).toLocaleString('fa-IR') ?? '-------'}{' '}
          {discount.discount_type == 'fixed' ? 'ریال' : '%'}
        </span>
      ),
    },
    {
      name: 'حداقل خرید (ریال)',
      uid: 'minimum_price',
      render: (discount: DiscountResponseProps) => (
        <span>
          {Number(discount.minimum_price).toLocaleString('fa-IR') ?? '------'}
        </span>
      ),
    },
    {
      name: START_DATE_LABEL,
      uid: 'starts_at',
      render: (discount: DiscountResponseProps) => (
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
      render: (discount: DiscountResponseProps) => (
        <span>
          {discount.expires_at
            ? new Date(discount.expires_at).toLocaleDateString('fa-IR')
            : '------'}
        </span>
      ),
    },
    {
      name: 'تعداد استفاده شده',
      uid: 'count',
      render: (discount: DiscountResponseProps) => (
        <span>
          {Number(discount.usage_count).toLocaleString('fa-IR') ?? '0'}
        </span>
      ),
    },
    {
      name: 'تعداد قابل استفاده',
      uid: 'limit',
      render: (discount: DiscountResponseProps) => (
        <span>{discount.usage_limit ?? 'نامحدود'}</span>
      ),
    },
    {
      name: 'وضعیت',
      uid: 'isActive',
      render: (discount: DiscountResponseProps) => {
        // اولویت با وضعیت لوکال است، اگر نبود از دیتای سرور استفاده کن
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
      render: (discount: DiscountResponseProps) => (
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
            جست و جو :
          </h1>
          <FormLayout
            onSubmit={handleFormSubmit}
            methods={methods}
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          >
            <FormInput<DiscountRequestProps>
              name="name"
              type="text"
              label="اسم تخفیف"
            />
            <FormSelect<DiscountRequestProps>
              name="profit_manager_id"
              apiMethods={PROFIT_MANAGER_API}
              label={PROFIT_MANAGER_LABEL}
            />
            <SwitchField<DiscountRequestProps>
              name="is_special"
              label={'تخفیف مخصوص کاربران مقیم ؟'}
            />

            <FormDatePicker<DiscountRequestProps>
              name="starts_at"
              label={START_DATE_LABEL}
            />
            <FormDatePicker<DiscountRequestProps>
              name="expires_at"
              label={EXPIRED_DATE_LABEL}
            />

            <Button
              color="success"
              className="mr-auto w-fit text-white"
              fullWidth
              type="submit"
              size="lg"
              radius="sm"
            >
              اعمال فیلتر
            </Button>
          </FormLayout>
        </div>
      </div>
      <h2 className="text-xl font-bold text-default-700">
        لیست تخفیف های ساده
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
        apiMethods={DISCOUNT_API}
        key={tableKey}
        dataTableId="discount_table"
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

export default DiscountTable
