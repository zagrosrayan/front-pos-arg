'use client'
import ResidentCustomerReportTable from '@/app/components/DataTable/ReportTable/ResidentCustomerReportTable/ResidentCustomerReportTable'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <ResidentCustomerReportTable />
    </div>
  )
}

export default page
