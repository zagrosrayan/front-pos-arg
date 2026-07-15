import { RootState } from '@/lib/store'
import { createSelector } from 'reselect'

export const selectAuthState = (state: RootState) => state.auth

export const reduxTokenSelector = createSelector(
  [selectAuthState],
  (auth) => auth.token
)

export const userInfoSelector = createSelector(
  [selectAuthState],
  (auth) => auth.userInfo
)
