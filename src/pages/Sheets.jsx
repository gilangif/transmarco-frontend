import { useSelector, useDispatch } from "react-redux"
import { setType, getStock } from "../store/sheets.js"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"
import { setNavbarTitle } from "../store/config.js"

import currrency from "../utils/currency.js"

export default function Sheets() {
  const { stocks, fields, type, loading, error } = useSelector((s) => s.sheets)

  const [filter, setFilter] = useState([])
  const [search, setSearch] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const stockHandler = async () => {
    try {
      dispatch(getStock())
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
    document.title = "STOCK PANJANG"

    dispatch(setNavbarTitle({ title: "Google Sheets", desc: `Stock Panjang Sheets` }))

    stockHandler()
  }, [dispatch])

  useEffect(() => {
    setFilter(stocks)
  }, [stocks])

  useEffect(() => {
    if (!search) {
      setFilter(stocks)

      return
    }

    const timer = setTimeout(() => {
      const s = search.toUpperCase()
      const arr = stocks.filter((x) => JSON.stringify(x).toUpperCase().includes(s))

      setFilter(arr)
    }, 1000)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="p-0">
      <div className="col p-3">
        <input type="text" className="form-control" placeholder="Search stock item..." value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="on" />
      </div>
      <div
        className="table-responsive p-3"
        style={{
          overflowX: "auto",
          maxWidth: "100vw",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-start">Brand</th>
              <th className="text-start">Barcode</th>
              <th className="text-start">Desc</th>
              <th className="text-start">Price</th>
              <th className="text-start">Promo</th>
              <th className="text-start">Netto</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Sales</th>
              <th className="text-center">Incoming</th>
              <th className="text-center">Outgoing</th>
              <th className="text-center">Ecomm</th>
              <th className="text-center">Left</th>
            </tr>
          </thead>
          <tbody>
            {filter.map((item, i) => {
              return (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td className="text-start">{item.brand}</td>
                  <td className={`text-start ${item.shopee_id ? "" : "text-secondary"}`} onClick={() => navigate(item.shopee_id ? `/shopee?id=${item.shopee_id}` : "#")}>
                    {item.barcode}
                  </td>
                  <td className="text-start">{item.desc}</td>
                  <td className="text-start">{currrency(item.price)}</td>
                  <td className="text-start">{item.promo}</td>
                  <td className="text-start">{currrency(item.netto)}</td>
                  <td className="text-center border text-secondary fw-bold">{item.inventory}</td>
                  <td className="text-center border text-primary fw-bold">{item.sales || ""}</td>
                  <td className="text-center border text-success fw-bold">{item.incoming || ""}</td>
                  <td className="text-center border text-danger fw-bold">{item.outgoing || ""}</td>
                  <td className="text-center border text-info fw-bold">{item.ecomm || ""}</td>
                  <td className={`text-center border ${item.stock < 0 ? "text-dark bg-danger" : "text-dark"} fw-bold`}>{item.stock}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
