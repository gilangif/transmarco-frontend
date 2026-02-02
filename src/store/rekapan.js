import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  csv: localStorage.getItem("csv") || "",
}

const rekapanSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCSV: (state, action) => {
      const { payload } = action

      state.csv = payload
      localStorage.setItem("csv", payload)
    },
  },
})

export const { setCSV } = rekapanSlice.actions
export default rekapanSlice.reducer
