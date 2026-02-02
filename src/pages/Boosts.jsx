import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"
import { setNavbarTitle } from "../store/config.js"

import BoostCard from "../components/shopee/BoostCard.jsx"

import axios from "axios"

export default function Boosts() {
  const { username, accessToken } = useSelector((s) => s.auth)
  const { host, navbar } = useSelector((s) => s.config)

  const [boosts, setBoosts] = useState([])

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const getBoosts = async () => {
    try {
      const { data } = await axios.get(host + "/shopee/boosts", { headers: { Authorization: `Bearer ${accessToken}` } })

      if (data.failed) throw data

      setBoosts(data)
      dispatch(setNavbarTitle({ title: "Shopee Boosts Product", desc: `Total ${data.length} product boosted` }))
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

    dispatch(setNavbarTitle({ title: "Shopee Boosts Product", desc: "" }))

    getBoosts()
  }, [])

  return (
    <div className="row justify-content-start p-3 m-0 mb-3 nocursor">
      {boosts.map((boost, i) => {
        const { id, boost_id, cool_down_seconds, date, name, detail, estimate } = boost
        const { images = [] } = detail || {}

        const cover = `https://down-id.img.susercontent.com/file/${images[0]}`

        return <BoostCard key={i} image={cover} id={id} boost_id={boost_id} cool_down_seconds={cool_down_seconds} date={date} name={name} estimate={estimate} />
      })}
    </div>
  )
}
