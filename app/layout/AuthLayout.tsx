import Image from 'next/image'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="flex h-full min-h-screen w-full flex-col items-start overflow-hidden bg-content1 bg-gradient-to-tr from-black to-[#166D3B] bg-cover bg-center">
      <div className="h-screen w-full p-3">
        <section className="mx-auto flex h-full w-full flex-col items-center gap-4 rounded-large bg-white px-8 pb-10 pt-6 shadow-small sm:max-w-sm">
          <Image
            src="/assets/images/logo/arg-logo.svg"
            className="w-full max-w-32"
            width={1000}
            height={1000}
            alt="logo"
            priority
          />
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
