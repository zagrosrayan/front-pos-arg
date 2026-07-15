'use client'

import FoodReportTable from '@/app/components/DataTable/FoodReportTable'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <FoodReportTable />
    </div>
  )
}

export default page
