import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import axios from "axios"

import ProductModelCard from "../components/ecomm/ProductModelCard.jsx"
import ModalContainer from "../components/ecomm/ModalContainer.jsx"

const STATUS_COLOR = {
  "Order Received": "text-success",
  Completed: "text-success",
  Delivered: "text-primary",
  Shipped: "text-warning",
  Cancelled: "text-danger",
  Pending: "text-secondary",
}

export default function Ecomm() {
  const { accessToken } = useSelector((s) => s.auth)
  const { host } = useSelector((s) => s.config)

  const [orders, setOrders] = useState({})
  const [items, setItems] = useState([])
  const [results, setResults] = useState([])

  const [keyword, setKeyword] = useState("")
  const [shipping, setShipping] = useState("")
  const [username, setUsername] = useState("")
  const [userID, setUserID] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [buyerAddress, setBuyerAddress] = useState("")
  const [createTime, setCreateTime] = useState("")
  const [confirmTime, setConfirmTime] = useState("")
  const [completeTime, setCompleteTime] = useState("")
  const [status, setStatus] = useState("")
  const [searchMessage, setSearchMessage] = useState("")

  const [edit, setEdit] = useState(false)

  const isSelect = useRef(false)

  const DEFAULT_IMAGE = "https://www.freeiconspng.com/uploads/pepe-clip-art-9.png"

  const handleItemChange = (line_item_id, payload) => {
    setOrders((prev) => ({ ...prev, order_items: prev.order_items.map((item) => (item.line_item_id === line_item_id ? { ...item, ...payload } : item)) }))
  }

  const handleSelect = async (order) => {
    const { order_id, order_sn, model_image, buyer_name, buyer_image, src } = order

    isSelect.current = true

    setKeyword(order_sn)
    setResults([])

    const detail = await getOrderDetail(order_id)

    const { shipping_address, status_info_v2, create_time, complete_time, shipping_confirm_time, seller_address, fulfillment_carrier_name, order_items, buyer_user } = detail
    const { user_name, user_id } = buyer_user || {}

    setOrders(detail)
    setItems(order_items)

    if (user_id) setUserID(user_id)
    if (user_name) setUsername(user_name)
    if (shipping_address) setBuyerAddress(shipping_address)

    if (createTime !== null && create_time !== undefined) {
      const date = new Date(create_time * 1000).toISOString().split("T")[0]
      setCreateTime(date)
    }

    if (shipping_confirm_time !== null && shipping_confirm_time !== undefined) {
      const date = new Date(shipping_confirm_time * 1000).toISOString().split("T")[0]
      setConfirmTime(date)
    }

    if (complete_time !== null && complete_time !== undefined) {
      if (complete_time === 0) {
        setCompleteTime("")
      } else {
        const date = new Date(complete_time * 1000).toISOString().split("T")[0]
        setCompleteTime(date)
      }
    }

    if (seller_address) {
      const { name, phone, state, city, zip_code, district, address } = seller_address

      const str = `${address}\n\n${name}, ${city}, ${district}, ${state} (${zip_code})\nPhone +${phone}`
      setSenderAddress(str)
    }

    if (fulfillment_carrier_name) {
      const str = `${fulfillment_carrier_name}`
      setShipping(str)
    }

    if (status_info_v2) {
      const { status, status_description } = status_info_v2
      setStatus(status)
    }
  }

  const getOrderDetail = async (order_id) => {
    try {
      const { data: results } = await axios.post(host + "/shopee/order/detail", { order_id }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { code, data, user_message, message } = results || {}

      return data
    } catch (error) {}
  }

  const searchProduct = async () => {
    try {
      if (!keyword) return

      const { data } = await axios.post(host + "/shopee/order/search", { keyword, type: "no_pesanan" }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { order_sn_result } = data || {}
      const { total = 0, list = [] } = order_sn_result || {}

      if (list.length === 0) {
        setSearchMessage(`Orders with keyword "${keyword}" not found`)
      } else {
        setSearchMessage("")
      }

      const results = list.map((x) => ({ src: `https://down-id.img.susercontent.com/file/${x.model_image}`, ...x }))

      setResults(results)
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
    if (!keyword) return
    if (keyword.length < 2) return

    if (isSelect.current) {
      isSelect.current = false
      return
    }

    const timer = setTimeout(() => searchProduct(), 800)

    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    document.title = "SHEETS E-COMMERCE"
  }, [])

  if (!orders.order_items || orders.order_items.length < 1) {
    return (
      <div className="p-3">
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Search</label>
          <div className="col">
            <div className="col position-relative">
              <input
                type="text"
                className={`form-control ${keyword && keyword.length < 14 ? "text-danger" : ""}`}
                placeholder="Cari produk..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                autoComplete="off"
              />
            </div>

            <div className="d-flex flex-column gap-2 py-1">
              {results.map((order, i) => {
                const { order_id, order_sn, model_image, buyer_user_id, buyer_name, buyer_image, src } = order

                return (
                  <div key={i} className="d-flex flex-row align-items-center bg-dark rounded shadow" onClick={() => handleSelect({ ...order, src })} style={{ cursor: "pointer" }}>
                    <div className="p-2">
                      <img src={src} alt={src} width="40" height="40" className="rounded object-fit-cover p-0" />
                    </div>
                    <div className="col p-2">
                      <p className="fw-bold m-0 text-light">{order_sn}</p>
                      <p className="fw-bold m-0 text-secondary">{buyer_name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {searchMessage ? (
            <div class="alert alert-danger mt-3" role="alert">
              {searchMessage}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <ModalContainer />
      <div className="p-3">
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Search</label>
          <div className="col">
            <div className="col position-relative">
              <input
                type="text"
                className={`form-control ${keyword && keyword.length < 14 ? "text-warning" : ""}`}
                placeholder="Cari produk..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="d-flex flex-column gap-2 py-1">
              {results.map((item, i) => {
                const { order_id, order_sn, model_image, buyer_name, buyer_image, src } = item

                return (
                  <div key={i} className="d-flex flex-row align-items-center bg-dark rounded shadow" onClick={() => handleSelect({ ...item, src })} style={{ cursor: "pointer" }}>
                    <div className="p-2">
                      <img
                        src={src || DEFAULT_IMAGE}
                        alt={src || DEFAULT_IMAGE}
                        onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                        width="40"
                        height="40"
                        className="rounded object-fit-cover p-0"
                      />
                    </div>
                    <div className="col p-2">
                      <p className="fw-bold m-0 text-light">{order_sn}</p>
                      <p className="fw-bold m-0 text-secondary">{buyer_name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="form-group col d-flex gap-2 mb-2">
          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Shipping</label>
            <input type="text" className="form-control" placeholder="Shipping" value={shipping} onChange={(e) => setShipping(e.target.value)} autoComplete="on" disabled={!edit} />
          </div>
        </div>
        <div className="form-group col d-flex gap-2 mb-2">
          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Created</label>
            <input type="date" className="form-control" value={createTime} onChange={(e) => setCreateTime(e.target.value)} disabled={!edit} />
          </div>
          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Processed</label>
            <input type="date" className="form-control" value={confirmTime} onChange={(e) => setConfirmTime(e.target.value)} disabled={!edit} />
          </div>
          {completeTime && (
            <div className="col form-group input-group-sm">
              <label className="col-form-label px-1">Received</label>
              <input type="date" className="form-control" value={completeTime} onChange={(e) => setCompleteTime(e.target.value)} disabled={!edit} />
            </div>
          )}

          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Status</label>
            <input
              type="text"
              className={`form-control fw-bold ${STATUS_COLOR[status]}`}
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              autoComplete="on"
              disabled={!edit}
            />
          </div>
        </div>

        <div className="form-group col d-flex gap-2 mb-2">
          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Username</label>
            <input type="text" className="form-control" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="on" disabled={!edit} />
          </div>

          <div className="col-4 form-group input-group-sm">
            <label className="col-form-label px-1">User ID</label>
            <input type="text" className="form-control" placeholder="User ID" value={userID} onChange={(e) => setUserID(e.target.value)} autoComplete="on" disabled={!edit} />
          </div>
        </div>

        {items.map((item) => (
          <ProductModelCard
            order_sn={orders.order_sn}
            status_info={orders.status_info_v2.status}
            shipping={orders.fulfillment_carrier_name}
            item={item}
            edit={edit}
            key={item.line_item_id}
            onChange={handleItemChange}
          />
        ))}

        <div className="form-group col d-flex gap-2 mb-2">
          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Seller</label>
            <textarea className="form-control" value={senderAddress} rows="5" onChange={(e) => setSenderAddress(e.target.value)} disabled={!edit}></textarea>
          </div>
        </div>

        <div className="form-group input-group-sm col d-flex gap-2 mb-2">
          <div className="col form-group input-group-sm">
            <label className="col-form-label px-1">Buyer</label>
            <textarea className="form-control" value={buyerAddress} rows="5" onChange={(e) => setBuyerAddress(e.target.value)} disabled={!edit}></textarea>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-4 w-100">
          <button type="submit" className="btn btn-danger px-3" onClick={() => window.open(`https://seller.shopee.co.id/portal/sale/order/${orders.order_id}`, "blank")}>
            VIEW
          </button>
          <button type="submit" className={`btn px-3 ${edit ? "btn-secondary" : "btn-dark"}`} onClick={() => setEdit(!edit)}>
            {edit ? "Cancel Edit" : "Edit"}
          </button>
          <button type="submit" className="btn btn-success px-3" onClick={() => addForm()}>
            Next
          </button>
        </div>
      </div>
    </>
  )
}
