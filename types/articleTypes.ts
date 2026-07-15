import { ModificationsProps } from './generalTypes'
import { TypeResponseProps } from './typeTypes'

export interface ArticleResponseProps extends ModificationsProps {
  id: number
  name: string
  status: string
  slug: string
  parent_id: number | null
  parent: ArticleResponseProps | null
  image: string
  article_id: string | number | null | ArticleResponseProps
  type: TypeResponseProps | string | number | null
}

export interface ArticleRequestProps extends ModificationsProps {
  id: number
  name: string
  status: string | null
  slug: string
  parent_id: number | null
  parent: ArticleResponseProps | null
  image: string
  article_id: string | number | null | ArticleResponseProps
  type: TypeResponseProps | string | number | null
}
