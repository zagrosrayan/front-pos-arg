'use client'
import CustomerReportTable from '@/app/components/DataTable/ReportTable/CustomerReportTable/CustomerReportTable'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <CustomerReportTable />
    </div>
  )
}

export default page
