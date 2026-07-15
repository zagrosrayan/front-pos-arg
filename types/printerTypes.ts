import { ArticleResponseProps } from './articleTypes'
import { FoodResponseProps } from './foodTypes'
import { ModificationsProps } from './generalTypes'
import { TypeResponseProps } from './typeTypes'
import { ProfitManagerProps } from './userTypes'

export interface PrinterRequestProps {
  name: string
  location: string
  status: string | null
  type: TypeResponseProps | string | number | null
  article_id: string | number | null | ArticleResponseProps
  food_id: string | number | null | FoodResponseProps
  profit_manager_id: string | number | null | ProfitManagerProps
}

export interface PrinterResponseProps extends ModificationsProps {
  id: number
  name: string
  location: string
  status: null
  type: TypeResponseProps
  article_id: string | null
  profit_manager_id: string | null
  food_id: string | null
  article: ArticleResponseProps
  food: FoodResponseProps
  profit_manager: ProfitManagerProps
}
