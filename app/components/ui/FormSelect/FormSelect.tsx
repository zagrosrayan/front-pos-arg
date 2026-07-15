/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { EMPTY_CONTENT_ERROR, REQUIRED_ERROR } from '@/app/constant/error'
import { SELECTED_COUNT_TEXT } from '@/app/constant/text'
import { UI_VARIANT } from '@/app/constant/ui'
import { apiRequest } from '@/lib/axios'
import { PaginationResponseProps } from '@/types/apiTypes'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react'
import {
  cn,
  Input,
  InputProps,
  Listbox,
  ListboxItem,
  Selection,
  SelectionMode,
  Spinner,
} from '@heroui/react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from 'react-hook-form'
import { HiOutlineChevronDown } from 'react-icons/hi2'

export interface SelectSearchProps<T extends FieldValues> extends InputProps {
  name: Path<T>
  keyIndex?: string
  valueIndex?: string
  labelIndex?: string
  rules?: ControllerProps['rules']
  isRequired?: boolean
  requiredMessage?: string
  apiMethods: any
  extraFilterParameters?: object
  usePortal?: boolean
  showInfo?: (data: any) => ReactNode
  selectionMode?: SelectionMode
}

const FormSelect = <T extends FieldValues>({
  name,
  keyIndex = 'id',
  valueIndex = 'id',
  labelIndex = 'name',
  rules,
  isRequired,
  requiredMessage = REQUIRED_ERROR,
  apiMethods,
  extraFilterParameters,
  usePortal = false,
  showInfo,
  selectionMode = 'single',
  ...props
}: SelectSearchProps<T>) => {
  const { control, setValue, watch, formState, clearErrors } =
    useFormContext<T>()
  const [selectedItems, setSelectedItems] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [items, setItems] = useState<Array<any>>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string> | 'all'>(
    new Set()
  )

  const handleOpen = (open: boolean) => {
    setIsOpen(open)
  }

  const { refs, floatingStyles, context } = useFloating({
    middleware: [
      offset(5),
      flip(),
      size({
        apply({ elements }) {
          if (
            !elements?.floating?.style ||
            !elements?.reference?.getBoundingClientRect()
          ) {
            return
          }

          // Change styles, e.g.
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(0, elements.reference.getBoundingClientRect().width)}px`,
          })
        },
      }),
    ],
    open: isOpen,
    onOpenChange: handleOpen,
    whileElementsMounted: autoUpdate,
  })
  const { styles } = useTransitionStyles(context, {
    duration: {
      open: 250,
      close: 150,
    },
  })

  const defaultValue = watch(name) // Get the default value from react-hook-form

  const dismiss = useDismiss(context, {})

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss])

  useEffect(() => {
    handleFetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (Array.isArray(defaultValue)) {
      if (
        defaultValue.every(
          (item: any) => typeof item === 'number' || typeof item === 'string'
        )
      ) {
        if (
          items.length &&
          defaultValue.every(
            (val: any) => !items.some((item) => item[keyIndex] === val)
          )
        ) {
          setSelectedKeys(new Set())
          setSelectedItems([])
          setValue(name, null as PathValue<T, Path<T>>)
          setInputValue('')
        }

        return
      } else {
        // If defaultValue is an array of objects
        const defaultKeys = new Set(
          defaultValue.map((item: { [x: string]: any }) =>
            String(item[keyIndex as keyof typeof item] || item)
          )
        )
        setSelectedKeys(defaultKeys as Set<string>)
        setSelectedItems(defaultValue)
        setValue(
          name,
          defaultValue.map(
            (item: { [x: string]: any }) => item[keyIndex as keyof typeof item]
          ) as PathValue<T, Path<T>>
        )
      }
    } else if (defaultValue && typeof defaultValue === 'object') {
      // For single-selection mode with an object default value
      const key = String(defaultValue[keyIndex as keyof typeof defaultValue])
      setSelectedKeys(new Set([key]))
      setInputValue(defaultValue[labelIndex])
      setSelectedItems([defaultValue])
      setValue(
        name,
        defaultValue[keyIndex as keyof typeof defaultValue] as PathValue<
          T,
          Path<T>
        >
      )
      setIsOpen(false)
    } else if (defaultValue && items.length) {
      // For single-selection mode with a primitive default value
      const key = String(defaultValue)
      setSelectedKeys(new Set([key]))
      setInputValue(items.find((item) => item[keyIndex] == key)[labelIndex])
      setSelectedItems([{ [keyIndex]: defaultValue }])
      setValue(name, defaultValue as PathValue<T, Path<T>>)
      setIsOpen(false)
    } else if (items.length || !isFetching) {
      // If no default value, reset selections
      setSelectedKeys(new Set())
      setSelectedItems([])
      setValue(name, null as PathValue<T, Path<T>>)
      setInputValue('')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  const handleFetchData = async (searchValue: string | null = null) => {
    if (isLoading || !hasMore) return
    try {
      setIsLoading(true)
      const requestConfig = apiMethods.getAll()
      requestConfig.params = {
        page,
        ...(searchValue && { search: searchValue }),
      }
      Object.assign(requestConfig.params, extraFilterParameters || {})
      const response =
        await apiRequest<PaginationResponseProps<any>>(requestConfig)

      setItems((prevItems) => {
        // Ensure response.data.items is always an array
        const newItems = response?.data?.items || []
        // Combine previous items with new items
        return [...prevItems, ...newItems]
      })

      setHasMore(page < (response?.data.last_page || 1))
      setPage((prevPage) => prevPage + 1)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const handleSelectItem = (item: object) => {
    clearErrors(name)
    setSelectedItems((prev) => {
      const exists = prev.some(
        (selectedItem) =>
          selectedItem[keyIndex as keyof typeof item] ===
          item[keyIndex as keyof typeof item]
      )

      let updatedItems

      if (selectionMode === 'single') {
        // Single selection mode: Select only the current item
        updatedItems = exists ? [] : [item]
      } else {
        // Multi-selection mode: Add or remove the item from the list
        updatedItems = exists
          ? prev.filter(
              (selectedItem) =>
                selectedItem[keyIndex as keyof typeof item] !==
                item[keyIndex as keyof typeof item]
            )
          : [...prev, item]
      }

      // Schedule setValue after state update
      setTimeout(() => {
        setValue(
          name,
          selectionMode === 'single'
            ? ((updatedItems.length > 0
                ? updatedItems[0][keyIndex as keyof typeof item]
                : undefined) as PathValue<T, Path<T>>)
            : (updatedItems.map(
                (item) => item[keyIndex as keyof typeof item]
              ) as PathValue<T, Path<T>>)
        )
      })

      return updatedItems
    })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
      handleFetchData(inputValue)
    }
  }

  const handleSelectionChange = (keys: Selection) => {
    if (keys && inputValue && selectionMode == 'multiple') {
      setInputValue('')
    }
    setSelectedKeys((prevKeys) => {
      if (keys === 'all') {
        const updatedKeys = new Set(prevKeys)
        items.forEach((item) => updatedKeys.add(String(item.id)))
        return updatedKeys
      } else if (keys.size === 0) {
        const updatedKeys = new Set(prevKeys)
        items.forEach((item) => updatedKeys.delete(String(item.id)))
        return updatedKeys
      } else {
        return new Set(keys as Set<string>)
      }
    })
  }

  function renderListbox() {
    return (
      <Listbox
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        aria-label="list"
        emptyContent={EMPTY_CONTENT_ERROR}
      >
        <>
          {items.length > 0 ? (
            items.map((item) => (
              <ListboxItem
                key={item[keyIndex]}
                onPress={() => handleSelectItem(item)}
                className="p-2 hover:bg-gray-100"
                textValue={item[labelIndex]}
                value={item[valueIndex]}
              >
                {item[labelIndex]}
              </ListboxItem>
            ))
          ) : (
            <ListboxItem
              isReadOnly
              classNames={{
                base: cn(`data-[hover=true]:!bg-transparent`),
              }}
            >
              {EMPTY_CONTENT_ERROR}
            </ListboxItem>
          )}
        </>
      </Listbox>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-start gap-5"
      id={name}
      key={name}
    >
      <div
        className={`relative w-full space-y-3 ${props.classNames?.base}`}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <Controller
          name={name}
          control={control as Control<FieldValues>}
          rules={{
            ...rules,
            ...(isRequired && {
              required: { value: true, message: requiredMessage },
            }),
          }}
          render={({ field }) => (
            <>
              <Input
                {...field}
                isDisabled={isLoading || props.isDisabled || field.disabled}
                {...props}
                radius="sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsOpen(true)}
                aria-label={name}
                variant={props.variant || UI_VARIANT}
                isInvalid={Boolean(formState.errors[name])}
                isReadOnly
                autoComplete="off"
                placeholder={
                  selectionMode == 'multiple' && selectedItems.length
                    ? `${selectedItems.length.toLocaleString('fa-IR')} ${SELECTED_COUNT_TEXT}`
                    : undefined
                }
                errorMessage={formState.errors[name]?.message as string}
                classNames={{
                  inputWrapper: cn(
                    'group-disabled/fieldset:opacity-disabled group-disabled/fieldset:!cursor-not-allowed border-default-100',
                    props.classNames?.inputWrapper // Append additional classes for `inputWrapper`
                  ),
                  input: cn(
                    'group-disabled/fieldset:cursor-not-allowed',
                    props.classNames?.input // Append additional classes for `input`
                  ),
                  label: cn(
                    props.classNames?.label // For a hypothetical `label` section
                  ),
                  base: cn(
                    props.classNames?.base // For a hypothetical `endContent` section
                  ),
                }}
                fullWidth
                endContent={
                  <div className="flex items-end gap-2">
                    {isLoading && <Spinner size="md" color="default" />}
                    <HiOutlineChevronDown
                      className={`size-3 cursor-pointer transition-all duration-100 ease-linear ${isOpen && 'rotate-180'} group-disabled/fieldset:hidden group-disabled/fieldset:cursor-not-allowed`}
                      onClick={() => setIsOpen(!isOpen)}
                    />
                  </div>
                }
              />
              {isOpen &&
                (usePortal ? (
                  <FloatingPortal>
                    <div
                      className={`absolute z-50 h-fit max-h-64 w-full overflow-auto rounded-small border-2 border-gray-200 bg-white p-1`}
                      onScroll={handleScroll}
                      ref={refs.setFloating}
                      style={{ ...floatingStyles, ...styles }}
                      {...getFloatingProps()}
                    >
                      {renderListbox()}
                    </div>
                  </FloatingPortal>
                ) : (
                  <div
                    className={`absolute z-50 h-fit max-h-64 w-full overflow-auto rounded-small border-2 border-gray-200 bg-white p-1`}
                    onScroll={handleScroll}
                    ref={refs.setFloating}
                    style={{ ...floatingStyles, ...styles }}
                    {...getFloatingProps()}
                  >
                    {renderListbox()}
                  </div>
                ))}
            </>
          )}
        />
      </div>
      {showInfo && selectedItems.length ? (
        <div className="">
          {showInfo(
            items.find((item) => item[keyIndex] == selectedItems[0][keyIndex])
          )}
        </div>
      ) : null}
    </div>
  )
}

export default FormSelect
