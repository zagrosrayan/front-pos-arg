import { FoodResponseProps } from '@/types/foodTypes'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FoodItemProps extends FoodResponseProps {
  count: number
}

interface CartState {
  items: FoodItemProps[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<FoodItemProps, 'count'> & { quantity: number }>
    ) => {
      const food = state.items.find((item) => item.id === action.payload.id)
      if (food) {
        food.count += action.payload.quantity
      } else {
        state.items.push({
          ...action.payload,
          count: action.payload.quantity ?? 1,
        })
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      const foodIndex = state.items.findIndex(
        (item) => item.id === action.payload
      )
      if (foodIndex !== -1) {
        if (state.items[foodIndex].count > 1) {
          state.items[foodIndex].count -= 1
        } else {
          state.items.splice(foodIndex, 1)
        }
      }
    },
    setCartItemCount: (
      state,
      action: PayloadAction<{ id: number; count: number }>
    ) => {
      const foodIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      )
      if (foodIndex !== -1) {
        if (action.payload.count > 0) {
          state.items[foodIndex].count = action.payload.count
        } else {
          state.items.splice(foodIndex, 1)
        }
      }
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, setCartItemCount, clearCart } =
  cartSlice.actions
export default cartSlice.reducer
