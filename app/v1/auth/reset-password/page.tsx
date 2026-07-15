/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import LoginForm from '@/app/components/form/auth/LoginForm'
import { LOGIN_LABEL } from '@/app/constant/label'
import { Tab, Tabs } from '@heroui/react'
import { useState } from 'react'

const Page = () => {
  const [selected, setSelected] = useState<any | null | undefined>('login')

  return (
    <div className="flex w-full flex-col">
      <Tabs
        fullWidth
        aria-label="Tabs form"
        selectedKey={selected}
        size="md"
        onSelectionChange={setSelected}
        variant="underlined"
        color="success"
        key="full"
      >
        <Tab key="login" title={LOGIN_LABEL}>
          <LoginForm />
        </Tab>
      </Tabs>
    </div>
  )
}

export default Page
