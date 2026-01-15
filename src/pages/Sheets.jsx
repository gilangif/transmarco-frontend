import { useSelector, useDispatch } from "react-redux"
import { setType, getStock } from "../store/sheets.js"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { login, logout } from "../store/auth.js"

import TableHead from "../components/sheets/TableHead.jsx"
import TableSheetStock from "../components/sheets/TableSheetStock.jsx"

import currrency from "../utils/currency.js"

export default function Sheets() {
  const { stocks, fields, type, loading, error } = useSelector((s) => s.sheets)
  const { username } = useSelector((s) => s.auth)

  const [isOpen, setOpen] = useState(false)
  const [filter, setFilter] = useState([])
  const [arr, setArr] = useState([])

  const [target, setTarget] = useState({})
  const [search, setSearch] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const openSheet = (item) => {
    setArr(stocks.filter((x) => x.artikel === item.artikel))
    setTarget(item)
    setOpen(true)
  }

  const stockHandler = async () => {
    try {
      await dispatch(getStock()).unwrap()

      document.title = "STOCK PANJANG"
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
    stockHandler()
  }, [dispatch])

  useEffect(() => {
    setFilter(stocks)
  }, [stocks])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        const s = search.toUpperCase()
        const arr = stocks.filter((x) => x.art?.includes(s) || x.desc?.includes(s) || x.artikel?.includes(s) || x.brand?.includes(s))

        setFilter(arr)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="container bg-dark py-4">
      <h1>HUSH PUPPIES APPAREL</h1>
      <p>{username.toUpperCase()}</p>

      <div className="d-flex w-100 py-2">
        <input type="text" className="form-control py-2 w-100 search-form nocursor" onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-responsive bg-dark">
        <table className="table table-striped table-bordered table-fixed table-dark">
          <TableHead />
          <tbody>
            <Sheet isOpen={isOpen} onClose={() => setOpen(false)} className="custom-sheet">
              <Sheet.Container>
                <Sheet.Header className="p-3">
                  <div className="d-flex">
                    <div className="col d-flex flex-column justify-content-center align-items-start text-dark px-2">
                      <h5 className="fw-bold m-0 text-uppercase">
                        {target["brand"]} {target["desc"]}
                      </h5>
                      <p className="m-0 fw-bold">{target["art"]}</p>
                      <p className="m-0 py-1">{arr.length} variant</p>
                    </div>
                    <div className="d-flex justify-content-center align-items-center gap-3 text-dark nocursor">
                      <span className="material-symbols-outlined p-2 fw-bold nocursor" onClick={() => navigate(`/shopee?id=${target["shopee_id"]}`)} style={{ fontSize: "2.1rem" }}>
                        warehouse
                      </span>
                      <span className="material-symbols-outlined p-2 fw-bold nocursor" style={{ fontSize: "2.1rem" }} onClick={() => setOpen(false)}>
                        close
                      </span>
                    </div>
                  </div>
                </Sheet.Header>
                <Sheet.Content>
                  <TableSheetStock arr={arr} fields={fields} />
                </Sheet.Content>
              </Sheet.Container>
              <Sheet.Backdrop onTap={() => setOpen(false)} />
            </Sheet>

            {filter.map((item, i) => {
              const artikel = item["artikel"] || ""
              const desc = item["desc"] || ""
              const brand = item["brand"] || ""

              const price = item["price"]
              const promo = item["promo"]
              const netto = item["netto"]
              const disc = item["disc"]

              const lazada_id = item["lazada_id"] || "-"
              const shopee_id = item["shopee_id"] || "-"
              const reff_code = item["reff_code"] || "-"

              const inventory = item["inventory_field"]

              return (
                <tr key={artikel} className="text-center">
                  <td scope="row" className="text-center align-middle">
                    {i + 1}
                  </td>
                  <td className="text-center align-middle" onClick={() => openSheet(item)}>
                    {artikel}
                  </td>
                  <td className="text-center align-middle" onClick={() => navigate(`/shopee?id=${shopee_id}`)}>
                    {desc}
                  </td>
                  <td className="text-center align-middle">{brand}</td>

                  {fields.map((field, j) => {
                    const stock = field !== "TTL" && !inventory[j] ? "" : inventory[j]
                    const style = field === "TTL" ? "text-info" : stock < 0 ? "text-danger" : ""

                    return (
                      <td key={j} className={`text-center align-middle fw-bold ${style}`}>
                        {stock}
                      </td>
                    )
                  })}

                  <td className="text-center align-middle">{currrency(price)}</td>
                  <td className="text-center align-middle">{promo}</td>
                  <td className="text-center align-middle">{disc}</td>
                  <td className="text-center align-middle">{currrency(netto)}</td>

                  <td className="text-center align-middle">{reff_code}</td>
                  <td className="text-center align-middle">
                    <Link to={`/shopee?id=${shopee_id}`} className="text-light text-decoration-none fw-bold">
                      {shopee_id}
                    </Link>
                  </td>
                  <td className="text-center align-middle">{lazada_id}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
