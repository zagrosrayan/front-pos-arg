/* eslint-disable @typescript-eslint/no-explicit-any */

export const preprocessData = <T extends object>(
  data: T,
  optionalKeys?: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = {}

  Object.keys(data).forEach((key) => {
    const value = (data as any)[key]
    const isNullable = value === null || value === undefined
    if (
      optionalKeys &&
      optionalKeys?.includes(key as keyof T) &&
      (value === undefined || value === '' || value === null)
    ) {
      delete result[key as keyof T]
      return
    }
    if (isNullable || value === '') {
      result[key as keyof T] = null as T[keyof T]
      return
    }

    result[key as keyof T] = value
  })
  return result
}
