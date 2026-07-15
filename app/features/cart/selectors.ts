import { RootState } from '@/lib/store'
import { createSelector } from 'reselect'

export const selectCartItemsState = (state: RootState) => state.cart

export const cartListItemsSelector = createSelector(
  [selectCartItemsState],
  (cart) => cart.items
)
