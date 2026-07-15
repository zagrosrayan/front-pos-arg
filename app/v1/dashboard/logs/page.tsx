'use client'

import LogTable from '@/app/components/DataTable/LogTable'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <LogTable />
    </div>
  )
}

export default page
