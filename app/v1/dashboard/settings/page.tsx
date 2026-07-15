'use client'
import SettingPage from '@/app/components/SettingPage'
import React from 'react'

const page = () => {
  return (
    <div className="relative h-[calc(100svh-90px)] w-full overflow-y-auto p-5 pb-20 md:pb-0">
      <SettingPage />
    </div>
  )
}

export default page
