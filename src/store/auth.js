import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  accessToken: localStorage.getItem("accessToken") || "",
  username: localStorage.getItem("username") || "anonymous",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { username, accessToken } = action.payload

      state.username = username
      state.accessToken = accessToken

      localStorage.setItem("username", username)
      localStorage.setItem("accessToken", accessToken)
    },

    logout: (state) => {
      state.username = ""
      state.accessToken = ""

      localStorage.removeItem("username")
      localStorage.removeItem("accessToken")
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
