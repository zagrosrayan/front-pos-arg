import { LOADING_TEXT } from '@/app/constant/text'

const LoadingPage = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-5">
      <div className="loader"></div>
      <div className="w-max">
        <h1 className="whitespace-nowrap text-lg font-medium text-default-400">
          {LOADING_TEXT}
        </h1>
      </div>
    </main>
  )
}

export default LoadingPage
