import { ModificationsProps } from './generalTypes'

export interface TypeResponseProps extends ModificationsProps {
  id: number
  name: string
  category: string
  slug: string
  code: string | number | null
}
