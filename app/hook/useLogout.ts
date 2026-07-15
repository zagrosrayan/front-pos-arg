/* eslint-disable @typescript-eslint/no-unused-vars */

import { useRouter } from 'next/navigation'
import useAuth from './useAuth'
import { storageManager } from '@/utils/storage/StorageManager'
import { AUTH_PATH } from '@/routes/path'
import { TOKEN_KEY } from '@/lib/axios'

export const useLogout = () => {
  const router = useRouter()
  const [token, setToken] = useAuth()

  const logout = async () => {
    try {
      setToken(null)
      storageManager.removeItem('local', TOKEN_KEY)
      router.push(AUTH_PATH.LOGIN)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { logout }
}
