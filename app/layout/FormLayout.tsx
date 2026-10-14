'use client'
import { Form } from '@heroui/react'
import { type BaseSyntheticEvent, type ReactNode } from 'react'
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

export function handleOrderSubmit<T extends FieldValues>(
  methods: Pick<UseFormReturn<T>, 'clearErrors' | 'handleSubmit'>,
  onSubmit: SubmitHandler<T>
) {
  const submit = methods.handleSubmit(onSubmit)

  return (event?: BaseSyntheticEvent) => {
    // Recheck current values instead of retaining errors on async selectors.
    methods.clearErrors()
    return submit(event)
  }
}

interface FormLayoutProps<T extends FieldValues> {
  children: ReactNode
  onSubmit: SubmitHandler<T>
  className?: string
  disabled?: boolean
  revalidateOnSubmit?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: UseFormReturn<T, any, undefined>
}

const FormLayout = <T extends FieldValues>({
  children,
  onSubmit,
  className,
  disabled = false,
  revalidateOnSubmit = false,
  methods,
}: FormLayoutProps<T>) => {
  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={
          revalidateOnSubmit
            ? handleOrderSubmit(methods, onSubmit)
            : methods.handleSubmit(onSubmit)
        }
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
