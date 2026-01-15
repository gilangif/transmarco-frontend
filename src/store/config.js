import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const host = "https://api.oyen.online"

const configSlice = createSlice({
  name: "sheets",
  initialState: { host },
  reducers: {},
})

export const { setStock, setType } = configSlice.actions
export default configSlice.reducer
