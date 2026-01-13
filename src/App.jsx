import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./Layout"
import Dashboard from "./pages/Dashboard"
import Shopee from "./pages/Shopee"
import Sheets from "./pages/Sheets"
import Tools from "./pages/Tools"
import Login from "./pages/Login"
import Boosts from "./pages/Boosts.jsx"

import { useSelector } from "react-redux"
import { Navigate, Outlet, useLocation } from "react-router-dom"

function RequireAuth() {
  const isAuth = useSelector((state) => !!state.auth.accessToken)
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/tools" element={<Tools />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/boosts" element={<Boosts />} />
            <Route path="/sheets" element={<Sheets />} />
            <Route path="/shopee" element={<Shopee />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
