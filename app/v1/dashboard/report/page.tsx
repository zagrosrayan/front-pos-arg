'use client'

import ReportTable from '@/app/components/DataTable/ReportTable'
import React from 'react'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <ReportTable />
    </div>
  )
}

export default page
