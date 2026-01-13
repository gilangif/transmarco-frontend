import { configureStore } from "@reduxjs/toolkit"

import sheetSlice from "./sheets"
import configSlice from "./config"
import authSlice from "./auth"

const reducer = {
  sheets: sheetSlice,
  config: configSlice,
  auth: authSlice,
}

export const store = configureStore({ reducer })
