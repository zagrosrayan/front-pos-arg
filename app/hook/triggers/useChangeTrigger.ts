/* eslint-disable @typescript-eslint/no-explicit-any */
import { changeCategoryListener } from '@/app/triggers/changeCategory'
import { useEffect } from 'react'

export const useChangeTrigger = (onChange: (item: any[]) => void) => {
  useEffect(() => {
    const change = changeCategoryListener(onChange)
    return change
  }, [onChange])
}
