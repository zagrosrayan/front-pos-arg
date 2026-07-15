'use client'
import { apiRequest } from '@/lib/axios'
import { ARTICLE_API } from '@/routes/api/article'
import { ArticleResponseProps } from '@/types/articleTypes'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import CategoryItem from './CategoryItem'
import { PaginationResponseProps } from '@/types/apiTypes'

const CategoryList = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [articlesList, setArticlesList] = useState<
    ArticleResponseProps[] | null
  >(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const searchParams = useSearchParams()

  const articleId = searchParams.get('article_id')
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  const fetchArticles = async () => {
    try {
      const response = await apiRequest<
        PaginationResponseProps<ArticleResponseProps>
      >(ARTICLE_API.getAll())
      setArticlesList(response?.data.items as ArticleResponseProps[])
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex w-full gap-5 overflow-x-auto overflow-y-hidden px-5 active:cursor-grab md:pb-3"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <div
              className="h-24 w-24 shrink-0 animate-pulse rounded-large bg-gray-300"
              key={index}
            />
          ))
        : articlesList?.map((item) => (
            <CategoryItem
              key={item.id}
              category={item}
              isActive={(articleId as string) == String(item.id)}
            />
          ))}
    </div>
  )
}

export default CategoryList
