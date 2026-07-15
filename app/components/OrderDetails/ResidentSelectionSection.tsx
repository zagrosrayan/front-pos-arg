/* eslint-disable */

'use client'

import React from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import { Card, CardBody } from '@heroui/react'
import { apiRequest } from '@/lib/axios'
import { USER_RESIDENT_API } from '@/routes/api/user'
import {
  EXIT_DATE_LABEL,
  FULL_NAME_LABEL,
  JOIN_DATE_LABEL,
  NAME_COMPANY,
  ROOM_LABEL,
} from '@/app/constant/label'
import type { UseFormSetValue } from 'react-hook-form'
import type { OrderRequestProps } from '@/types/orderType'
import type { UserResidentResponseProps } from '@/types/userTypes'

export type ResidentData = Partial<UserResidentResponseProps> & {
  Room?: string | null
  Reserve?: string | null
  GuestName: string
  company?: string | null
  Arrival?: string | null
  departure?: string | null
}

export type OptionType = {
  value: string
  label: string
  data: ResidentData
}

interface ResidentSelectionSectionProps {
  setValue: UseFormSetValue<OrderRequestProps>
  selectedOption: OptionType | null
  setSelectedOption: (option: OptionType | null) => void
  selectedResident: ResidentData | null
  setSelectedResident: (data: ResidentData | null) => void
}

const ResidentSelectionSection = ({
  setValue,
  selectedOption,
  setSelectedOption,
  selectedResident,
  setSelectedResident,
}: ResidentSelectionSectionProps) => {
  return (
    <>
      <AsyncPaginate
        inputId="room-reservation-select"
        placeholder="شماره اتاق را وارد کنید..."
        value={selectedOption}
        loadOptions={async (searchQuery, loadedOptions, additional) => {
          const page = additional?.page || 1
          try {
            const response = await apiRequest<any>({
              ...USER_RESIDENT_API.getAll(),
              params: {
                page,
                room_number: searchQuery || '',
              },
            })

            const options: OptionType[] = (response?.data?.items || []).map(
              (item: any) => ({
                value: String(item?.Reserve ?? ''),
                label: `${item?.Room ?? ''} - ${item?.Reserve ?? ''}`,
                data: {
                  ...(item ?? {}),
                  Room: item?.Room?.toString?.() ?? String(item?.Room ?? ''),
                  Reserve:
                    item?.Reserve?.toString?.() ?? String(item?.Reserve ?? ''),
                },
              })
            )

            return {
              options,
              hasMore: response?.data?.current_page < response?.data?.last_page,
              additional: {
                page: page + 1,
              },
            }
          } catch (error) {
            console.error('Error loading residents:', error)
            return {
              options: [],
              hasMore: false,
            }
          }
        }}
        formatOptionLabel={(option: OptionType, { context }) => (
          <div className="flex flex-col">
            {context === 'menu' && option.data ? (
              <>
                <span className="font-bold">
                  اتاق: {option.data.Room || 'نامشخص'}
                </span>
                <span>مهمان: {option.data.GuestName || 'نامشخص'}</span>
                <span className="text-sm text-default-500">
                  رزرو: {option.data.Reserve || 'نامشخص'}
                </span>
              </>
            ) : (
              <span>{option.label}</span>
            )}
          </div>
        )}
        onChange={(option) => {
          if (option) {
            setValue('room_number', option.data.Room || '')
            setValue('reserve_number', option.value || '')
            setSelectedOption(option)
            setSelectedResident(option.data ?? null)
          } else {
            setValue('room_number', '')
            setValue('reserve_number', '')
            setSelectedOption(null)
            setSelectedResident(null)
          }
        }}
        onInputChange={(value) => value}
        additional={{ page: 1 }}
        loadingMessage={() => 'در حال بارگذاری...'}
        noOptionsMessage={() => 'موردی یافت نشد'}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
          }),
          option: (provided) => ({
            ...provided,
            textAlign: 'right',
            direction: 'rtl',
          }),
        }}
      />

      {selectedResident && (
        <div className="flex flex-wrap gap-3 rounded-lg border p-3">
          <Card>
            <CardBody className="text-xs">
              {ROOM_LABEL}: {selectedResident.Room}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-xs">
              {NAME_COMPANY}: {selectedResident.company}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-xs">
              {FULL_NAME_LABEL}: {selectedResident.GuestName}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-xs">
              {JOIN_DATE_LABEL}: {selectedResident.Arrival}
            </CardBody>
          </Card>
          {selectedResident.departure && (
            <Card>
              <CardBody className="text-xs">
                {EXIT_DATE_LABEL}: {selectedResident.departure}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </>
  )
}

export default ResidentSelectionSection
