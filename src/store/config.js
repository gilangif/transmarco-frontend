import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const host = "https://api.oyen.online"
// export const host = "http://192.168.224.42:1234"

const configSlice = createSlice({
  name: "config",
  initialState: { host, navbar: { title: "Dashboard", desc: "" } },
  reducers: {
    setNavbarTitle: (state, action) => {
      state.navbar = action.payload
    },
  },
})

export const { setNavbarTitle } = configSlice.actions
export default configSlice.reducer
