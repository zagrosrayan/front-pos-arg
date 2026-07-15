'use client'
import { apiRequest } from '@/lib/axios'
import { FOOD_API } from '@/routes/api/food'
import { PaginationResponseProps } from '@/types/apiTypes'
import { FoodResponseProps } from '@/types/foodTypes'
import { cn, Input, Spinner } from '@heroui/react'
import { debounce } from 'lodash'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import FoodItem from './FoodItem'
import { NO_ITEM_TO_SHOW_TEXT } from '@/app/constant/text'

const FoodList = () => {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingLoading, setIsFetchingLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [foodsList, setFoodsList] =
    useState<PaginationResponseProps<FoodResponseProps> | null>(null)
  const articleId = searchParams.get('article_id')
  const [currentArticleId, setArticleId] = useState(articleId)
  const [fetching, setFetching] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
      setFetching(!fetching)
    }
  }

  const fetchFoods = async (
    page: number = 1,
    value: string | null = searchValue
  ) => {
    try {
      if (isFetchingLoading) return
      setIsFetchingLoading(true)
      const requestConfig = FOOD_API.getAll()
      requestConfig.params = { page: page } // Set the default page parameter

      if (articleId && !value) {
        requestConfig.params = {
          ...requestConfig.params, // Keep existing parameters
          article_id: articleId, // Add the article_id parameter
        }
      }

      if (value) {
        requestConfig.params = {
          ...requestConfig.params, // Keep existing parameters
          name: value,
        }
      }
      const response =
        await apiRequest<PaginationResponseProps<FoodResponseProps>>(
          requestConfig
        )
      const updatedItems = [
        ...(foodsList?.items || []),
        ...(response?.data.items || []),
      ]
      if (articleId != currentArticleId || value !== searchValue) {
        setFoodsList(
          response?.data as PaginationResponseProps<FoodResponseProps>
        )
      } else {
        setFoodsList({
          ...response?.data, // Spread the pagination data
          current_page: response?.data?.current_page ?? 0,
          last_page: response?.data?.last_page ?? 0,
          per_page: response?.data?.per_page ?? 0,
          total: response?.data?.total ?? 0,
          items: updatedItems, // Merged items
        })
      }

      setArticleId(articleId)
      setIsLoading(false)
      setIsFetchingLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setFoodsList(null)
    setIsLoading(true)
    fetchFoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (
      foodsList &&
      !isFetchingLoading &&
      foodsList.current_page < foodsList.last_page
    ) {
      fetchFoods(foodsList.current_page + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetching])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value)
      fetchFoods(1, value)
    }, 500),
    []
  )

  const handleSearchValue = (value: string) => {
    setFoodsList(null)
    setIsFetchingLoading(true)
    setSearchValue(value)
    debouncedSearch(value)
  }

  return (
    <div
      className="relative grid h-fit max-h-[calc(100svh-320px)] w-full gap-3 overflow-auto overflow-y-auto px-3 pb-20 md:grid-cols-2 md:pb-0 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
      onScroll={handleScroll}
    >
      <div className="sticky top-0 z-20 h-fit w-full bg-white pb-2 md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
        <Input
          startContent={<IoSearchOutline className="size-5" />}
          placeholder="عنوان غذا را وارد نمایید..."
          classNames={{
            base: cn('max-w-md'),
          }}
          value={searchValue}
          onValueChange={handleSearchValue}
        />
      </div>
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="relative flex h-fit w-full gap-5 rounded-small border-2 border-default-100 p-3"
            >
              <div className="relative h-32 w-32 flex-shrink-0 animate-pulse rounded-small bg-gray-300"></div>
              <div className="flex flex-col items-start justify-between gap-2">
                <div className="h-3 w-32 animate-pulse rounded-medium bg-gray-300" />
                <div className="h-2 w-32 animate-pulse rounded-medium bg-gray-300" />
                <div className="h-2 w-32 animate-pulse items-center gap-1 rounded-medium bg-gray-300" />
              </div>
            </div>
          ))
        : foodsList?.items &&
          foodsList.items.map((item, index) => {
            return <FoodItem key={index} food={item} />
          })}
      {isFetchingLoading ? (
        <Spinner
          color="success"
          className="mx-auto w-full py-2 md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3"
        />
      ) : (
        foodsList?.items &&
        !foodsList?.items.length && (
          <p className="mx-auto h-fit w-full py-2 text-center text-xl font-bold md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
            {NO_ITEM_TO_SHOW_TEXT}
          </p>
        )
      )}
    </div>
  )
}

export default FoodList
