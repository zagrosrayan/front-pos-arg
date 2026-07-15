'use client'

import { REQUIRED_ERROR } from '@/app/constant/error'
import { UI_VARIANT } from '@/app/constant/ui'
import { Input, InputProps, cn } from '@heroui/react'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form'

interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, 'type'> {
  name: Path<T>
  rules?: ControllerProps['rules']
  requiredMessage?: string
  isSeparator?: boolean
  maxValue?: number
  maxLength?: number
  formatOptions?: {
    useGrouping?: boolean
  }
}

const FormNumberInput = <T extends FieldValues>({
  name,
  rules,
  requiredMessage = REQUIRED_ERROR,
  isSeparator = false,
  maxValue,
  maxLength,
  formatOptions,
  ...props
}: FormInputProps<T>) => {
  const { control, formState } = useFormContext<T>()

  const shouldUseSeparator = isSeparator || formatOptions?.useGrouping

  const combinedRules: ControllerProps['rules'] = {
    ...rules,
    ...(props.isRequired && {
      required: {
        value: true,
        message: requiredMessage,
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `حداکثر ${maxLength} رقم مجاز است`,
      },
    }),
    validate: {
      ...((rules as any)?.validate || {}),
      maxValueCheck: (value: any) => {
        if (maxValue === undefined || maxValue === null) {
          return true
        }
        if (value === undefined || value === null || value === '') {
          return true
        }
        const numVal = Number(value)
        if (isNaN(numVal)) {
          return true
        }
        if (numVal > maxValue) {
          return `حداکثر مقدار مجاز ${maxValue} است`
        }
        return true
      },
    },
  }

  const formatNumber = (val: string | number) => {
    if (val === undefined || val === null || val === '') return ''
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={combinedRules}
      render={({ field }) => {
        const displayValue = shouldUseSeparator
          ? formatNumber(field.value)
          : (field.value?.toString() ?? '')

        const errorMessage = formState.errors[name]?.message as
          | string
          | undefined
        const hasMaxValueError = errorMessage?.includes('حداکثر مقدار مجاز')
        const shouldShowError =
          hasMaxValueError && maxValue !== undefined
            ? Boolean(formState.errors[name])
            : (Boolean(formState.errors[name]) && !hasMaxValueError) ||
              (hasMaxValueError && maxValue !== undefined)

        const finalErrorMessage =
          hasMaxValueError && maxValue === undefined ? undefined : errorMessage

        return (
          <Input
            {...props}
            type={shouldUseSeparator ? 'text' : 'number'}
            value={displayValue}
            min={0}
            onChange={(e) => {
              let rawValue = e.target.value.replace(/,/g, '')

              // اجازه پاک کردن کامل فیلد
              if (rawValue === '') {
                field.onChange(undefined)
                return
              }

              // بررسی maxLength
              if (maxLength && rawValue.length > maxLength) {
                rawValue = rawValue.slice(0, maxLength)
              }

              const numericValue = Number(rawValue)

              // اگر عدد معتبر نیست، اجازه نده
              if (isNaN(numericValue)) {
                return
              }

              // بررسی maxValue - اگر بیشتر بود، اجازه نده
              if (maxValue !== undefined && numericValue > maxValue) {
                return
              }

              field.onChange(numericValue)
            }}
            isInvalid={Boolean(finalErrorMessage)}
            radius="sm"
            errorMessage={finalErrorMessage}
            classNames={{
              inputWrapper: cn(
                'group-disabled/fieldset:opacity-disabled group-disabled/fieldset:!cursor-not-allowed border-default-100'
              ),
              input: cn(
                'group-disabled/fieldset:cursor-not-allowed outline-none focus-visible:!outline-none'
              ),
              label: cn(
                'group-data-[filled-within=true]:-translate-y-[calc(70%_+_var(--heroui-font-size-small)/2_-_6px_-_var(--heroui-border-width-medium))]'
              ),
            }}
            isDisabled={props.disabled}
            variant={props.variant ?? UI_VARIANT}
          />
        )
      }}
    />
  )
}

export default FormNumberInput
