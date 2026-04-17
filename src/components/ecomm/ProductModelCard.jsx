import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"

import axios from "axios"

import { setBarcode, setModalForm } from "../../store/ecomm.js"

export default function ProductModelCard({ order_sn, status_info, shipping, item, edit, onChange }) {
  const { amount, item_model, order_price, product, line_item_id } = item || {}
  const { name: product_name, images, item_id, sku: sku_parent } = product
  const { name: variant_name, model_id, weight, sku: sku_variant } = item_model || {}

  const { barcode, modalForm } = useSelector((s) => s.ecomm)
  const { accessToken } = useSelector((s) => s.auth)
  const { host } = useSelector((s) => s.config)

  const [form, setForm] = useState({
    order_sn: order_sn || "",
    product_name: product_name || "",
    variant_name: variant_name || "",
    sku_parent: sku_parent || "",
    sku_variant: sku_variant || "",
    status_info: status_info || "",
    shipping: shipping || "",
    item_id: item_id || "",
    model_id: model_id || "",
    order_price: order_price || 0,
    amount: amount || 0,
    weight: weight ? weight / 100 : 0,
    artikel: "",
    barcode: "",
    brand: "",
    desc: "",
    size: "",
    promo: "",
    price: "",
    netto: "",
    stock: "",
  })

  const dispatch = useDispatch()

  const DEFAULT_IMAGE = "https://media.tenor.com/dl3I6S8ATI8AAAAm/pepe.webp"
  const image = images && images[0] ? `https://down-id.img.susercontent.com/file/${images[0]}` : DEFAULT_IMAGE

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const searchBarcode = async (barcode) => {
    try {
      const { data } = await axios.post(host + "/sheets/stocks/search", { barcode }, { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data) return dispatch(setModalForm({ ...form, ...data }))

      dispatch(setModalForm(form))
      if (!data) {
        const message = "Auto target not exists"
        return toast.info(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
      }
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  const showModal = async () => {
    const el = document.getElementById("modal-update")
    const modal = new bootstrap.Modal(el)

    dispatch(setModalForm(form))
    dispatch(setBarcode(sku_variant))
    dispatch(setModalForm(form))

    if (sku_variant) searchBarcode(sku_variant)

    modal.show()
  }

  useEffect(() => {
    onChange(item.line_item_id, form)
  }, [form])

  return (
    <>
      <div className="form-group col d-flex gap-3 mb-1 p-0 py-2 border-bottom">
        <div className="col-3 py-1 px-0 form-group">
          <div className="ratio ratio ratio-1x1">
            <img src={image || DEFAULT_IMAGE} alt={image || DEFAULT_IMAGE} onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)} className="border border-1 rounded object-fit-cover" />
          </div>
        </div>

        <div className="col">
          <div className="col form-group mb-2 input-group-sm">
            <label className="col-form-label py-0">Product Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Product Name"
              value={form.product_name}
              onChange={(e) => updateField("product_name", e.target.value)}
              autoComplete="on"
              disabled={!edit}
            />
          </div>
          <div className="col form-group mb-2 input-group-sm">
            <label className="col-form-label py-0">Variant</label>
            <input
              type="text"
              className="form-control"
              placeholder="Variant"
              value={form.variant_name}
              onChange={(e) => updateField("variant_name", e.target.value)}
              autoComplete="on"
              disabled={!edit}
            />
          </div>

          <div className="d-flex flex-row gap-2">
            <div className="col form-group mb-2 input-group-sm">
              <label className="col-form-label py-0">Item ID</label>
              <input type="text" className="form-control" placeholder="Item ID" value={form.item_id} onChange={(e) => updateField("item_id", e.target.value)} autoComplete="on" disabled={!edit} />
            </div>
            <div className="col-6 form-group mb-2 input-group-sm">
              <label className="col-form-label py-0">SKU Parent</label>
              <input
                type="text"
                className="form-control"
                placeholder="SKU Parent"
                value={form.sku_parent || "-"}
                onChange={(e) => updateField("sku_parent", e.target.value)}
                autoComplete="on"
                disabled={!edit}
              />
            </div>
          </div>

          <div className="d-flex flex-row gap-2">
            <div className="col form-group mb-2 input-group-sm">
              <label className="col-form-label">Model ID</label>
              <input type="text" className="form-control" placeholder="Model ID" value={form.model_id} onChange={(e) => updateField("model_id", e.target.value)} autoComplete="on" disabled={!edit} />
            </div>
            <div className="col-6 form-group mb-2 input-group-sm">
              <label className="col-form-label">SKU Variant</label>
              <input
                type="text"
                className="form-control"
                placeholder="SKU Variant"
                value={form.sku_variant}
                onChange={(e) => updateField("sku_variant", e.target.value)}
                autoComplete="on"
                disabled={!edit}
              />
            </div>
          </div>

          <div className="d-flex flex-row gap-2">
            <div className="col form-group mb-2 input-group-sm">
              <label className="col-form-label">Price</label>
              <input
                type="text"
                className="form-control"
                placeholder="Price"
                value={form.order_price}
                onChange={(e) => updateField("order_price", e.target.value)}
                autoComplete="on"
                disabled={!edit}
              />
            </div>
            <div className="col form-group mb-2 input-group-sm">
              <label className="col-form-label">Amount</label>
              <input
                type="number"
                min="0"
                className="form-control text-primary fw-bold"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                autoComplete="on"
                disabled={!edit}
              />
            </div>
            <div className="col form-group mb-2 input-group-sm">
              <label className="col-form-label">Weight</label>
              <input type="text" className="form-control" placeholder="Amount" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} autoComplete="on" disabled={!edit} />
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-lg-6 mt-3 input-group-sm">
              <button className="btn btn-secondary w-100" onClick={() => window.open(`/shopee?id=${item_id}`)}>
                VIEW PRODUCT
              </button>
            </div>

            <div className="col-12 col-lg-6 mt-3 input-group-sm">
              <button className="btn btn-success w-100" onClick={() => showModal()}>
                ADD TO GOOGLE SHEETS
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
