import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import axios from "axios"

import currrency from "../utils/currency.js"
import timestamp from "../utils/timestamp.js"

export default function Shopee() {
  const { accessToken } = useSelector((s) => s.auth)
  const { host } = useSelector((s) => s.config)

  const [searchParams] = useSearchParams()

  const [product, setProduct] = useState({})
  const [variants, setVariants] = useState([])

  const [edit, setEdit] = useState("ID014GWYZ")
  const [err, setErr] = useState({ status: "", message: "" })

  const [notification, setNotification] = useState([])

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const product_id = searchParams.get("id")

  const DEFAULT_IMAGE_THUMB = "https://www.freeiconspng.com/uploads/hd-pepe-png-transparent-background-4.png"
  const DEFAULT_IMAGE_VARIANT = "https://www.freeiconspng.com/uploads/high-quality-pepe-png-transparent-images-19.png"

  const getProduct = async (product_id) => {
    try {
      const { data } = await axios.post(host + "/shopee/product/detail", { product_id }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { variants } = data || {}

      const arr = variants.map((a) => {
        const { option, thumb, lists } = a

        const b = lists.map((b) => {
          const { name, model, desc, color, price, promo, netto, stock } = b
          const { id, sku, stock_detail, weight } = model || {}
          const { seller_stock_info } = stock_detail || {}

          const c = seller_stock_info.map((c) => {
            const { location_id, sellable_stock, fixed_reserved_stock, is_disabled, location_name } = c

            const default_stock = sellable_stock
            const edit_stock = location_id === "IDZ" && desc ? stock : sellable_stock
            const sheets_stock = stock

            return { ...c, default_stock, sheets_stock, sellable_stock: edit_stock }
          })

          return { ...b, model: { ...model, stock_detail: { ...stock_detail, seller_stock_info: c } } }
        })

        return { ...a, lists: b }
      })

      document.title = `Product Detail ${product_id}`

      setVariants(arr)
      setProduct(data)
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      if (error?.response?.data?.message) setErr({ status: error.status, message: error.response.data.message })

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

  const editStock = (i, j, k, value, default_value) => {
    let val = Number(value)

    setVariants((prev) =>
      prev.map((variant, vi) => {
        if (vi !== i) return variant

        const lists = variant.lists.map((list, li) => {
          const { name, model, desc, color, price, promo, netto, stock } = list
          const { stock_detail } = model

          if (li !== j) return list

          const seller_stock_info = stock_detail.seller_stock_info.map((stock, si) => {
            const { location_id, sheets_stock, default_stock, sellable_stock, fixed_reserved_stock, is_disabled, location_name } = stock

            if (si !== k) return stock

            if (location_id !== "IDZ") {
              const message = `Kamu melakukan perubahan pada field ${location_name} sebanyak ${val} pcs`
              setNotification([message, "error"])
            }

            if (location_id === "IDZ" && desc && sheets_stock < val) {
              const message = `Input ${val} pcs melebihi stock sebanyak ${sheets_stock} pcs`
              setNotification([message, "info"])
            }

            return { ...stock, sellable_stock: value, default_stock: default_value || default_stock }
          })

          return { ...list, model: { ...list.model, stock_detail: { ...list.model.stock_detail, seller_stock_info } } }
        })

        return { ...variant, lists }
      }),
    )
  }

  const updateStock = async () => {
    try {
      const model_list = []
      const success = []
      const warning = []
      const error = []

      const fields = []

      variants.forEach((x, i) => {
        const { thumb, option, lists } = x

        lists.forEach((y, j) => {
          const { model, desc } = y
          const { name, id, tier_index, stock_detail } = model
          const { seller_stock_info } = stock_detail

          const m = name || id

          const stock_setting_list = seller_stock_info.map((s, k) => {
            const { location_id, sheets_stock, default_stock, sellable_stock, fixed_reserved_stock, is_disabled, location_name } = s

            const sellable = parseInt(sellable_stock)
            const sheets = parseInt(sheets_stock)
            const def = parseInt(default_stock)

            if (sellable < 0) error.push(`${m} field tidak boleh dibawah 0 pcs`)
            if (desc && sheets < sellable) warning.push(`jumlah input ${m} melebihi stock sebanyak ${sheets} pcs`)

            if (sellable !== def) {
              fields.push([i, j, k, sellable_stock])
              success.push(`${m} dirubah dari ${def} pcs menjadi ${sellable} pcs`)
            }

            return { location_id, sellable_stock: parseInt(sellable_stock) }
          })

          model_list.push({ id, tier_index, stock_setting_list })
        })
      })

      if (error.length > 0) {
        error.forEach((message) => {
          toast.error(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
        })

        return
      }

      const { data } = await axios.post(host + "/shopee/product/update", { product_id, model_list }, { headers: { Authorization: `Bearer ${accessToken}` } })

      fields.forEach(([i, j, k, value]) => editStock(i, j, k, value, value))

      warning.forEach((message) => {
        toast.warning(message, { position: "top-right", autoClose: 3000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
      })

      success.forEach((message) => {
        toast.success(message, { position: "top-right", autoClose: 5000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
      })
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      if (error?.response?.data?.message) setErr({ status: error.status, message: error.response.data.message })

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
    const [message, type] = notification

    if (!message) return

    toast[type || "info"](message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored",
    })
  }, [notification])

  useEffect(() => {
    document.title = "Product Detail"

    getProduct(product_id)
  }, [])

  if (err.message)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center p-3" style={{ height: "100vh" }}>
        <h1>{err.status}</h1>
        <p>{err.message}</p>
      </div>
    )

  return (
    <div className="p-2">
      <div className="row p-2">
        {product?.thumbs?.map((thumb, i) => {
          return (
            <div className="col-4 p-1 rounded" key={i}>
              <img src={thumb || DEFAULT_IMAGE_THUMB} alt={thumb || DEFAULT_IMAGE_THUMB} onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_THUMB)} className="w-100 border rounded" />
            </div>
          )
        })}
      </div>

      <div className="alert alert-success" role="alert">
        <h4 className="alert-heading">{product?.name}</h4>
        <p className="fw-bold">{product?.category}</p>
        <p className="fw-bold">{product?.id}</p>
        <p style={{ whiteSpace: "pre-line" }}>{product?.desc?.join("\n")}</p>
        <hr />
        <p className="mb-0">Created at {timestamp(new Date(product.create_time * 1000))}</p>
      </div>

      <div className=" d-flex flex-column gap-2">
        {variants.map((a, i) => {
          const { option, thumb, lists } = a

          return (
            <div className="col d-flex gap-1" key={i}>
              <div className="col-2 d-flex flex-column gap-2 justify-content-center align-self-center py-1">
                <div className="border p-1 rounded">
                  <img src={thumb || DEFAULT_IMAGE_VARIANT} alt={thumb || DEFAULT_IMAGE_VARIANT} className="w-100 rounded" onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_VARIANT)} />
                </div>
                <div className="col text-dark text-center">
                  <span className="fw-bold">{option}</span>
                </div>
              </div>

              <div className="col">
                {lists.map((b, j) => {
                  const { name, model, desc, color, price, promo, netto, stock } = b
                  const { id, sku, stock_detail, price_info, weight } = model || {}
                  const { seller_stock_info } = stock_detail || {}
                  const { input_normal_price } = price_info || {}

                  return (
                    <div className="d-flex gap-1 p-1" key={i + j}>
                      <div className="col-2 d-flex justify-content-center align-items-center border rounded">{name}</div>
                      <div className="col-4 d-flex flex-column justify-content-center align-items-center border rounded p-1">
                        <span className="fw-bold" style={{ fontSize: "0.7rem" }}>
                          {sku}
                        </span>
                        <span className="text-dark" style={{ fontSize: "0.7rem" }}>
                          {id}
                        </span>
                        <span className="text-dark mt-1" style={{ fontSize: "0.7rem" }}>
                          {stock} pcs
                        </span>
                      </div>
                      <div className="col">
                        <div className="col d-flex flex-column gap-1">
                          {seller_stock_info.map((s, k) => {
                            const { location_id, default_stock, sellable_stock, sheets_stock, fixed_reserved_stock, is_disabled, location_name } = s

                            const ss = location_id === "IDZ" && desc && default_stock !== sheets_stock ? "fw-bold text-primary" : "text-dark"
                            const sb = sellable_stock < 0 ? "text-danger" : sellable_stock > default_stock ? "text-success" : sellable_stock < default_stock ? "text-info" : "text-dark"

                            return (
                              <div className="col d-flex input-group-sm gap-1 rounded" key={i + j + k}>
                                <input type="text" className={`form-control text-center ${ss}`} value={default_stock} disabled />
                                <input
                                  type="number"
                                  min="0"
                                  className={`form-control text-center ${sb}`}
                                  value={sellable_stock}
                                  onChange={(e) => editStock(i, j, k, e.target.value)}
                                  disabled={edit === location_id}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="row justify-content-end gap-3 p-3 mt-3">
        <button className="col-12 col-lg-1 btn btn-danger p-2 p-lg-1" onClick={() => window.open(`https://seller.shopee.co.id/portal/product/${product_id}`, "blank")}>
          Open
        </button>
        <button className="col-12 col-lg-2 btn btn-secondary p-2 p-lg-1" onClick={() => setEdit(edit === "IDZ" ? "ID014GWYZ" : "IDZ")}>
          {edit}
        </button>
        <button className="col-12 col-lg-1 btn btn-success p-2 p-lg-1" onClick={() => updateStock()}>
          UPDATE
        </button>
      </div>
    </div>
  )
}
