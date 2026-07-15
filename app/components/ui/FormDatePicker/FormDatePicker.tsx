/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { cn, Input, InputProps } from '@heroui/react'
import gregorian from 'react-date-object/calendars/gregorian'
import persian from 'react-date-object/calendars/persian'
import gregorian_en from 'react-date-object/locales/gregorian_en'
import persian_fa from 'react-date-object/locales/persian_fa'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form'
import PersianDatePicker, { DatePickerRef } from 'react-multi-date-picker'
import { useRef, useState } from 'react'
import { HiCalendarDays } from 'react-icons/hi2'
import { DateObject } from 'react-multi-date-picker'
import 'react-multi-date-picker/styles/layouts/mobile.css'
import { REQUIRED_ERROR } from '@/app/constant/error'
import { DELETE_LABEL } from '@/app/constant/label'

interface FormDatePickerProps<T extends FieldValues> extends InputProps {
  name: Path<T>
  position?: string
  rules?: ControllerProps['rules']
  isRequired?: boolean
  requiredMessage?: string
}

const FormDatePicker = <T extends FieldValues>({
  name,
  position = 'center',
  rules,
  isRequired,
  requiredMessage = REQUIRED_ERROR,
  ...props
}: FormDatePickerProps<T>) => {
  const { control, formState } = useFormContext<T>()
  const datePickerRef = useRef<DatePickerRef>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isClosing, setIsClosing] = useState(false)

  const combinedRules: ControllerProps['rules'] = {
    ...rules,
    ...(isRequired && {
      required: {
        value: true,
        message: requiredMessage,
      },
    }),
  }

  return (
    <Controller
      control={control as Control<FieldValues>}
      name={name}
      rules={combinedRules}
      render={({ field: { onChange, name, value }, formState: { errors } }) => {
        const persianDateValue = value
          ? new DateObject({
              date: value,
              calendar: gregorian,
              format: 'YYYY-MM-DD',
            }).convert(persian, persian_fa)
          : null

        return (
          <Input
            {...props}
            ref={inputRef}
            value={
              persianDateValue ? persianDateValue.format('YYYY/MM/DD') : ''
            }
            readOnly
            fullWidth
            color={errors[name] ? 'danger' : 'default'}
            variant="bordered"
            radius="sm"
            isDisabled={props.disabled}
            isInvalid={Boolean(formState.errors[name])}
            errorMessage={formState.errors[name]?.message as string}
            classNames={{
              inputWrapper: cn(
                'group-disabled/fieldset:opacity-disabled  group-disabled/fieldset:!cursor-not-allowed border-default-100'
              ),
              input: cn('group-disabled/fieldset:cursor-not-allowed'),
            }}
            onFocus={() => {
              if (!props.disabled && !isClosing) {
                datePickerRef.current?.openCalendar()
              }
            }}
            endContent={
              <div className="flex items-center">
                <PersianDatePicker
                  mapDays={({ date }) => {
                    const props: any = {}
                    const isWeekend = date.weekDay.index === 6

                    if (isWeekend) props.className = 'highlight highlight-red'

                    return props
                  }}
                  ref={datePickerRef}
                  mobileButtons={[
                    {
                      label: DELETE_LABEL,
                      onClick: () => {
                        onChange('')
                        setIsClosing(true)
                        datePickerRef.current?.closeCalendar()
                        inputRef.current?.blur()
                        setTimeout(() => setIsClosing(false), 100) // Reset closing flag
                      },
                      className: 'rmdp-button rmdp-action-button',
                    },
                  ]}
                  value={persianDateValue || undefined}
                  onChange={(date) => {
                    onChange(
                      date?.isValid
                        ? date
                            .convert(gregorian, gregorian_en)
                            .format('YYYY-MM-DD')
                        : undefined
                    )
                    setIsClosing(true)
                    datePickerRef.current?.closeCalendar()
                    inputRef.current?.blur()
                    setTimeout(() => setIsClosing(false), 100) // Reset closing flag
                  }}
                  onClose={() => {
                    setIsClosing(true)
                    inputRef.current?.blur()
                    setTimeout(() => setIsClosing(false), 100) // Reset closing flag
                  }}
                  format="YYYY/MM/DD"
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition={position}
                  inputClass="hidden text-center"
                  className="rmdp-mobile"
                  portal
                />
                <HiCalendarDays
                  className="flex-shrink-0 cursor-pointer text-default-400 group-disabled/fieldset:hidden group-disabled/fieldset:cursor-not-allowed"
                  onClick={() => {
                    if (!props.disabled) datePickerRef.current?.openCalendar()
                  }}
                />
              </div>
            }
          />
        )
      }}
    />
  )
}

export default FormDatePicker
