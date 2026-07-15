'use client'
import { CATEGORY_FOOD_LABEL } from '@/app/constant/label'
import CategoryList from '../../components/CategoryList'
import Checkout from '../../components/Checkout'
import FoodList from '../../components/FoodList'

const Page = () => {
  return (
    <div className="relative w-full space-y-2 overflow-hidden pb-20 md:pb-0">
      <div className="sticky top-0 z-20 space-y-3 bg-white">
        <p className="pr-5 text-lg font-extrabold md:text-xl">
          {CATEGORY_FOOD_LABEL}
        </p>
        <div className="space-y-5 overflow-hidden pb-1 pt-3">
          <CategoryList />
        </div>
      </div>
      <div className="flex items-start">
        <FoodList />
        <div className="ml-2 hidden w-0.5 shrink-0 rounded-full bg-default-100 lg:inline-block" />
        <Checkout className="hidden h-fit max-h-[calc(100svh-320px)] w-full max-w-fit overflow-auto border-r px-3 pb-20 md:pb-0 lg:inline-block lg:flex-none" />
      </div>
    </div>
  )
}

export default Page
