'use client'

import { AppStore, makeStore } from '@/lib/store'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Provider } from 'react-redux'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <Provider store={storeRef.current}>
      {isClient && (
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider
            attribute="class"
            enableSystem={false}
            forcedTheme={'light'}
            themes={['light']}
          >
            {children}
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Slide}
              // toastClassName={css({ fontFamily: 'Times New Roman, Serif' })}
            />
          </NextThemesProvider>
        </HeroUIProvider>
      )}
    </Provider>
  )
}
