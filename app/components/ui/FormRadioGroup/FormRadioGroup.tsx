'use client'

import { REQUIRED_ERROR } from '@/app/constant/error'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form'
import { RadioGroup, RadioGroupProps } from '@heroui/react'

interface FormRadioGroupProps<T extends FieldValues>
  extends Omit<RadioGroupProps, 'value' | 'onChange'> {
  name: Path<T>
  rules?: ControllerProps['rules']
  requiredMessage?: string
  children: React.ReactNode
}

const FormRadioGroup = <T extends FieldValues>({
  name,
  rules,
  requiredMessage = REQUIRED_ERROR,
  children,
  ...props
}: FormRadioGroupProps<T>) => {
  const { control, formState } = useFormContext<T>()

  const combinedRules: ControllerProps['rules'] = {
    ...rules,
    required: {
      value: true,
      message: requiredMessage,
    },
  }

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={combinedRules}
      render={({ field }) => (
        <RadioGroup
          {...field}
          {...props}
          value={field.value || ''}
          onChange={(val) => field.onChange(val)}
          isInvalid={Boolean(formState.errors[name])}
          errorMessage={formState.errors[name]?.message as string}
        >
          {children}
        </RadioGroup>
      )}
    />
  )
}

export default FormRadioGroup
