import { setReduxToken } from '@/app/features/auth/authSlice'
import { TOKEN_KEY } from '@/lib/axios'
import { storageManager } from '@/utils/storage/StorageManager'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

const useAuth = (): [string | null, (token: string | null) => void] => {
  const dispatch = useDispatch()

  const [token, setTokenLocally] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const tokensFromStorage = storageManager.getItem('local', TOKEN_KEY)
      return tokensFromStorage ? (tokensFromStorage as string) : null
    } else {
      return null
    }
  })

  const updateTokens = (newToken: string | null) => {
    setTokenLocally(newToken)
    if (newToken && typeof window !== 'undefined') {
      storageManager.setItem('local', TOKEN_KEY, newToken)
    } else if (typeof window !== 'undefined') {
      storageManager.removeItem('local', TOKEN_KEY)
    }
    dispatch(setReduxToken(newToken))
  }

  return [token, updateTokens]
}

export default useAuth
