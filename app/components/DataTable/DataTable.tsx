/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import {
  FIRST_PAGE_TEXT,
  LAST_PAGE_TEXT,
  LOADING_CONTENT_TEXT,
  NO_INFO_TO_SHOW_TEXT,
} from '@/app/constant/text'
import { apiRequest } from '@/lib/axios'
import { PaginationResponseProps } from '@/types/apiTypes'
import {
  Button,
  cn,
  Pagination,
  Selection,
  SelectionMode,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface BaseData {
  id?: string | number
}

export interface ColumnsData<T> {
  uid: string
  name: string
  visible?: boolean
  render?: (data: T, rowIndex: number) => ReactNode
}

export interface DataTableProps<T> {
  columns: ColumnsData<T>[]
  totalColumns?: ColumnsData<T>[]
  searchIndex?: string
  apiMethods?: any
  dataTableId?: string
  extraFilterParameters?: object
  setExtraFields?: (data: any) => void
  isStriped?: boolean
  selectionMode?: SelectionMode
  selectedItems?: T[]
  onSelectItems?: (items: T[]) => void
  hidePagination?: boolean
  dataTransformer?: (data: T[]) => T[]
}

export type MetaType = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const DataTable = <T extends BaseData>({
  columns,
  totalColumns,
  dataTableId,
  apiMethods,
  extraFilterParameters,
  setExtraFields,
  isStriped,
  selectionMode = 'none',
  onSelectItems,
  selectedItems,
  hidePagination = false,
  dataTransformer,
}: DataTableProps<T>) => {
  const [meta, setMeta] = useState<MetaType>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 1,
  })
  const [data, setData] = useState<T[] | Array<any>>([])
  const [page, setPage] = useState(1)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

  const abortControllerRef = useRef<AbortController | null>(null)
  const prevExtraFilterParametersRef = useRef<object | undefined>(undefined)

  // دیتای فیلتر شده با dataTransformer
  const filteredData = useMemo(() => {
    if (dataTransformer) {
      return dataTransformer(data as T[])
    }
    return data
  }, [data, dataTransformer])

  const handleSelection = (keys: Selection) => {
    let normalizedKeys: Selection = keys

    if (keys === 'all') {
      normalizedKeys = new Set(filteredData.map((item) => String(item.id)))
    }

    setSelectedKeys(normalizedKeys)

    if (!onSelectItems) return

    const prev = selectedItems ?? []
    let currentSelected: T[] = []

    const keySet =
      normalizedKeys === 'all'
        ? new Set(filteredData.map((d) => String(d.id)))
        : new Set(Array.from(normalizedKeys))

    currentSelected = filteredData.filter((item) => keySet.has(String(item.id)))

    const merged = [
      ...prev.filter(
        (p) =>
          !filteredData.some((d) => d.id === p.id) ||
          currentSelected.some((c) => c.id === p.id)
      ),
      ...currentSelected.filter((c) => !prev.some((p) => p.id === c.id)),
    ]

    onSelectItems(merged)
  }

  const handleFetchData = async (
    page: number = Number(searchParams.get('page') ?? 1)
  ) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      setIsTableLoading(true)
      setPage(page)

      if (!hidePagination) {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.set('page', String(page))
        router.push(`${pathname}?${newSearchParams.toString()}`)
      }

      if (apiMethods) {
        const requestConfig = apiMethods.getAll()
        requestConfig.params = {
          page,
        }
        requestConfig.signal = abortControllerRef.current.signal
        Object.assign(requestConfig.params, extraFilterParameters || {})

        const response =
          await apiRequest<PaginationResponseProps<T>>(requestConfig)
        if (response?.extra_fields && setExtraFields) {
          setExtraFields(response?.extra_fields)
        }
        if (response?.data?.last_page && response?.data?.last_page < page) {
          await handleFetchData(response?.data.last_page)
        } else if (response?.data) {
          setData(response.data.items)
          setMeta({
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page,
            total: response.data.total,
          })
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsTableLoading(false)
    }
  }

  useEffect(() => {
    if (pathname) {
      handleFetchData()
    }
  }, [pathname])

  const headerColumns = useMemo(() => {
    return columns
  }, [])

  const itemIndexMap = useMemo(() => {
    return new Map(
      filteredData.map((item, index) => [item, (page - 1) * 15 + index])
    )
  }, [page, filteredData])

  const renderCell = (item: T, columnUid: string) => {
    const column = columns.find((col) => col.uid === columnUid)

    if (!column) return null

    if (column.render) {
      const itemIndex = itemIndexMap.get(item)

      return column.render(item, itemIndex ?? -1)
    }

    return item[columnUid as keyof T] as ReactNode
  }

  const renderTotalCell = (item: T, columnUid: string) => {
    const column = totalColumns
      ? totalColumns.find((col) => col.uid === columnUid)
      : columns.find((col) => col.uid === columnUid)

    if (!column) return null

    if (column.render) {
      const itemIndex = itemIndexMap.get(item)

      return column.render(item, itemIndex ?? -1)
    }

    return item[columnUid as keyof T] as ReactNode
  }

  const onLastPage = useCallback(() => {
    if (page !== meta.last_page) {
      handleFetchData(meta.last_page)
    }
  }, [page, meta])

  const onFirstPage = useCallback(() => {
    if (page > 1) {
      handleFetchData(1)
    }
  }, [page])

  useEffect(() => {
    if (
      JSON.stringify(prevExtraFilterParametersRef.current) !==
      JSON.stringify(extraFilterParameters)
    ) {
      handleFetchData()
      prevExtraFilterParametersRef.current = extraFilterParameters
    }
  }, [extraFilterParameters])

  const bottomContent = useMemo(() => {
    if (hidePagination) return null

    return (
      <div
        className={`flex flex-col items-center justify-between gap-3 px-2 py-2 lg:flex-row lg:gap-0`}
      >
        <span className="text-sm text-default-500">
          {dataTransformer
            ? `${filteredData.length.toLocaleString('fa-IR')} مورد از ${meta.total?.toLocaleString('fa-IR')} نمایش داده شده`
            : `${meta.total?.toLocaleString('fa-IR')} مورد یافت شد`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="success"
          initialPage={page}
          page={page}
          total={meta.last_page}
          onChange={handleFetchData}
          dir="ltr"
        />
        <div className="flex w-fit justify-center gap-2 lg:justify-end">
          <Button
            isDisabled={page === meta.last_page}
            size="sm"
            variant="flat"
            onPress={onLastPage}
          >
            {LAST_PAGE_TEXT}
          </Button>
          <Button
            isDisabled={page === 1}
            size="sm"
            variant="flat"
            onPress={onFirstPage}
          >
            {FIRST_PAGE_TEXT}
          </Button>
        </div>
      </div>
    )
  }, [isTableLoading, meta, hidePagination, filteredData.length])

  return (
    <div className="">
      <Table
        aria-label={dataTableId}
        isStriped={isStriped}
        key={dataTableId}
        bottomContent={bottomContent}
        isHeaderSticky
        bottomContentPlacement="outside"
        classNames={{
          wrapper: cn(`h-[48dvh] ${isTableLoading && 'overflow-hidden'} p-2`),
          loadingWrapper: cn(
            'w-full h-full bg-default-300/50 z-[22] backdrop-blur-md'
          ),
          td: cn('align-baseline'),
        }}
        selectionMode={selectionMode}
        topContentPlacement="outside"
        onRowAction={() => {}}
        onCellAction={() => {}}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelection}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={false}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        {
          <TableBody
            emptyContent={NO_INFO_TO_SHOW_TEXT}
            items={filteredData}
            isLoading={isTableLoading}
            loadingContent={<Spinner label={LOADING_CONTENT_TEXT} />}
          >
            {filteredData.map((item, index) => {
              return (
                <Fragment key={index}>
                  <TableRow key={item.id}>
                    {headerColumns.map((column) => (
                      <TableCell key={column.uid}>
                        {renderCell(item, column.uid)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {item.total_summary && (
                    <TableRow key={'total_' + index}>
                      {headerColumns.map((column) => (
                        <TableCell key={column.uid}>
                          {renderTotalCell(item, column.uid)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        }
      </Table>
    </div>
  )
}
export default DataTable
