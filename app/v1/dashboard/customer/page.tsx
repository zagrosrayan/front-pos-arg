'use client'
import React from 'react'
import CustomerTable from '@/app/components/DataTable/CustomerTable/CustomerTable'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <CustomerTable />
    </div>
  )
}

export default page
