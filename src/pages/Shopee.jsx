import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import axios from "axios"

import ProductTitle from "../components/shopee/ProductTitle.jsx"
import ProductAlbum from "../components/shopee/ProductAlbum.jsx"
import TableSheetStock from "../components/sheets/TableSheetStock.jsx"

export default function Shopee() {
  const { username, accessToken } = useSelector((s) => s.auth)
  const { fields } = useSelector((s) => s.sheets)
  const { host } = useSelector((s) => s.config)

  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState({ images: [], variants: [], category_path_name_list: [], model_list: [], description_info: { description: "", description_type: "normal" }, weight: {} })

  const [form, setForm] = useState({})
  const [show, setShow] = useState(true)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const id = searchParams.get("id")

  const description_info = product?.description_info
  const description = description_info?.description
  const description_type = description_info?.description_type

  const desc =
    description_type && description_type === "json"
      ? JSON.parse(description)
          .field_list.map((x) => x.value)
          .join("\n")
      : description

  const getProduct = async (product_id) => {
    try {
      const { data } = await axios.post(host + "/shopee/detail", { product_id }, { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.failed) throw data

      setProduct(data)
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

  const updateProduct = async (product_id) => {
    try {
      const status = { err: [], warning: [], success: [] }

      const model_list = product.model_list.map((model) => {
        const id = model.id

        const variant_id = model.sku || model.id

        const stock_detail = model.stock_detail
        const tier_index = model.tier_index
        const seller_stock_info = stock_detail.seller_stock_info

        const stock_setting_list = seller_stock_info.map((stock) => {
          const { location_id, location_name, fixed_reserved_stock, is_disabled, edit_value, sellable_stock } = stock

          const obj = { location_id, location_name, fixed_reserved_stock, is_disabled, edit_value, sellable_stock }

          const unique = id + "_" + location_id
          const find = form[unique]

          if (find) {
            obj.sellable_stock_default = sellable_stock

            obj.edit_value = find.edit_value
            obj.sellable_stock = find.edit_value
          }

          if (find && find.edit_value < 0) status.err.push(`${variant_id} jumlah stock ${find.edit_value} pcs tidak valid, harus diatas 0 pcs`)
          if (find && find.edit_value !== sellable_stock) status.success.push(`${variant_id} dirubah dari ${sellable_stock} pcs menjadi ${find.edit_value} pcs`)

          return obj
        })

        return { id, tier_index, stock_setting_list }
      })

      const toast_option = { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" }

      if (status.err.length > 0) status.err.forEach((x) => toast.error(x, toast_option))
      if (status.success.length === 0) return toast.info("Semua field stock dan stock shopee saat ini masih sama, perubahan tidak akan diterapkan !", toast_option)

      const { data } = await axios.post(host + "/shopee/update", { product_id, model_list }, { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.msg && data.msg === "success") {
        const variants = product.variants.map((variant) => {
          const charts = variant.charts.map((chart) => {
            const model = chart.model

            const stock_detail = model.stock_detail

            const seller_stock_info = stock_detail.seller_stock_info.map((stock) => {
              const unique = model.id + "_" + stock.location_id
              const sellable_stock = form[unique].edit_value || stock.sellable_stock

              return { ...stock, sellable_stock }
            })

            return { ...chart, model: { ...model, stock_detail: { ...stock_detail, seller_stock_info } } }
          })

          return { ...variant, charts }
        })

        const prod = { ...product, variants }

        setShow(false)
        setProduct(prod)

        status.success.forEach((x, i) => toast.success(x, { ...toast_option, autoClose: 1500 + i * 10 }))
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

  const editValue = (val, unique, index) => {
    const value = val === "" ? "" : Number(val)
    const stock = form[unique]["STOCK AKHIR"]

    const obj = { ...form, [unique]: { ...form[unique], stock, edit_value: value } }

    if (value > stock) {
      const message = `Jumlah input melebihi stock tersedia sebanyak ${stock} pcs`
      toast.warning(message, { position: "top-right", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    }

    setForm(obj)
  }

  const updateForm = (reset) => {
    const initial = {}

    let status = true

    product?.variants?.forEach((variant) => {
      variant.charts.forEach((chart) => {
        const model = chart.model || {}
        const sheets = chart.sheets || {}
        const id = model.id

        if (!chart.sheets) status = false

        chart.model.stock_detail.seller_stock_info.forEach((stock) => {
          const location_id = stock.location_id
          const sellable_stock = stock.sellable_stock

          const unique = id + "_" + location_id

          const edit_value = reset ? 0 : location_id === "IDZ" ? sheets["STOCK AKHIR"] || sellable_stock : sellable_stock
          const stock_sheets = chart.sheets ? true : false

          if (!initial[unique]) initial[unique] = { ...sheets, ...stock, edit_value, stock_sheets }
        })
      })
    })

    let message = reset ? "Reset field" : "Success get sheets stock data."

    if (reset || !status) {
      toast.info(message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }

    setForm(initial)
  }

  useEffect(() => {
    getProduct(id)

    if (product.name) {
      document.title = `LAPORAN | ${product.name}`
    } else {
      document.title = `LAPORAN | Product Not Found`
    }
  }, [])

  useEffect(() => {
    updateForm()
  }, [product])

  return (
    <>
      <div className="row p-0 m-0">
        {product?.sheets?.length > 0 && (
          <div className="my-3">
            <ProductTitle
              name={product.name}
              category={product.category_path_name_list.join(" > ")}
              desc={desc}
              date={product.create_time}
              sku={product.parent_sku}
              id={product.id}
              weight={product.weight.value}
            />
          </div>
        )}

        <ProductAlbum images={product.images} />

        <div className="col-12 col-lg-5 p-2 m-0">
          {product?.sheets?.length > 0 ? (
            <TableSheetStock fields={fields} sheets={product?.sheets} />
          ) : (
            <ProductTitle
              name={product.name}
              category={product?.category_path_name_list?.join(" > ")}
              desc={desc}
              date={product.create_time}
              sku={product.parent_sku}
              id={product.id}
              weight={product?.weight?.value}
            />
          )}
        </div>

        <div className="col-lg-7 p-2 p-lg-2" style={{ paddingBottom: "200px" }}>
          {product?.variants?.map((variant, i) => {
            const src = variant.image ? `https://down-id.img.susercontent.com/file/${variant.image}` : ""

            const variants = variant.charts.map((chart, j) => {
              const model = chart.model || {}
              const opt = chart.option

              const variant_arr = product.variants.map((x) => x.charts.map((y) => y.model.sku)).filter((x) => x == model.sku)

              const id = model.id || "VARIANT"
              const sku = variant_arr.length > 1 ? model.id : model.sku || model.id || "VARIANT"

              const option = opt === "XXL" ? "2XL" : opt === "XXXL" ? "3XL" : opt === "XXXXL" ? "4XL" : opt

              const shopee_stock = model.stock_detail.seller_stock_info.map((stock, k) => (
                <input key={i + j + k} type="text" className="form-control text-center" value={stock.sellable_stock} disabled />
              ))

              const edit_stock = model.stock_detail.seller_stock_info.map((stock, k) => {
                const sellable_stock = stock.sellable_stock
                const location_id = stock.location_id

                const unique = id + "_" + location_id

                const inventory = form[unique]?.edit_value ?? ""
                const stock_sheets = form[unique]?.stock_sheets

                const botani = location_id === "IDZ"

                let style = ""

                if (botani && stock_sheets && inventory && inventory > sellable_stock) style += " fw-bold text-primary"
                if (botani && stock_sheets && inventory && inventory < sellable_stock) style += " fw-bold text-warning"

                if (botani && stock_sheets && inventory && inventory < 0) style += " fw-bold text-danger"

                return (
                  <input
                    key={k}
                    type="number"
                    id={location_id}
                    className={`form-control text-center ${style}`}
                    value={inventory}
                    disabled={!botani}
                    onChange={(e) => editValue(e.target.value, unique, k)}
                  />
                )
              })

              return (
                <div className="d-flex border border-1 rounded" key={j}>
                  <div className="col-1 p-3 border border-1 d-flex justify-content-center align-items-center rounded fw-bold">{option}</div>
                  <div className="col border border-1 d-flex justify-content-center align-items-center rounded fw-bold">{sku}</div>

                  <div className="col border border-1 d-flex justify-content-start align-items-center rounded w-100">
                    <div className="d-flex flex-column p-1 gap-1 w-100">{shopee_stock}</div>
                  </div>

                  <div className="col d-flex flex-row border border-1 d-flex justify-content-start align-items-center rounded w-100">
                    <div className="d-flex flex-column p-1 gap-1 w-100">
                      <div className="d-flex flex-column p-1 gap-1 w-100">{edit_stock}</div>
                    </div>
                  </div>
                </div>
              )
            })

            return (
              <div className="d-flex flex-row bg-light text-dark border border-1 rounded p-0 mb-2" key={i}>
                <div className="col-2 col-lg-3 p-1 d-flex flex-column align-items-center justify-content-center rounded">
                  {src && (
                    <div className="card my-3">
                      <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", aspectRatio: "1/1" }} className="card-img-top" />
                    </div>
                  )}
                  <p className="fw-bold">{variant.option || "ALL VARIANT"}</p>
                </div>

                <div className="col d-flex flex-column justify-content-center p-0 px-lg-1 m-0 rounded">{variants}</div>
              </div>
            )
          })}

          {product?.variants?.length > 0 && (
            <div className="py-3 d-flex flex-column gap-2">
              <div className="d-flex gap-2">
                <Link to={`https://shopee.co.id/product/24819895/${id}`} target="_blank" className="btn btn-info text-dark fw-bold w-100 p-2">
                  LIHAT PRODUCT
                </Link>
                <Link to={`https://seller.shopee.co.id/portal/product/${id}`} target="_blank" className="btn btn-info w-100 p-2">
                  EDIT PRODUCT
                </Link>
              </div>
              <button className="btn btn-warning w-100 p-2" onClick={() => updateForm(true)}>
                RESET
              </button>
              <button className="btn btn-warning w-100 p-2" onClick={() => updateForm()}>
                GET SHEETS STOCK
              </button>
              {show && (
                <button className="btn btn-danger w-100 p-2" onClick={() => updateProduct(id)}>
                  UPDATE
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
