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
          const { location_id, location_name, fixed_reserved_stock, is_disabled, sellable_stock } = stock

          const obj = { location_id, location_name, fixed_reserved_stock, is_disabled, sellable_stock }

          if (form[id]) {
            const find = form[id].find((x) => x.location_name === location_name)

            if (find) obj.sellable_stock = find.edit_stock !== undefined && find.edit_stock !== null ? find.edit_stock : find.sellable_stock || 0

            if (find && find.edit_stock < 0) status.err.push(`${variant_id} jumlah stock ${find.edit_stock} pcs tidak valid, harus diatas 0 pcs`)
            if (find && find.edit_stock !== sellable_stock) status.success.push(`${variant_id} dirubah dari ${sellable_stock} pcs menjadi ${find.edit_stock} pcs`)
          }

          return obj
        })

        return { id, tier_index, stock_setting_list }
      })

      const toast_option = { position: "top-right", autoClose: 2500, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" }

      if (status.err.length > 0) status.err.forEach((x) => toast.error(x, toast_option))
      if (status.success.length === 0) return toast.info("Semua field stock dan stock shopee saat ini masih sama, perubahan tidak akan diterapkan !", toast_option)

      const { data } = await axios.post(host + "/shopee/update", { product_id, model_list }, { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.msg || data.user_message) {
        toast.info(data.msg || data.user_message, toast_option)
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

  const editValue = (val, id, location_id) => {
    const value = val === "" ? "" : Number(val)

    const target = form[id]
    const find = target.find((x) => x.location_id === location_id)

    const obj = { ...form, [id]: target.map((x) => (x.location_id === location_id ? { ...x, edit_stock: value } : x)) }

    if (value > find.stock && find.artikel) {
      const message = `Jumlah input melebihi saldo tersedia sebanyak ${find.stock} pcs`
      toast.info(message, { position: "top-right", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    }

    setForm(obj)
  }

  const updateForm = (reset) => {
    const initial = {}

    let status = true

    product?.variants?.forEach((variant) => {
      const { option, cover, fields } = variant

      fields.forEach((field) => {
        const stock = field.stock
        const model = field.model
        const artikel = field.artikel

        const id = model.id
        const sku = model.sku
        const stock_detail = model.stock_detail

        const seller_stock_info = stock_detail.seller_stock_info.map((x) => {
          const { sellable_stock, location_id } = x

          const edit_stock = reset ? 0 : location_id === "IDZ" ? (Object.hasOwn(field, "stock") && artikel ? stock : sellable_stock) : sellable_stock

          return { ...x, stock, artikel, id, sku, edit_stock }
        })

        initial[id] = seller_stock_info
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
              category={product?.category_path_name_list?.join(" > ")}
              desc={desc}
              date={product.create_time}
              sku={product.parent_sku}
              id={product.id}
              weight={product?.weight?.value}
            />
          </div>
        )}

        <ProductAlbum images={product.images} />

        <div className="col-12 col-lg-5 p-2 m-0">
          {product?.sheets?.length > 0 ? (
            <TableSheetStock arr={product?.sheets} />
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
            const src = variant.cover ? `https://down-id.img.susercontent.com/file/${variant.cover}` : ""

            const variants = variant.fields.map((field, j) => {
              const model = field.model
              const id = model.id

              const shopee_stock = field.model.stock_detail.seller_stock_info.map((x, k) => {
                const { sellable_stock, edit_stock, stock, location_id } = x

                const artikel = form[id]?.find((x) => x.location_id === location_id && x.artikel)

                const style = `form-control text-center ${artikel ? "" : "fw-bold text-danger"}`

                return <input key={k} type="text" className={style} value={sellable_stock} disabled />
              })

              const edit_stock = form[id]?.map((x, k) => {
                const { sellable_stock, edit_stock, stock, location_id } = x

                const value = edit_stock

                let style = ""

                if (location_id === "IDZ" && sellable_stock < edit_stock) style = "fw-bold text-primary"
                if (location_id === "IDZ" && sellable_stock > edit_stock) style = "fw-bold text-warning"
                if (location_id === "IDZ" && edit_stock < 0) style = "fw-bold text-danger"

                return (
                  <input
                    key={k}
                    type="number"
                    id={location_id}
                    className={`form-control text-center ${style}`}
                    value={value}
                    disabled={location_id !== "IDZ"}
                    onChange={(e) => editValue(e.target.value, id, location_id)}
                  />
                )
              })

              return (
                <div className="d-flex border border-1 rounded" key={j}>
                  <div className="col-1 p-3 border border-1 d-flex justify-content-center align-items-center rounded fw-bold">{field.option}</div>
                  <div className="col border border-1 d-flex flex-column justify-content-center align-items-center text-center rounded fw-bold">
                    <p className={`m-0 ${field.model.sku ? "" : "d-none"}`}>{field.model.sku}</p>
                    <p className="m-0">{field.model.id}</p>
                  </div>

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
