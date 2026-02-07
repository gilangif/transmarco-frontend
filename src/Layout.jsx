import { Outlet, NavLink, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { login, logout } from "./store/auth.js"

function NavItem({ to, label, onClick }) {
  return (
    <li className="nav-item fw-bold">
      <NavLink to={to} end className={({ isActive }) => "nav-link p-3 " + (isActive ? "active" : "text-light")} onClick={onClick}>
        {label}
      </NavLink>
    </li>
  )
}

export default function Layout() {
  const { host, navbar } = useSelector((s) => s.config)

  const [open, setOpen] = useState(window.innerWidth >= 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const dispatch = useDispatch()

  const resize = () => {
    setIsMobile(window.innerWidth < 768)
    setOpen(window.innerWidth >= 768)
  }

  useEffect(() => {
    window.addEventListener("resize", resize)

    return () => window.removeEventListener("resize", resize)
  }, [])

  return (
    <div className="d-flex">
      <aside
        className="bg-dark text-light p-3 position-fixed position-md-static"
        style={{
          width: isMobile ? "100vw" : 300,
          minHeight: "100vh",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "0.3s",
          zIndex: 1040,
        }}
      >
        <ul className="nav nav-pills p-3 mb-2">
          <li className="nav-item">
            <h5 className="fw-bold">{navbar.title}</h5>
            {navbar.desc && <span className="m-0 p-0 text-light">{navbar.desc}</span>}
          </li>
        </ul>
        <ul className="nav nav-pills flex-column gap-1">
          <NavItem onClick={() => (isMobile ? setOpen(false) : setOpen(true))} to="/" label="DASHBOARD" />
          <NavItem onClick={() => (isMobile ? setOpen(false) : setOpen(true))} to="/photo" label="PHOTO" />
          <NavItem onClick={() => (isMobile ? setOpen(false) : setOpen(true))} to="/rekapan" label="REKAPAN" />
          <NavItem onClick={() => (isMobile ? setOpen(false) : setOpen(true))} to="/sheets" label="GOOGLE SHEETS" />
          <NavItem onClick={() => (isMobile ? setOpen(false) : setOpen(true))} to="/shopee/boosts" label="SHOPEE BOOSTS" />
          <NavItem onClick={() => (isMobile ? setOpen(false) : setOpen(true))} to="/shopee/ecomm" label="SHOPEE ORDERS" />

          <li
            className="nav-item fw-bold mt-3"
            onClick={() => {
              isMobile ? setOpen(false) : setOpen(true)
              dispatch(logout())
            }}
          >
            <span className="nav-link text-light fw-bold">LOGOUT</span>
          </li>

          {isMobile && open && (
            <li className="nav-item fw-bold mt-4" onClick={() => setOpen(false)}>
              <span className="nav-link p-3 text-light fw-bold">CLOSE</span>
            </li>
          )}
        </ul>
      </aside>

      <div className="flex-grow-1" style={{ marginLeft: !isMobile && open ? 300 : 0 }}>
        <nav className="navbar navbar-dark bg-dark d-md-none py-3 px-2">
          <div className="container-fluid px-2 p-0">
            <div className="d-flex flex-column">
              <span className="navbar-brand fw-bold m-0 p-0">{navbar.title}</span>
              {navbar.desc && <span className="m-0 p-0 text-light">{navbar.desc}</span>}
            </div>
            <button className="btn btn-outline-light" onClick={() => setOpen(!open)}>
              ☰
            </button>
          </div>
        </nav>

        <div className="p-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
