'use client'

import FormNumberInput from '@/app/components/ui/FormNumberInput'
import { LOADING_CONTENT_TEXT } from '@/app/constant/text'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { CLUB_API } from '@/routes/api/club'
import { ClubRequestProps, ClubResponseProps } from '@/types/clubTypes'
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
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

interface ClubSettingItem {
  id: number
  points_per_purchase: number
  amount_per_point: number
  points_per_discount: number
  discount_amount_per_point: number
  created_at?: string
}

const ClubPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmiting, setIsSubmitting] = useState(false)
  const [clubList, setClubList] = useState<ClubSettingItem[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteDisclosure = useDisclosure()

  const methods = useForm<ClubRequestProps>({
    mode: 'onChange',
  })

  const handleFetchData = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest<ClubResponseProps>(CLUB_API.getAll())
      const items = response?.data?.items
      if (Array.isArray(items)) {
        setClubList(items)
        if (items.length > 0) {
          methods.reset(items[0] as ClubRequestProps)
        }
      } else if (items && typeof items === 'object') {
        setClubList([items as ClubSettingItem])
        methods.reset(items as ClubRequestProps)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleFetchData()
  }, [])

  const handleSubmit = async (data: ClubRequestProps) => {
    try {
      setIsSubmitting(true)
      const response = await apiRequest(CLUB_API.create(data))
      toast.success(response?.message)
      handleFetchData()
      methods.reset({
        points_per_purchase: undefined,
        amount_per_point: undefined,
        points_per_discount: undefined,
        discount_amount_per_point: undefined,
      })
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<ClubRequestProps>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    deleteDisclosure.onOpen()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      setIsDeleting(true)
      const response = await apiRequest(CLUB_API.delete(deleteId))
      toast.success(response?.message || 'با موفقیت حذف شد')
      handleFetchData()
      deleteDisclosure.onClose()
    } catch (error) {
      console.error(error)
      toast.error('خطا در حذف')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatNumber = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === '') return '---'
    return Number(value).toLocaleString('fa-IR')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner label={LOADING_CONTENT_TEXT} />
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100svh-90px)] w-full space-y-8 overflow-y-auto p-5 pb-20 md:pb-0">
      <h1 className="text-xl font-bold text-default-700">
        تنظیم فرمول امتیاز بندی باشگاه مشتریان
      </h1>

      <FormLayout<ClubRequestProps>
        onSubmit={handleSubmit}
        methods={methods}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <FormNumberInput<ClubRequestProps>
          name="points_per_purchase"
          label="تعداد امتیاز"
          isRequired
          isSeparator
        />

        <FormNumberInput<ClubRequestProps>
          name="amount_per_point"
          label="مبلغ خرید به ازای هر امتیاز"
          isRequired
          isSeparator
        />

        <FormNumberInput<ClubRequestProps>
          name="points_per_discount"
          label="تعداد امتیاز برای تخفیف"
          isRequired
          isSeparator
        />

        <FormNumberInput<ClubRequestProps>
          name="discount_amount_per_point"
          label="مبلغ تخفیف به ازای هر امتیاز"
          isRequired
          isSeparator
        />

        <Button
          color="success"
          className="text-white"
          fullWidth
          type="submit"
          size="lg"
          radius="sm"
          isLoading={isSubmiting}
        >
          ایجاد فرمول جدید
        </Button>
      </FormLayout>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-default-700">
          لیست فرمول‌های ثبت شده
        </h2>

        <Table aria-label="لیست تنظیمات باشگاه مشتریان">
          <TableHeader>
            <TableColumn>شناسه</TableColumn>
            <TableColumn>تعداد امتیاز</TableColumn>
            <TableColumn>مبلغ خرید به ازای هر امتیاز</TableColumn>
            <TableColumn>تعداد امتیاز برای تخفیف</TableColumn>
            <TableColumn>مبلغ تخفیف به ازای هر امتیاز</TableColumn>
            <TableColumn>تاریخ ایجاد</TableColumn>
            <TableColumn>عملیات</TableColumn>
          </TableHeader>
          <TableBody emptyContent="هیچ فرمولی ثبت نشده است">
            {clubList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{formatNumber(item.points_per_purchase)}</TableCell>
                <TableCell>{formatNumber(item.amount_per_point)}</TableCell>
                <TableCell>{formatNumber(item.points_per_discount)}</TableCell>
                <TableCell>
                  {formatNumber(item.discount_amount_per_point)}
                </TableCell>
                <TableCell>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('fa-IR')
                    : '---'}
                </TableCell>
                <TableCell>
                  <Button
                    color="danger"
                    size="sm"
                    radius="full"
                    onPress={() => openDeleteModal(item.id)}
                  >
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onOpenChange}
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                حذف فرمول
              </ModalHeader>
              <ModalBody>
                <p>آیا از حذف این فرمول اطمینان دارید؟</p>
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
                  isLoading={isDeleting}
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

export default ClubPage
