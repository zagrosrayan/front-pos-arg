/* eslint-disable @typescript-eslint/no-explicit-any */

export const changeCategoryListener = (callback: (item: any) => void) => {
  const handler = (event: CustomEvent<{ item: any }>) => {
    callback(event.detail.item)
  }

  window.addEventListener('changeCategory', handler as EventListener)

  return () => {
    window.removeEventListener('changeCategory', handler as EventListener)
  }
}
