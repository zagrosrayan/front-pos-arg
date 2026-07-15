'use client'
import { Form } from '@heroui/react'
import { ReactNode } from 'react'
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

interface FormLayoutProps<T extends FieldValues> {
  children: ReactNode
  onSubmit: SubmitHandler<T>
  className?: string
  disabled?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: UseFormReturn<T, any, undefined>
}

const FormLayout = <T extends FieldValues>({
  children,
  onSubmit,
  className,
  disabled = false,
  methods,
}: FormLayoutProps<T>) => {
  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full items-stretch"
      >
        <fieldset
          disabled={disabled}
          className={`group/fieldset ${className} `}
        >
          {children}
        </fieldset>
      </Form>
    </FormProvider>
  )
}

export default FormLayout
