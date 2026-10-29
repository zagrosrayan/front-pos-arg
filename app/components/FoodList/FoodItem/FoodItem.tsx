/* eslint-disable @next/next/no-img-element */
import { useAddToCart } from '@/app/hook/useCart'
import { FoodResponseProps } from '@/types/foodTypes'
import { Button } from '@heroui/react'
import { FiPlus } from 'react-icons/fi'
import { useEffect, useState } from 'react'

interface FoodItemProps {
  food: FoodResponseProps
}

const FoodItem = ({ food }: FoodItemProps) => {
  const addToCart = useAddToCart()
  const defaultImage = '/assets/images/default-food.png'
  const [imageSrc, setImageSrc] = useState(
    food.image_url ?? food.image ?? defaultImage
  )

  useEffect(() => {
    setImageSrc(food.image_url ?? food.image ?? defaultImage)
  }, [food.image, food.image_url])

  return (
    <div className="relative flex h-fit w-full gap-5 rounded-small border-2 border-default-100 p-3">
      <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-small bg-default-50">
        <img
          src={imageSrc}
          alt={food.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setImageSrc(defaultImage)}
        />
      </div>
      <Button
        isIconOnly
        radius="none"
        className="absolute bottom-0 right-0 h-14 w-14 rounded-tl-3xl bg-white"
        onPress={() => addToCart({ ...food, quantity: 1 })}
      >
        <FiPlus className="size-7 rounded-full bg-black p-1 text-white" />
      </Button>
      <div className="min-w-0 flex flex-1 flex-col items-start gap-3">
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
