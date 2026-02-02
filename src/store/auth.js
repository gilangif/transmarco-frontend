import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  accessToken: localStorage.getItem("accessToken") || "",
  username: localStorage.getItem("username") || "anonymous",
  brand: localStorage.getItem("brand") || "",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { username, brand, accessToken } = action.payload

      state.brand = brand
      state.username = username
      state.accessToken = accessToken

      localStorage.setItem("brand", brand)
      localStorage.setItem("username", username)
      localStorage.setItem("accessToken", accessToken)
    },

    logout: (state) => {
      state.username = ""
      state.brand = ""
      state.accessToken = ""

      localStorage.removeItem("brand")
      localStorage.removeItem("username")
      localStorage.removeItem("accessToken")
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
