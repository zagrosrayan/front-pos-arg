/* eslint-disable @typescript-eslint/no-explicit-any */

export const dispatchChangeEvent = (item: any) => {
  const event = new CustomEvent('changeCategory', { detail: { item } })
  window.dispatchEvent(event)
}
