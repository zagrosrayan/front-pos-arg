'use client'
import { FORBIDDEN_ERROR } from '@/app/constant/error'
import { BACK_TO_DASHBOARD_LABEL, LOGIN_LABEL } from '@/app/constant/label'
import { AUTH_PATH, DASHBOARD_PATH } from '@/routes/path'
import { Button } from '@heroui/react'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-default-300">
      <h1 className="text-7xl font-bold">۴۰۳</h1>
      <p className="text-lg">{FORBIDDEN_ERROR}</p>
      <Button color="success" as={Link} href={DASHBOARD_PATH.MAIN}>
        {BACK_TO_DASHBOARD_LABEL}
      </Button>
      <Button color="primary" variant="ghost" as={Link} href={AUTH_PATH.LOGIN}>
        {LOGIN_LABEL}
      </Button>
    </div>
  )
}

export default page
