'use client'

import { REQUIRED_ERROR } from '@/app/constant/error'
import { UI_VARIANT } from '@/app/constant/ui'
import { cn, Textarea, TextAreaProps } from '@heroui/react'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form'

interface FormTextAreaProps<T extends FieldValues>
  extends Omit<TextAreaProps, 'value' | 'onChange'> {
  name: Path<T>
  rules?: ControllerProps['rules']
  requiredMessage?: string
}

const FormTextArea = <T extends FieldValues>({
  name,
  rules,
  requiredMessage = REQUIRED_ERROR,
  ...props
}: FormTextAreaProps<T>) => {
  const { control, formState } = useFormContext<T>()

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
        <Textarea
          {...field}
          {...props}
          value={field.value || ''}
          isDisabled={props.disabled}
          variant={props.variant ?? UI_VARIANT}
          isInvalid={Boolean(formState.errors[name])}
          errorMessage={formState.errors[name]?.message as string}
          classNames={{
            inputWrapper: cn(
              'group-disabled/fieldset:opacity-disabled  group-disabled/fieldset:!cursor-not-allowed'
            ),
            input: cn('group-disabled/fieldset:cursor-not-allowed'),
            label: cn('text-medium'),
          }}
        />
      )}
    />
  )
}

export default FormTextArea
