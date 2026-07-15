'use client'
import { DASHBOARD_PATH } from '@/routes/path'
// import { dispatchChangeEvent } from '@/app/triggers/changeCategory/dispatchChangeEvent'

import { ArticleResponseProps } from '@/types/articleTypes'
import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { IoFastFoodSharp } from 'react-icons/io5'

interface CategoryItemProps {
  category: ArticleResponseProps
  isActive?: boolean
}

const CategoryItem = ({ category, isActive }: CategoryItemProps) => {
  const router = useRouter()

  const addParams = (id: number) => {
    // Create a new URLSearchParams object from the current query parameters
    const currentParams = new URLSearchParams(window.location.search)

    // Append the new query parameter
    currentParams.set('article_id', id.toString())

    // Construct the new URL with the updated parameters
    const newUrl = `${DASHBOARD_PATH.MAIN}?${currentParams.toString()}`

    router.push(newUrl)
  }

  return (
    <div className="space-y-2">
      <Button
        isIconOnly
        radius="lg"
        size="lg"
        variant="ghost"
        color="success"
        className={`h-24 w-24 shrink-0 overflow-hidden border-default-100 data-[hover=true]:border-success data-[hover=true]:!text-white ${isActive && 'border-success bg-success !text-white'}`}
        onPress={() => addParams(category.id)}
      >
        <IoFastFoodSharp className="size-12" />
        {/* <div
          className="relative size-24 flex-shrink-0 rounded-small bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${category.image.replace('http://localhost', 'https://pos.yazdarghotel.com:8073') ?? '/assets/images/default-food.png'}")`,
          }}
        ></div> */}
      </Button>
      <p className="text-center text-small font-semibold">{category.name}</p>
    </div>
  )
}

export default CategoryItem
