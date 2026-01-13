import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const host = "http://192.168.226.42:3000"

const configSlice = createSlice({
  name: "sheets",
  initialState: { host },
  reducers: {},
})

export const { setStock, setType } = configSlice.actions
export default configSlice.reducer
