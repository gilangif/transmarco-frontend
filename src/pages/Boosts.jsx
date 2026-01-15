import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import ProductBoostCard from "../components/shopee/ProductBoostCard.jsx"

import axios from "axios"

export default function Boosts() {
  const { host } = useSelector((s) => s.config)
  const { username, accessToken } = useSelector((s) => s.auth)

  const [boosts, setBoosts] = useState([])

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const logoutHandler = () => {
    dispatch(logout())
    navigate("/login")
  }

  const getBoosts = async () => {
    try {
      const { data } = await axios.get(host + "/shopee/boosts", { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.failed) throw data

      setBoosts(data)
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
    document.title = "BOOSTS PRODUCT"

    getBoosts()
  }, [])

  return (
    <div className="container">
      <div className="d-flex px-1 py-3">
        <div className="d-flex flex-column w-100 justify-content-center align-items-start">
          <h1 className="m-0 nocursor">Product Dashboard</h1>
          <p className="m-0 nocursor">Total {boosts.length} product boosted</p>
        </div>
        <div className="d-flex justify-content-center align-items-center p-2 nocursor">
          <span className="material-symbols-outlined nocursor" style={{ scale: 1.5 }} onClick={() => logoutHandler()}>
            account_circle
          </span>
        </div>
      </div>
      <div className="row justify-content-start p-0 m-0 mb-3">
        {boosts.map((boost, i) => {
          const { id, boost_id, cool_down_seconds, date, name, detail, estimate } = boost
          const { images = [] } = detail || {}

          const cover = `https://down-id.img.susercontent.com/file/${images[0]}`

          return <ProductBoostCard key={i} image={cover} id={id} boost_id={boost_id} cool_down_seconds={cool_down_seconds} date={date} name={name} estimate={estimate} />
        })}
      </div>
    </div>
  )
}
