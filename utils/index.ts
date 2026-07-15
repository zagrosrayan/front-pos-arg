import { RoleResponseProps } from '@/types/roleTypes'

export { toPersianDigits } from './numbers'

export function getUniqueArrayByKey<T>(arrays: T[][], key: keyof T): T[] {
  // Merge all arrays into one
  const mergedArray = arrays.flat()

  // Create a map to track unique items by the specified key
  const uniqueMap = new Map<T[keyof T], T>()

  // Iterate over the merged array and add items to the map
  for (const item of mergedArray) {
    const keyValue = item[key]
    if (!uniqueMap.has(keyValue)) {
      uniqueMap.set(keyValue, item)
    }
  }

  // Return the unique values from the map
  return Array.from(uniqueMap.values())
}

export const hasPermission = (
  roles: RoleResponseProps[],
  permissionName: string
): boolean => {
  return roles.some((role) =>
    role.permissions.some((permission) =>
      [permissionName].includes(permission.name)
    )
  )
}

// utils/permissions.ts
export const hasAnyPermission = (
  roles: RoleResponseProps[],
  permissionNames: string[]
): boolean => {
  return roles.some((role) =>
    role.permissions.some((permission) =>
      permissionNames.includes(permission.name)
    )
  )
}

const fallbackCopy = (text: string): void => {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea')
  textarea.value = text

  // Apply styles to hide the textarea
  textarea.style.position = 'fixed' // Prevent scrolling to the bottom of the page in MS Edge.
  textarea.style.opacity = '0' // Make it invisible
  textarea.style.pointerEvents = 'none' // Prevent any interaction
  textarea.style.zIndex = '-1' // Send it behind other elements

  // Append the textarea to the body
  document.body.appendChild(textarea)

  // Select the text in the textarea
  textarea.select()
  textarea.setSelectionRange(0, 99999) // For mobile devices

  // Execute the copy command
  document.execCommand('copy')

  // Remove the textarea from the document
  document.body.removeChild(textarea)

  // Optionally, alert the user that the text has been copied
}

// utils/copyToClipboard.ts
export const copyToClipboard = async (text: string): Promise<void> => {
  // Check if the Clipboard API is available
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback method
      fallbackCopy(text)
    }
  } catch (err) {
    console.error('Failed to copy using Clipboard API:', err)
  }
}

export function withStartOfDay(dateStr: string) {
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export function withEndOfDay(dateStr: string) {
  const date = new Date(dateStr)
  date.setHours(23, 59, 59, 999)
  return date.toISOString()
}

export const hasDataChanged = (prev: any, current: any) => {
  return JSON.stringify(prev) !== JSON.stringify(current)
}
