import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import axios from "axios"

export default function Dashboard() {
  const { host } = useSelector((s) => s.config)
  const { username, accessToken } = useSelector((s) => s.auth)

  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState([])

  const [search, setSearch] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const getOrders = async () => {
    try {
      const { data } = await axios.get(host + "/shopee/orders", { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.failed) throw data

      const fil = data.sort((a, b) => b.order_ext_info.order_id - a.order_ext_info.order_id)

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

    getOrders()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setFilter(orders.filter((x) => JSON.stringify(x).toUpperCase().includes(search.toUpperCase())))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      <div className="container">
        <div className="container py-4 p-0">
          <div className="d-flex flex-column w-100 justify-content-center align-items-start">
            <h1 className="m-0 nocursor">Pesanan Perlu dikirim</h1>
            <p className="m-0 nocursor">
              {search ? `menampilkan ${filter.length} data filter dari` : ""} total {orders.length} pesanan perlu dikirim
            </p>
          </div>
        </div>

        <div className="w-100 mb-4">
          <input type="text" className="form-control py-2 w-100 search-form nocursor" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pesanan..." />
        </div>

        <div className="row justify-content-center p-0 m-0 gap-2">
          {filter.map((order, i) => {
            const { card_header, item_info_group, payment_info, status_info, fulfilment_info, action_info, order_ext_info, package_ext_info } = order
            const { item_info_list, message } = item_info_group || {}

            const { order_sn, buyer_info } = card_header || {}
            const { username } = buyer_info || {}

            const { fulfilment_channel_name, masked_channel_name, ship_out_mode, short_code = "" } = fulfilment_info
            const { order_id, seller_address, odp_url_path_query } = order_ext_info || {}

            const { address_id, user_id, status, name, phone, country, state, city, district, address, zip_code } = seller_address

            const pickup = `${fulfilment_channel_name} ${ship_out_mode} ${short_code} from ${city}`

            const p = pickup.toUpperCase()
            const json = JSON.stringify(order)

            const card = item_info_list.map((item, j) => {
              const { item_list, item_ext_info } = item

              return item_list.map((product, k) => {
                const { name, image, description, amount, is_wholesale, inner_item_ext_info } = product
                const { item_id, model_id, is_prescription_item } = inner_item_ext_info || {}

                const src = `https://down-id.img.susercontent.com/file/${image}`

                return (
                  <div className="card rounded p-0 w-100 h-100 border border-0" key={i}>
                    <img src={src} key={k} className="card-img-top" onDoubleClick={() => navigate(`/shopee?id?=${item_id}`)} />

                    <div className="card-body p-2">
                      <p className="card-title fw-bold">
                        <Link className="text-dark text-decoration-none" target="_blank" to={`https://seller.shopee.co.id/portal/product/${inner_item_ext_info.item_id}`}>
                          {name.slice(0, 60).split(" ").slice(0, 6).join(" ")}
                        </Link>
                      </p>
                      <p className="">{description?.replace("Variation: ", "")?.replace(",", ", ")}</p>
                      <p className={`fw-bold ${amount > 1 ? "text-danger" : ""}`}>Jumlah {amount} pcs</p>
                    </div>
                  </div>
                )
              })
            })

            const cn = p.includes("INSTANT") ? "alert-danger" : ["HPAL", "HPAM", "HPSL", "HPC"].find((x) => json.includes(x)) ? "alert-info" : p.includes("DEPOK") ? "alert-warning" : "alert-success"

            return (
              <div className="col-12 col-lg-3 d-flex flex-column p-1 text-light rounded gap-1 bg-light">
                <div class={`alert ${cn} m-0 p-2`} role="alert">
                  <h5 class="alert-heading">
                    <Link className="text-dark text-decoration-none" to={`https://seller.shopee.co.id/portal/sale/${order_id}`} target="_blank">
                      {order_sn}
                    </Link>
                  </h5>
                  <p className="m-0 fw-bold">{pickup}</p>
                  <p className="my-2 fw-bold">{username}</p>
                  <hr />
                  <p class="mb-0" style={{ fontSize: "0.7rem" }}>
                    {package_ext_info.shipping_address.slice(0, 100)}
                  </p>
                </div>
                <div className="alert p-1" style={{ display: message ? "block" : "none" }}>
                  <div class="alert alert-danger" role="alert">
                    {message}
                  </div>
                </div>
                <div className="d-flex gap-1 p-0 h-100">{card}</div>
              </div>
            )
            return
          })}
        </div>
      </div>
    </>
  )
}
