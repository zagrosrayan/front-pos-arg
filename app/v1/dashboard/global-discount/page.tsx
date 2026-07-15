import GlobalDiscountTable from '@/app/components/DataTable/GlobalDiscountTable'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full space-y-8 overflow-y-auto p-5 pb-20 md:pb-0">
      <GlobalDiscountTable />
    </div>
  )
}

export default page
