import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  barcode: "",
  modalForm: {
    order_sn: "",
    product_name: "",
    variant_name: "",
    sku_parent: "",
    sku_variant: "",
    item_id: "",
    model_id: "",
    artikel: "",
    barcode: "",
    brand: "",
    desc: "",
    size: "",
    promo: "",
    status_info: "",
    shipping: "",
    stock: 0,
    price: 0,
    netto: 0,
    amount: 0,
    weight: 0,
    order_price: 0,
  },
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setBarcode: (state, action) => {
      state.barcode = action.payload
    },

    setModalForm: (state, action) => {
      state.modalForm = action.payload
    },
  },
})

export const { setBarcode, setModalForm } = authSlice.actions
export default authSlice.reducer
