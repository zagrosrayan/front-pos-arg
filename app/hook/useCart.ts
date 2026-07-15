import { AppDispatch, RootState } from '@/lib/store'
import { useDispatch, useSelector } from 'react-redux'
import {
  addToCart,
  clearCart,
  removeFromCart,
  setCartItemCount,
} from '../features/cart/cartSlice'
import { FoodResponseProps } from '@/types/foodTypes'

// Custom hook to use the Redux dispatch
export const useAppDispatch: () => AppDispatch = useDispatch

// Hook to add a food item to the cart
export const useAddToCart = () => {
  const dispatch = useAppDispatch()
  return (food: Omit<FoodResponseProps, 'count'> & { quantity: number }) => {
    dispatch(addToCart(food))
  }
}

// Hook to remove a food item from the cart
export const useRemoveFromCart = () => {
  const dispatch = useAppDispatch()
  return (foodId: number) => {
    dispatch(removeFromCart(foodId))
  }
}

// Hook to set an exact quantity for a food item in the cart
export const useSetCartItemCount = () => {
  const dispatch = useAppDispatch()
  return (id: number, count: number) => {
    dispatch(setCartItemCount({ id, count }))
  }
}

// Hook to clear all items from the cart
export const useClearCart = () => {
  const dispatch = useAppDispatch()
  return () => {
    dispatch(clearCart())
  }
}

// Hook to get cart items
export const useCart = () => useSelector((state: RootState) => state.cart.items)
