'use client'
import { FoodItemProps } from '@/app/features/cart/cartSlice'
import {
  useAddToCart,
  useRemoveFromCart,
  useSetCartItemCount,
} from '@/app/hook/useCart'
import { Button, cn } from '@heroui/react'
import { useEffect, useState } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'
import FormTextArea from '../../ui/FormTextArea'
import { OrderRequestProps } from '@/types/orderType'

interface Props {
  item: FoodItemProps
}
const CheckoutItem = ({ item }: Props) => {
  const removeFromCart = useRemoveFromCart()
  const addToCart = useAddToCart()
  const setCartItemCount = useSetCartItemCount()
  const [countInput, setCountInput] = useState(String(item.count))

  useEffect(() => {
    setCountInput(String(item.count))
  }, [item.count])

  return (
    <li
      className="flex flex-col rounded-medium border-2 border-default-100 p-4"
      id={String(item.id)}
    >
      <div className="flex items-center gap-x-3 py-2">
        <div
          className="relative h-20 w-20 flex-shrink-0 rounded-small bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${item.image ?? '/assets/images/default-food.png'}")`,
          }}
        ></div>
        <div className="flex flex-1 flex-col">
          <h4 className="text-small">
            <span className="text-medium font-bold">{item.name}</span>
          </h4>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1 text-small text-default-500">
              <span className="">
                {Number(item.price).toLocaleString('fa-IR')}
              </span>
              <span className="">ریال</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            isIconOnly
            size="sm"
            radius="md"
            variant="light"
            color="success"
            onPress={() => addToCart({ ...item, quantity: 1 })}
          >
            <FiPlus className="size-4" />
          </Button>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            className="w-14 rounded-small border-2 border-default-100 px-2 py-1 text-center text-small outline-none"
            value={countInput}
            onChange={(e) => {
              setCountInput(e.target.value)
              const value = Number(e.target.value)
              if (!e.target.value || Number.isNaN(value) || value <= 0) return
              setCartItemCount(item.id, value)
            }}
            onBlur={() => {
              const value = Number(countInput)
              if (!countInput || Number.isNaN(value) || value <= 0) {
                setCartItemCount(item.id, 0)
                return
              }
              setCartItemCount(item.id, value)
            }}
          />
          <Button
            isIconOnly
            size="sm"
            radius="md"
            variant="light"
            color="danger"
            onPress={() => removeFromCart(item.id)}
          >
            <FiMinus className="size-4" />
          </Button>
        </div>
      </div>
      <FormTextArea<OrderRequestProps>
        name={`order.${item.id}.description`}
        label="توضیحات"
        variant="bordered"
        size="sm"
        classNames={{
          inputWrapper: cn('border-default-100 shadow-none'),
        }}
        minRows={1}
      />
    </li>
  )
}

export default CheckoutItem
