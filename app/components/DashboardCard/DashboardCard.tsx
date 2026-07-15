'use client'
import { Card, CardBody, cn } from '@heroui/react'
import { ElementType } from 'react'
interface Props {
  title?: string
  description?: string
  icon?: ElementType
  isLoading?: boolean
}
const DashboardCard = ({
  title,
  description,
  icon: Icon,
  isLoading,
}: Props) => {
  return (
    <Card
      classNames={{
        base: cn('max-w-sm p-5 mx-auto w-full'),
        body: cn('flex-row justify-between gap-3 items-center'),
      }}
    >
      <CardBody>
        <div className="flex w-fit flex-col gap-3 text-right text-large">
          <p
            className={`text-small font-bold ${isLoading && 'h-1 w-full animate-pulse bg-gray-200'}`}
          >
            {title && title}
          </p>
          <span className="text-2xl text-default-500">
            {description && description}
          </span>
        </div>
        <div className="h-fit w-fit rounded-medium bg-success-50 p-3">
          {Icon ? (
            <Icon className="size-10 shrink-0 text-success" />
          ) : (
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-gray-200"></div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default DashboardCard
