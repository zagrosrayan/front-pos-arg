export type ValidationErrors<T> = {
  [field in keyof T]: string[]
}

export interface ValidationErrorResponseType<T> {
  data: { items: ValidationErrors<T> }
  message: string
}
