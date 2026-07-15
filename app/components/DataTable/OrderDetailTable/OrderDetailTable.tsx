import { NO_INFO_TO_SHOW_TEXT } from '@/app/constant/text'
import { OrderResponseProps } from '@/types/orderType'
import {
  cn,
  Image,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import React, { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export const columns = [
  { name: 'نام محصول', uid: 'food.name' },
  { name: 'توضیحات', uid: 'description' },
  { name: 'تعداد', uid: 'quantity' },
  { name: 'مبلغ (ریال)', uid: 'food.price' },
  { name: 'مبلغ کل‌(ریال)', uid: 'price' },
]

interface Props {
  orderData: OrderResponseProps
}

const OrderDetailTable = ({ orderData }: Props) => {
  const headerColumns = React.useMemo(() => {
    return columns
  }, [])

  const renderCell = React.useCallback(
    (order: OrderResponseProps, columnKey: React.Key) => {
      const cellValue = order[columnKey as keyof OrderResponseProps]

      switch (columnKey) {
        case 'food.name':
          return (
            <div className="flex items-center gap-3">
              <Image
                src={order.food?.image ?? '/assets/images/default-food.png'}
                alt="food"
                classNames={{ img: cn('max-w-20') }}
              />
              <span>{order.food?.name}</span>
            </div>
          )

        case 'description':
          return <span className="text-xs">{order.description ?? '----'}</span>
        case 'quantity':
          return <span>{Number(order.quantity).toLocaleString('fa-IR')}</span>
        case 'food.price':
          return (
            <span>{Number(order.food?.price).toLocaleString('fa-IR')}</span>
          )
        case 'price':
          return <span>{Number(order.price).toLocaleString('fa-IR')}</span>
        default:
          return cellValue as string
      }
    },
    []
  )

  return (
    <Table
      isHeaderSticky
      aria-label="order detail table"
      classNames={{
        wrapper: 'h-[50dvh]',
      }}
      selectionMode="none"
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === 'actions' ? 'center' : 'start'}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={NO_INFO_TO_SHOW_TEXT} items={orderData.children}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default OrderDetailTable
