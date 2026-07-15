import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/app/features/auth/authSlice'
import cartReducer from '@/app/features/cart/cartSlice'

export const makeStore = () => {
  return configureStore({
    reducer: { auth: authReducer, cart: cartReducer },
  })
}

export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
