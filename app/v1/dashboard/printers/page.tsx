'use client'
import PrinterTable from '@/app/components/DataTable/PrinterTable'
import React from 'react'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full space-y-8 overflow-y-auto p-5 pb-20 md:pb-0">
      <PrinterTable />
    </div>
  )
}

export default page
