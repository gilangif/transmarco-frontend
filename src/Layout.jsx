import { Outlet, Link } from "react-router-dom"

import Nav from "./Nav"

export default function Layout() {
  return (
    <div>
      <Nav />
      <div className="outlet bg-dark">
        <Outlet />
      </div>
    </div>
  )
}
