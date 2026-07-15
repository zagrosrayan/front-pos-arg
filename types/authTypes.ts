import { UserInfoProps } from './userTypes'

export type AuthContext = {
  token: string | null
  userInfo: UserInfoProps | null
}

export interface LoginFormRequestProps {
  username: string
  password: string
}

export interface LoginFormResponseProps {
  items: {
    user: UserInfoProps
    token: string
  }
}

export interface ResetPasswordRequestProps {
  old_password: string
  password: string
  password_confirmation: string
}
