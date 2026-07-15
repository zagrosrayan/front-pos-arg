'use client'

import { SERVICE_COST_LABEL } from '@/app/constant/label'
import { CalculateItems } from '@/types/apiTypes'

interface CheckoutSummarySectionProps {
  calculatedData?: {
    items: CalculateItems
  }
  hasRateService: boolean
}

const CheckoutSummarySection = ({
  calculatedData,
  hasRateService,
}: CheckoutSummarySectionProps) => {
  return (
    <div>
      <dl className="flex flex-col gap-4 rounded-large border-2 border-default-100 p-4 py-4">
        <div className="flex justify-between">
          <dt className="text-small text-default-500">جمع بعد از تخفیف</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(calculatedData?.items?.total_price).toLocaleString(
                'fa-IR'
              )}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-small text-default-500">مبلغ قبل از تخفیف</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(calculatedData?.items?.product_price).toLocaleString(
                'fa-IR'
              )}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-small text-default-500">تخفیف</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(calculatedData?.items?.discounted_price).toLocaleString(
                'fa-IR'
              )}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-small text-default-500">{SERVICE_COST_LABEL}</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(
                hasRateService ? calculatedData?.items?.rate_service : 0
              ).toLocaleString('fa-IR')}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-small text-default-500">مالیات</dt>
          <dd className="flex gap-1 text-small font-semibold text-default-700">
            <span className="font-semibold">
              {Number(calculatedData?.items?.tax_amount).toLocaleString(
                'fa-IR'
              )}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>

        <hr
          className="h-divider w-full shrink-0 border-none bg-default-200"
          role="separator"
        />

        <div className="flex justify-between">
          <dt className="text-small font-semibold text-default-500">جمع کل</dt>
          <dd className="flex gap-1 text-large font-semibold text-success">
            <span className="font-semibold">
              {Number(calculatedData?.items?.final_price).toLocaleString(
                'fa-IR'
              )}
            </span>
            <span className="font-semibold">ریال</span>
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default CheckoutSummarySection
