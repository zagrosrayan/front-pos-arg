'use client'

import { REQUIRED_ERROR } from '@/app/constant/error'
import { UI_VARIANT } from '@/app/constant/ui'
import { cn, Input, InputProps } from '@heroui/react'
import { useState } from 'react'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form'
import { TbEye, TbEyeOff } from 'react-icons/tb'

interface FormInputProps<T extends FieldValues> extends InputProps {
  name: Path<T>
  rules?: ControllerProps['rules']
  requiredMessage?: string
}

const FormInput = <T extends FieldValues>({
  name,
  rules,
  requiredMessage = REQUIRED_ERROR,
  ...props
}: FormInputProps<T>) => {
  const { control, formState } = useFormContext<T>()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible)

  const combinedRules: ControllerProps['rules'] = {
    ...rules,
    ...(props.isRequired && {
      required: {
        value: true,
        message: requiredMessage,
      },
    }),
  }

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={combinedRules}
      render={({ field }) => (
        <Input
          {...field}
          {...props}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
          isInvalid={Boolean(formState.errors[name])}
          autoComplete="off"
          radius="sm"
          errorMessage={formState.errors[name]?.message as string}
          classNames={{
            inputWrapper: cn(
              'group-disabled/fieldset:opacity-disabled  group-disabled/fieldset:!cursor-not-allowed border-default-100'
            ),
            input: cn('group-disabled/fieldset:cursor-not-allowed'),
            label: cn('text-medium'),
          }}
          isDisabled={props.disabled}
          variant={props.variant ?? UI_VARIANT}
          type={
            props.type == 'password'
              ? isPasswordVisible
                ? 'text'
                : 'password'
              : props.type
          }
          endContent={
            props.type == 'password' && (
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
                tabIndex={-1}
              >
                {isPasswordVisible ? (
                  <TbEye className="pointer-events-none text-2xl text-default-400" />
                ) : (
                  <TbEyeOff className="pointer-events-none text-2xl text-default-400" />
                )}
              </button>
            )
          }
        />
      )}
    />
  )
}

export default FormInput
