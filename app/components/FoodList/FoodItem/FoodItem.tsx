import { useAddToCart } from '@/app/hook/useCart'
import { FoodResponseProps } from '@/types/foodTypes'
import { Button } from '@heroui/react'
import { FiPlus } from 'react-icons/fi'

interface FoodItemProps {
  food: FoodResponseProps
}

const FoodItem = ({ food }: FoodItemProps) => {
  const addToCart = useAddToCart()
  return (
    <div className="relative flex h-fit w-full gap-5 rounded-small border-2 border-default-100 p-3">
      <div
        className="relative h-28 w-28 flex-shrink-0 rounded-small bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${food.image ?? '/assets/images/default-food.png'}")`,
        }}
      ></div>
      <Button
        isIconOnly
        radius="none"
        className="absolute bottom-0 right-0 h-14 w-14 rounded-tl-3xl bg-white"
        onPress={() => addToCart({ ...food, quantity: 1 })}
      >
        <FiPlus className="size-7 rounded-full bg-black p-1 text-white" />
      </Button>
      <div className="flex flex-col items-start gap-3">
        <h1 className="mt-2 text-lg font-bold">{food.name}</h1>
        {food.description && (
          <p className="line-clamp-1 text-sm text-default-400">
            {food.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-default-600">
          <span className="text-xl">
            {Number(food.price).toLocaleString('fa-IR')}
          </span>
          <span className="text-sm">ریال</span>
        </div>
      </div>
    </div>
  )
}

export default FoodItem
