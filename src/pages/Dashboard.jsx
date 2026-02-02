import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"
import { setNavbarTitle } from "../store/config.js"

import currrency from "../utils/currency.js"
import timestamp from "../utils/timestamp.js"

import axios from "axios"

function secondsToHHMMSS(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
}

function Card({ src, name, description, amount, countdown, instant }) {
  const now = Math.floor(Date.now() / 1000)

  const [counter, setCounter] = useState(Math.max(countdown - now, 0))
  const [estimate, setEstimate] = useState("")

  const DEFAULT_IMAGE = "https://www.freeiconspng.com/uploads/pepe-clip-art-9.png"

  useEffect(() => {
    const date = new Date(countdown * 1000)
    const date_id = date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" })

    setEstimate(timestamp(date_id))
  }, [])

  useEffect(() => {
    if (!instant || counter <= 0) return

    const timer = setInterval(() => {
      setCounter((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [instant])

  return (
    <div className="d-flex gap-2 px-1 py-3 orders-title-container">
      <div className="p-0">
        <div className="border border-1 rounded p-1">
          <img
            src={src || DEFAULT_IMAGE}
            alt={src || DEFAULT_IMAGE}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_IMAGE
            }}
            className="orders-img-product rounded"
          />
        </div>
      </div>
      <div className="col d-flex flex-column gap-1">
        <div className="d-flex flex-column justify-content-between py-1">
          <p className="m-0 mb-1 p-0 fw-bold text-dark text-truncate" style={{ width: "70vw" }}>
            {name}
          </p>

          <div className="py-1">
            <p className="m-0 p-0 fw-bold text-secondary">{description}</p>
            <p className={`m-0 p-0 fw-bold ${amount > 1 ? "text-danger" : "text-secondary"}`}>Total : {amount} pcs</p>
          </div>
          {instant && (
            <div className="py-2">
              <p className="m-0 p-0 fw-bold text-danger">{estimate}</p>
              <p className="m-0 p-0 fw-bold text-danger">Perlu dikirim dalam {secondsToHHMMSS(counter)} lagi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { host } = useSelector((s) => s.config)
  const { username, accessToken } = useSelector((s) => s.auth)

  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState([])

  const [search, setSearch] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const DEFAULT_IMAGE = "https://media.tenor.com/dl3I6S8ATI8AAAAm/pepe.webp"

  const getOrders = async () => {
    try {
      const { data } = await axios.get(host + "/shopee/orders", { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.failed) throw data

      const fil = data.sort((a, b) => b.order_ext_info.order_id - a.order_ext_info.order_id)

      dispatch(setNavbarTitle({ title: "Dashboard", desc: `total ${data.length} pesanan perlu dikirim` }))

      setOrders(fil)
      setFilter(fil)
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
    document.title = "DASHBOARD"

    dispatch(setNavbarTitle({ title: "Dashboard", desc: "" }))
    getOrders()
  }, [])

  useEffect(() => {
    if (!search) {
      setFilter(orders)
      dispatch(setNavbarTitle({ title: "Dashboard", desc: `total ${orders.length} pesanan perlu dikirim` }))
      return
    }

    const results = orders.filter((x) => JSON.stringify(x).toUpperCase().includes(search.toUpperCase()))
    const timer = setTimeout(() => setFilter(results), 800)

    dispatch(setNavbarTitle({ title: "Dashboard", desc: `menampilkan ${results.length} hasil pencarian` }))

    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      <div className="p-2 p-lg-2">
        <div className="w-100 py-3 mb-2">
          <input type="text" className="form-control py-2 w-100 search-form nocursor" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pesanan..." />
        </div>

        <div className="d-flex flex-column gap-3">
          {filter.map((order, i) => {
            const { card_header, item_info_group, payment_info, status_info, fulfilment_info, action_info, order_ext_info, package_ext_info } = order || {}
            const { item_info_list, message } = item_info_group || {}

            const { order_sn, buyer_info } = card_header || {}
            const { username, portrait } = buyer_info || {}

            const { payment_method, total_price } = payment_info || {}

            const { fulfilment_channel_name, masked_channel_name, ship_out_mode, short_code = "" } = fulfilment_info || {}
            const { order_id, seller_address, odp_url_path_query } = order_ext_info || {}

            const { address_id, user_id, status, name, phone, country, state, city, district, address, zip_code } = seller_address || {}

            const { status_description } = status_info
            const { description_timestamp_list } = status_description || {}

            const pickup = `${fulfilment_channel_name} ${ship_out_mode} ${short_code} from ${city}`

            const countdown = description_timestamp_list?.find((x) => x.is_count_down)

            const p = pickup.toUpperCase()
            const json = JSON.stringify(order)

            const card = item_info_list.map((item, j) => {
              const { item_list, item_ext_info } = item

              return item_list.map((product, k) => {
                const { name, image, description, amount, is_wholesale, inner_item_ext_info } = product
                const { item_id, model_id, is_prescription_item } = inner_item_ext_info || {}

                const src = `https://down-id.img.susercontent.com/file/${image}`

                return (
                  <Card src={src} name={name} image={image} description={description} amount={amount} countdown={countdown ? countdown.timestamp : null} instant={p.includes("INSTANT")} key={i + j} />
                )
              })
            })

            const cn = p.includes("INSTANT") ? "bg-danger" : ["HPAL", "HPAM", "HPSL", "HPC"].find((x) => json.includes(x)) ? "bg-info" : p.includes("DEPOK") ? "bg-secondary" : "bg-dark"

            const profile = `https://down-id.img.susercontent.com/file/${portrait}`

            return (
              <div className="d-flex flex-column rounded p-0" key={i}>
                <div className={`d-flex flex-row text-light rounded-top ${cn}`}>
                  <div className="col d-flex justify-align-center align-items-center p-2 gap-2">
                    <div className="p-1">
                      <img
                        src={profile}
                        className="orders-img-profile"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE
                        }}
                      />
                    </div>
                    <h6 className="fw-bold m-0 p-0">{username}</h6>
                  </div>
                  <div className="d-flex justify-align-center align-items-center py-2 px-3">
                    <h6 className="fw-bold m-0 p-0" onClick={() => navigate("https://seller.shopee.co.id" + odp_url_path_query)}>
                      {order_sn}
                    </h6>
                  </div>
                </div>
                <div className="d-flex flex-column p-1 border border-1 rounded-bottom">
                  {card}

                  <div className="p-2">
                    <hr className="m-0 p-2" />
                    <ul>
                      <li>{pickup}</li>
                      <li>
                        {payment_method} Rp.{currrency(total_price / 100000)}
                      </li>
                    </ul>

                    {message && <div className="alert alert-danger text-bold m-0 px-2 py-1 mt-4">Pesan: {message}</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
