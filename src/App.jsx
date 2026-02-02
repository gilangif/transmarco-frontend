import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./Layout.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Shopee from "./pages/Shopee.jsx"
import Sheets from "./pages/Sheets.jsx"
import Photo from "./pages/Photo.jsx"
import Login from "./pages/Login.jsx"
import Boosts from "./pages/Boosts.jsx"
import Ecomm from "./pages/Ecomm.jsx"
import Rekapan from "./pages/Rekapan.jsx"
import Sales from "./pages/Sales.jsx"

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
          <Route path="/photo" element={<Photo />} />
          <Route path="/rekapan" element={<Rekapan />} />
          <Route path="/sales" element={<Sales />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shopee/boosts" element={<Boosts />} />
            <Route path="/shopee/ecomm" element={<Ecomm />} />
            <Route path="/sheets" element={<Sheets />} />
            <Route path="/shopee" element={<Shopee />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
