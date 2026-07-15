'use client'

import {
  ACCEPT_LABEL,
  CREATE_DISCOUNT_CODE_LABEL,
  DISCOUNT_INFO_LABEL,
  DISCOUNT_LABEL,
  DISCOUNT_VALUE_LABEL,
  EXPIRED_DATE_LABEL,
  MINIMUM_PRICE_LABEL,
  NAME_LABEL,
  PROFIT_MANAGER_LABEL,
  START_DATE_LABEL,
} from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { CUSTOMER_API } from '@/routes/api/customer'
import { DISCOUNT_API } from '@/routes/api/discount'
import { PROFIT_MANAGER_API } from '@/routes/api/profit'
import { USER_RESIDENT_API } from '@/routes/api/user'
import {
  DiscountRequestProps,
  DiscountResponseProps,
} from '@/types/discountTypes'
import { DiscountType } from '@/types/orderType'
import {
  handleApiErrors,
  isValidationErrorResponse,
} from '@/utils/handleApiError'
import { withEndOfDay, withStartOfDay } from '@/utils'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  useDisclosure,
} from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { AsyncPaginate } from 'react-select-async-paginate'
import FormDatePicker from '../../ui/FormDatePicker'
import FormInput from '../../ui/FormInput'
import FormNumberInput from '../../ui/FormNumberInput'
import FormRadioGroup from '../../ui/FormRadioGroup'
import FormSelect from '../../ui/FormSelect'
import SwitchField from '../../ui/SwitchField'

interface ItemsType {
  items: DiscountResponseProps
}

type ProfitManagerItem = {
  id: string | number
  name: string
}

type FormValues = DiscountRequestProps & {
  profit_manager_ids: string[]
}

const formatPrice = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return ''
  return Number(value).toLocaleString('fa-IR')
}

const CreateDiscountForm = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      is_active: true,
      is_special: false,
      discount_type: 'fixed',
      profit_manager_ids: [],
    },
  })

  const specialValue = methods.watch('is_special')
  const discountType = methods.watch('discount_type')

  const [roomSearchQuery, setRoomSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [discountData, setDiscountData] =
    useState<DiscountResponseProps | null>(null)

  const [profitManagersLoading, setProfitManagersLoading] = useState(false)
  const [profitManagers, setProfitManagers] = useState<ProfitManagerItem[]>([])

  useEffect(() => {
    if (discountType === 'fixed') {
      methods.clearErrors('discount_value')
      methods.trigger('discount_value')
    }
  }, [discountType, methods])

  useEffect(() => {
    let mounted = true

    const loadProfitManagers = async () => {
      try {
        setProfitManagersLoading(true)

        const res = await apiRequest<any>({
          ...PROFIT_MANAGER_API.getAll(),
          params: { per_page: 9999 },
        })

        const items: any[] = res?.data?.items || []

        const mapped = items.map((pm) => ({
          id: pm.id ?? pm._id ?? pm.ID,
          name: pm.name ?? pm.title ?? pm.Name,
        }))

        if (mounted) setProfitManagers(mapped)
      } catch (e) {
        console.error('Error loading profit managers:', e)
        if (mounted) setProfitManagers([])
      } finally {
        if (mounted) setProfitManagersLoading(false)
      }
    }

    loadProfitManagers()

    return () => {
      mounted = false
    }
  }, [])

  const profitManagerOptions = useMemo(
    () =>
      profitManagers.filter(
        (x) => x?.id !== undefined && x?.name !== undefined
      ),
    [profitManagers]
  )

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)

      if (
        data.discount_type === 'percentage' &&
        (Number(data.discount_value) < 1 || Number(data.discount_value) > 100)
      ) {
        methods.setError('discount_value', {
          message: 'در حالت درصدی مقدار باید بین 1 تا 100 باشد',
        })
        return
      }

      if (data.is_special) {
        data.customer_id = ''
      }

      data.starts_at = withStartOfDay(data.starts_at)
      data.expires_at = withEndOfDay(data.expires_at)

      const response = await apiRequest<ItemsType>(DISCOUNT_API.create(data))
      methods.reset()
      setDiscountData(response?.data.items as DiscountResponseProps)
      onOpen()
    } catch (error) {
      console.error(error)
      if (isValidationErrorResponse<FormValues>(error)) {
        handleApiErrors(error, methods.setError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="px-3 text-xl font-bold text-default-700">
        ایجاد تخفیف ساده :
      </h1>

      <FormLayout<FormValues>
        onSubmit={handleSubmit}
        methods={methods}
        className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <FormRadioGroup<FormValues>
          name="discount_type"
          label={'نوع تخفیف'}
          orientation="horizontal"
          classNames={{
            label: cn('font-bold text-sm'),
            base: cn(' sm:col-span-1 md:col-span-1 lg:col-span-1'),
          }}
          isRequired
        >
          <Radio
            classNames={{
              base: cn(
                'inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between',
                'flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent',
                'data-[selected=true]:border-primary'
              ),
            }}
            value={DiscountType.fixed}
          >
            عددی
          </Radio>

          <Radio
            classNames={{
              base: cn(
                'inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between',
                'flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent',
                'data-[selected=true]:border-primary'
              ),
            }}
            value={DiscountType.percentage}
          >
            درصدی
          </Radio>
        </FormRadioGroup>

        <div className="sm:col-span-2 md:col-span-3 lg:col-span-3">
          <Controller
            control={methods.control}
            name="profit_manager_ids"
            render={({ field, fieldState }) => (
              <CheckboxGroup
                label={PROFIT_MANAGER_LABEL}
                value={field.value || []}
                onValueChange={field.onChange}
                isDisabled={profitManagersLoading}
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                classNames={{
                  label: cn('font-bold text-sm '),
                  wrapper:
                    'grid gap-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
                }}
              >
                {profitManagerOptions.map((pm) => (
                  <Checkbox key={String(pm.id)} value={String(pm.id)}>
                    {pm.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            )}
          />
        </div>

        <FormInput<FormValues>
          name="name"
          type="text"
          label="اسم تخفیف"
          isRequired
        />

        <FormInput<FormValues>
          name="discount_code"
          type="text"
          label="کد تخفیف (اختیاری)"
        />

        <FormNumberInput<FormValues>
          name="minimum_price"
          label="حداقل مبلغ خرید (ریال)"
          isRequired
          formatOptions={{
            useGrouping: true,
          }}
        />

        <FormNumberInput<FormValues>
          key={`discount_value_${discountType}`}
          name="discount_value"
          label={'میزان تخفیف'}
          isRequired
          maxValue={discountType === 'percentage' ? 100 : undefined}
          formatOptions={
            discountType === 'fixed' ? { useGrouping: true } : undefined
          }
        />

        <FormNumberInput<FormValues>
          name="usage_limit"
          label="تعداد قابل استفاده"
        />

        <FormDatePicker<FormValues>
          name="starts_at"
          label={START_DATE_LABEL}
          isRequired
        />

        <FormDatePicker<FormValues>
          name="expires_at"
          label={EXPIRED_DATE_LABEL}
          isRequired
        />

        <SwitchField<FormValues>
          name="is_special"
          label={'تخفیف مخصوص کاربران مقیم ؟'}
        />

        <dl>
          <AsyncPaginate
            inputId="room-reservation-select"
            placeholder="شماره رزرو"
            isDisabled={!specialValue}
            isClearable
            value={
              methods.getValues('reserve_number')
                ? {
                    value: methods.getValues('reserve_number'),
                    label: `${methods.getValues('reserve_number')}`,
                    data: {
                      Reserve: methods.getValues('reserve_number'),
                      GuestName: 'نامشخص',
                    },
                  }
                : null
            }
            loadOptions={async (searchQuery, loadedOptions, additional) => {
              const page = additional?.page || 1

              try {
                const response = await apiRequest<any>({
                  ...USER_RESIDENT_API.getAll(),
                  params: {
                    page,
                    reserve_number: searchQuery || roomSearchQuery,
                  },
                })

                const options = (response?.data?.items || []).map(
                  (item: any) => ({
                    value: item.Reserve,
                    label: `${item.Room} - ${item.Reserve}`,
                    data: item,
                  })
                )

                return {
                  options,
                  hasMore:
                    response?.data?.current_page < response?.data?.last_page,
                  additional: { page: page + 1 },
                }
              } catch (error) {
                console.error('Error loading options:', error)
                return { options: [], hasMore: false }
              }
            }}
            formatOptionLabel={(option, { context }) => (
              <div className="flex flex-col">
                {context === 'menu' && option.data ? (
                  <>
                    <span>مهمان: {option.data.GuestName || 'نامشخص'}</span>
                    <span className="text-sm text-default-500">
                      رزرو: {option.data.Reserve || 'نامشخص'}
                    </span>
                  </>
                ) : (
                  <span>{option.label}</span>
                )}
              </div>
            )}
            onChange={(selectedOption) => {
              if (selectedOption) {
                methods.setValue('reserve_number', selectedOption.value || '')
                setRoomSearchQuery(selectedOption.data.Reserve.toString() || '')
              } else {
                methods.setValue('reserve_number', '')
                setRoomSearchQuery('')
              }
            }}
            onInputChange={(value) => {
              setRoomSearchQuery(value)
              return value
            }}
            additional={{ page: 1 }}
            loadingMessage={() => 'در حال بارگذاری...'}
            noOptionsMessage={() => 'موردی یافت نشد'}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
              option: (provided) => ({
                ...provided,
                textAlign: 'right',
                direction: 'rtl',
              }),
            }}
          />
        </dl>

        <FormSelect<FormValues>
          name="customer_id"
          apiMethods={CUSTOMER_API}
          label="لیست مشتریان"
          isDisabled={!!specialValue}
        />

        <SwitchField<FormValues>
          name="is_active"
          label={'وضعیت تخفیف'}
          activeLabel="فعال"
          deactivateLabel="غیر فعال"
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
                        {DISCOUNT_VALUE_LABEL}
                      </dt>
                      <dd className="flex gap-1 text-small font-semibold text-default-700">
                        <span className="font-semibold">
                          {formatPrice(discountData?.discount_value)}
                        </span>
                        <span className="font-semibold">
                          {' '}
                          {discountData?.discount_type === 'fixed'
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
                            {formatPrice(discountData?.minimum_price)}
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
                            {new Date(discountData?.starts_at).toLocaleString(
                              'fa-IR'
                            )}
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
                            {new Date(discountData?.expires_at).toLocaleString(
                              'fa-IR'
                            )}
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
  )
}

export default CreateDiscountForm
