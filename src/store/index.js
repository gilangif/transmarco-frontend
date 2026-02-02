import { configureStore } from "@reduxjs/toolkit"

import authSlice from "./auth"
import ecommSlice from "./ecomm"
import sheetSlice from "./sheets"
import configSlice from "./config"
import rekapanSlice from "./rekapan"

const reducer = {
  auth: authSlice,
  ecomm: ecommSlice,
  sheets: sheetSlice,
  config: configSlice,
  rekapan: rekapanSlice,
}

export const store = configureStore({ reducer })
