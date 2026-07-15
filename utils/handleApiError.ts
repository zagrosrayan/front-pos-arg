import { ValidationErrorResponseType } from '@/types/errorTypes'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'

// Utility function to set errors in React Hook Form from API response
export function handleApiErrors<T extends FieldValues>(
  apiError: ValidationErrorResponseType<T>,
  setError: UseFormSetError<T>
): void {
  if (!(apiError && apiError.data)) return

  const groupedErrors: Record<string, string[]> = {}

  for (const key in apiError.data.items) {
    if (apiError.data.items.hasOwnProperty(key)) {
      const errorArray = apiError.data.items[key]
      if (errorArray && Array.isArray(errorArray)) {
        // Check if the key is for an indexed field (e.g., roles.0, roles.1)
        const baseKeyMatch = key.match(/^([a-zA-Z_]+)\.\d+$/)
        if (baseKeyMatch) {
          const baseKey = baseKeyMatch[1]
          // Group errors under the base key
          if (!groupedErrors[baseKey]) {
            groupedErrors[baseKey] = []
          }
          groupedErrors[baseKey].push(errorArray[0]) // Collect the first error for the index
        } else {
          // For regular keys, directly set the error
          setError(key as unknown as Path<T>, {
            type: 'manual',
            message: errorArray[0],
          })
        }
      }
    }
  }

  // Handle grouped errors (e.g., roles)
  for (const baseKey in groupedErrors) {
    if (groupedErrors.hasOwnProperty(baseKey)) {
      const errors = groupedErrors[baseKey]
      if (errors.length > 0) {
        setError(baseKey as unknown as Path<T>, {
          type: 'manual',
          message: errors[0], // Show only the first error for the grouped field
        })
      }
    }
  }
}

export function isValidationErrorResponse<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
): error is ValidationErrorResponseType<T> {
  return (
    error &&
    typeof error === 'object' &&
    'result' in error &&
    Array.isArray(error.result)
  )
}
