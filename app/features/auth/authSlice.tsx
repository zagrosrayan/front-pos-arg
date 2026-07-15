import { AuthContext } from '@/types/authTypes'
import { UserInfoProps } from '@/types/userTypes'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

const initialState: AuthContext = {
  token: null,
  userInfo: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setReduxToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
    },
    setUserInfo: (state, action: PayloadAction<UserInfoProps | null>) => {
      state.userInfo = action.payload
    },
  },
})

export const { setReduxToken, setUserInfo } = authSlice.actions

export default authSlice.reducer
