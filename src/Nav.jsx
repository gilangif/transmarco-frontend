import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, Link } from "react-router-dom"

function NavItems({ to, icon, active }) {
  return (
    <div className="text-center">
      <Link to={to}>
        <span className={`navbar-icon navbar-items material-symbols-outlined disable-select ${active ? "text-warning" : ""}`} style={{ fontSize: "2.1rem" }}>
          {icon}
        </span>
      </Link>
    </div>
  )
}

export default function Nav() {
  const location = useLocation()

  const items = [
    { to: "/", icon: "home" },
    { to: "/sheets", icon: "assignment" },
    { to: "/boosts", icon: "local_fire_department" },
    { to: "/tools", icon: "image" },
  ]

  return (
    <nav className="navbar navbar-container fixed-bottom p-2 p-lg-0 px-lg-3">
      <div className="d-flex justify-content-around justify-content-lg-start align-items-center gap-2 gap-lg-4 w-100 px-2 py-1">
        {items.map((x, i) => {
          const { to, icon } = x

          const active = location.pathname === x.to
          return <NavItems key={i} to={to} icon={icon} active={active} />
        })}
      </div>
    </nav>
  )
}
