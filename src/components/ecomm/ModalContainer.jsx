import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"

import { login, logout } from "../../store/auth.js"
import { setBarcode, setModalForm } from "../../store/ecomm.js"

import axios from "axios"

import currrency from "../../utils/currency.js"

const STATUS_COLOR = {
  "Order Received": "fw-bold text-success",
  Completed: "fw-bold text-success",
  Delivered: "fw-bold text-primary",
  Shipped: "fw-bold text-warning",
  Cancelled: "fw-bold text-danger",
  Pending: "fw-bold text-secondary",
}

export default function ModalContainer() {
  const { username, accessToken } = useSelector((s) => s.auth)
  const { host } = useSelector((s) => s.config)
  const { barcode, modalForm } = useSelector((s) => s.ecomm)

  const { order_sn, product_name, variant_name, item_id, model_id, sku_variant, order_price, amount, status_info, shipping, artikel, brand, desc, stock, price, netto, promo, size } = modalForm

  const [results, setResults] = useState([])

  const [status, setStatus] = useState("")
  const [note, setNote] = useState("")
  const [qty, setQty] = useState("1")

  const isSelect = useRef(true)
  const dispatch = useDispatch()

  const searchItem = async () => {
    try {
      const { data } = await axios.post(host + "/sheets/stocks/search", { search: barcode }, { headers: { Authorization: `Bearer ${accessToken}` } })

      setResults(data)
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

      setResults([])
    }
  }

  const handleSelect = async (item) => {
    const { artikel, barcode, brand, desc, stock, price, netto, promo, size } = item

    isSelect.current = barcode

    dispatch(setBarcode(barcode))
    dispatch(setModalForm({ ...modalForm, ...item }))

    setResults([])
  }

  const addForm = async () => {
    try {
      const obj = { order_sn, barcode, qty, sku_variant, product_name, variant_name, order_price, status_info, item_id, model_id, shipping, status, note }

      const { data } = await axios.post(host + "/sheets/ecomm/add", obj, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { success, message } = data || {}

      if (message) {
        for (const msg of message) {
          toast.info(msg, { position: "top-right", autoClose: 5000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
        }
      }

      if (success) {
        const el = document.getElementById("modal-update")
        const modal = bootstrap.Modal.getInstance(el)

        if (modal) modal.hide()

        const message = `Success add barcode data ${obj.barcode} with order SN ${obj.order_sn}`

        toast.success(message, {
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

  useEffect(() => {
    setQty(amount)
  }, [modalForm])

  useEffect(() => {
    if (!barcode) return
    if (barcode === sku_variant) return

    if (barcode.length < 2) return
    if (isSelect.current === barcode) return

    const timer = setTimeout(() => searchItem(), 800)

    return () => clearTimeout(timer)
  }, [barcode])

  return (
    <div className="modal fade" id="modal-update" data-bs-backdrop="true" data-bs-keyboard="false" aria-labelledby="modal-update" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered p-3">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="modal-update">
              {order_sn}
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <div className="col">
              <div className="col form-group input-group-sm position-relative">
                <label className="col-form-label px-1">Barcode</label>
                <input type="text" className="form-control fw-bold" placeholder="Barcode" value={barcode} onChange={(e) => dispatch(setBarcode(e.target.value.toUpperCase()))} autoComplete="on" />
              </div>

              <div className="d-flex flex-column gap-2 py-1">
                {results.map((item, i) => {
                  const { artikel, barcode, brand, desc, stock, price, netto, promo, size } = item

                  return (
                    <div key={i} className="d-flex flex-row bg-dark rounded shadow p-2 gap-2" onClick={() => handleSelect(item)} style={{ cursor: "pointer" }}>
                      <div className="col-2 bg-light text-dark d-flex align-items-center justify-content-center rounded p-1 fw-bold">{brand}</div>

                      <div className="col p-2">
                        <p className="fw-bold m-0 text-light">{barcode}</p>
                        <p className="fw-bold m-0 text-secondary text-sm">{desc}</p>
                        <p className="fw-bold m-0 text-secondary text-sm">{promo}</p>
                      </div>
                      <div className="col p-2">
                        <p className="fw-bold m-0 text-light">Rp.{currrency(price)}</p>
                        <p className="fw-bold m-0 text-secondary text-sm">Rp.{currrency(netto)}</p>
                        <p className="fw-bold m-0 text-secondary text-sm">{stock} pcs</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="d-flex gap-3">
              <div className="form-group col mb-1 input-group-sm">
                <label className="col-form-label px-1">Qty</label>
                <input type="number" min="1" className="form-control" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} autoComplete="on" />
              </div>

              <div className="form-group col-4 input-group-sm">
                <label className="col-form-label px-1">Status</label>
                <select className={`form-select fw-bold ${status === "" ? "text-primary" : "text-success"}`} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">NEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
            </div>

            <div className="my-2">
              <div className="form-group col mb-1 input-group-sm">
                <label className="col-form-label px-1">Description</label>
                <input type="text" className="form-control text-success fw-bold" placeholder="Description" value={desc} disabled />
              </div>

              <div className="d-flex gap-2 mb-1">
                <div className="form-group col input-group-sm">
                  <label className="col-form-label px-1">Unit Price</label>
                  <input type="text" className="form-control text-success fw-bold" placeholder="Unit Price" value={price} disabled />
                </div>

                <div className="form-group col input-group-sm">
                  <label className="col-form-label px-1">Unit Netto</label>
                  <input type="text" className="form-control text-success fw-bold" placeholder="Unit Netto" value={netto} disabled />
                </div>
                <div className="form-group col input-group-sm">
                  <label className="col-form-label px-1">Unit Promo</label>
                  <input type="text" className="form-control text-success fw-bold" placeholder="Unit Promo" value={promo} disabled />
                </div>
                <div className="form-group col input-group-sm">
                  <label className="col-form-label px-1">Unit Stock</label>
                  <input type="text" className="form-control text-success fw-bold" placeholder="Unit Stock" value={stock} disabled />
                </div>
              </div>
            </div>

            <div className="form-group col mb-1 input-group-sm">
              <label className="col-form-label px-1">Product Name</label>
              <input type="text" className="form-control" placeholder="Product Name" value={product_name} disabled />
            </div>

            <div className="form-group col mb-1 input-group-sm">
              <label className="col-form-label px-1">Product Variant</label>
              <input type="text" className="form-control" placeholder="Product Variant" value={variant_name} disabled />
            </div>

            <div className="d-flex gap-2 mb-1">
              <div className="form-group col-6 input-group-sm">
                <label className="col-form-label px-1">Product SKU</label>
                <input type="text" className="form-control" placeholder="Product SKU" value={sku_variant} disabled />
              </div>
              <div className="form-group col input-group-sm">
                <label className="col-form-label px-1">Item ID</label>
                <input type="text" className="form-control" placeholder="Item ID" value={item_id} disabled />
              </div>
              <div className="form-group col input-group-sm">
                <label className="col-form-label px-1">Model ID</label>
                <input type="text" className="form-control" placeholder="Model ID" value={model_id} disabled />
              </div>
            </div>

            <div className="d-flex gap-2 mb-1">
              <div className="form-group col input-group-sm">
                <label className="col-form-label px-1">Product Price</label>
                <input type="text" className="form-control" placeholder="Product Price" value={order_price} disabled />
              </div>

              <div className="form-group col input-group-sm">
                <label className="col-form-label px-1">Product Status</label>
                <input type="text" className={`form-control ${STATUS_COLOR[status_info] || "text-dark"}`} placeholder="Product Status" value={status_info} disabled />
              </div>
            </div>

            <div className="form-group col mb-1 input-group-sm">
              <label className="col-form-label px-1">Product Shipping</label>
              <input type="text" className="form-control" placeholder="Product Shipping" value={shipping} disabled />
            </div>

            <div className="form-group col input-group-sm">
              <label className="col-form-label px-1">Note</label>
              <textarea type="text" className="form-control" rows="3" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          <div className="modal-footer px-3">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              CANCEL
            </button>
            <button type="button" className="btn btn-primary" onClick={() => addForm()}>
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
