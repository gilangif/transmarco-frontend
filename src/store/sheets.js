import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

import { host } from "./config"

import axios from "axios"

export const getStock = createAsyncThunk("sheets/getStock", async (_, { getState, rejectWithValue }) => {
  try {
    const { data } = await axios.get(host + "/sheets", { headers: { Authorization: `Bearer ${getState().auth.accessToken}` } })

    const username = getState().auth.username.toUpperCase()

    return data.filter((x) => (username === "app" ? true : x.brand === username)).sort((a, b) => a.artikel - b.artikel)
  } catch (err) {
    return rejectWithValue(err.response?.data || "Gagal fetch stock")
  }
})

const sheetSlice = createSlice({
  name: "sheets",
  initialState: {
    stocks: [],
    fields: ["S", "M", "L", "XL", "XXL", "XXXL", "26", "28", "30", "32", "34", "36", "38", "TTL"],
    type: { field: "stock", name: "SALDO AKHIR" },
    loading: false,
    error: false,
  },
  reducers: {
    setStock: (state, action) => {
      state.stocks = action.payload
    },
    setType: (state, action) => {
      state.type = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStock.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getStock.fulfilled, (state, action) => {
        state.loading = false
        state.stocks = action.payload
      })
      .addCase(getStock.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setStock, setType } = sheetSlice.actions
export default sheetSlice.reducer
