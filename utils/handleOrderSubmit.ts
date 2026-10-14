import type { BaseSyntheticEvent } from 'react'
import type {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

export function handleOrderSubmit<T extends FieldValues>(
  methods: Pick<UseFormReturn<T>, 'clearErrors' | 'handleSubmit'>,
  onSubmit: SubmitHandler<T>
) {
  const submit = methods.handleSubmit(onSubmit)

  return (event?: BaseSyntheticEvent) => {
    // Errors on async selectors and server-only fields survive handleSubmit.
    // Recheck current values on every attempt, including registered field rules.
    methods.clearErrors()
    return submit(event)
  }
}
