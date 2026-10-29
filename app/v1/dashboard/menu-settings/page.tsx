'use client'

import ArticleTable from '../../../components/DataTable/ArticleTable'

const MenuSettingsPage = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full space-y-8 overflow-y-auto p-5 pb-20 md:pb-0">
      <div>
        <h1 className="text-xl font-bold text-default-700">
          تنظیمات نمایش منو
        </h1>
        <p className="mt-2 text-sm text-default-500">
          ترتیب دسته‌ها و نمایش آن‌ها را برای منوی POS تنظیم کنید.
        </p>
      </div>
      <ArticleTable settingsOnly />
    </div>
  )
}

export default MenuSettingsPage
