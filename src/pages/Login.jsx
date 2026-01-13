import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import axios from "axios"

export default function Login() {
  const { host } = useSelector((s) => s.config)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [focus, setFocus] = useState(null)

  const auth = async (e) => {
    try {
      e.preventDefault()

      const { data } = await axios.post(host + "/users/auth", { username, password })

      const message = `Welcome back ${username}`

      toast.success(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })

      dispatch(login(data))
      navigate("/")
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      })
    }
  }

  return (
    <div className="container-fluid vh-100  d-flex justify-content-center align-items-center">
      <form onSubmit={auth} className="form-signin" style={{ maxWidth: "420px" }}>
        <div className="text-center mb-6">
          <img className="mb-4" src={focus ? "/src/assets/pepe-typing.gif" : "/src/assets/pepe-inspace.gif"} alt="" width="110" height="110" />
          <h1 className="h3 mb-2 font-weight-normal">Welcome Back</h1>
          <p className="text-light">You can sign in to access with your existing account.</p>
        </div>

        <div className="form-label-group mt-4 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>

        <div className="form-label-group mb-5">
          <input
            type="password"
            id="inputPassword"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>

        <button className="btn btn-lg btn-sm btn-primary btn-block w-100 p-2" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
