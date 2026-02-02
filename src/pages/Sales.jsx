import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { setNavbarTitle } from "../store/config.js"

import currrency from "../utils/currency.js"
import generateRekapan from "../utils/generateRekapan.js"

function arrHelper(arr, nota) {
  const price = arr.map((x) => x.price).reduce((a, b) => a + b, 0)
  const netto = arr.map((x) => x.netto).reduce((a, b) => a + b, 0)

  const disc_1 = arr.map((x) => x.disc_1).reduce((a, b) => a + b, 0)
  const disc_2 = arr.map((x) => x.disc_1).reduce((a, b) => a + b, 0)
  const disc_3 = arr.map((x) => x.disc_3).reduce((a, b) => a + b, 0)
  const qty = arr.map((x) => x.qty).reduce((a, b) => a + b, 0)

  const day = ""
  const type = ":"

  return { day, type, nota, price, disc_1, disc_2, disc_3, netto, qty }
}

export default function Shopee() {
  const { csv } = useSelector((s) => s.rekapan)

  const [searchParams] = useSearchParams()

  const [filter, setFilter] = useState([])
  const [report, setReport] = useState({})

  const [range, setRange] = useState({ start: 1, end: 31 })

  const dispatch = useDispatch()

  const brand = searchParams.get("brand")

  const number = Array.from({ length: 31 }, (_, i) => i + 1)

  useEffect(() => {
    if (!brand) return
    if (!csv) return

    const { brands, data, start, end } = generateRekapan(csv)

    const rekapan = data
      .filter((x) => x.brand === brand)
      .filter((x) => x.day >= range.start && x.day <= range.end)
      .sort((a, b) => a.bon - b.bon)

    const total = data.filter((x) => x.brand === brand).sort((a, b) => a.bon - b.bon)

    const total_netto = total.map((x) => x.netto + x.disc_3).reduce((a, b) => a + b, 0)
    const total_qty = total.map((x) => x.qty).reduce((a, b) => a + b, 0)

    const online = rekapan.filter((x) => x.type === "ECM")
    const offline = rekapan.filter((x) => x.type !== "ECM")

    const online_netto = online.map((x) => x.netto + x.disc_3).reduce((a, b) => a + b, 0)
    const online_qty = online.map((x) => x.qty).reduce((a, b) => a + b, 0)
    const offline_netto = offline.map((x) => x.netto + x.disc_3).reduce((a, b) => a + b, 0)
    const offline_qty = offline.map((x) => x.qty).reduce((a, b) => a + b, 0)

    setFilter(rekapan)
    setReport({ total_netto, total_qty, online_netto, online_qty, offline_qty, offline_netto })

    dispatch(setNavbarTitle({ title: brand, desc: "DAILY SALES REPORTS" }))
  }, [range, brand])

  return (
    <div className="p-2 p-lg-3">
      <div className="d-flex gap-3 mb-4">
        <div className="form-group col input-group-sm">
          <label className="col-form-label px-1">Start</label>
          <select class="form-select" value={range.start} onChange={(e) => setRange((prev) => ({ ...prev, start: parseInt(e.target.value) }))}>
            {number.map((x) => (
              <option value={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="form-group col input-group-sm">
          <label className="col-form-label px-1">End</label>
          <select class="form-select" value={range.end} onChange={(e) => setRange((prev) => ({ ...prev, end: parseInt(e.target.value) }))}>
            {number.map((x) => (
              <option value={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="col mt-3 mb-5">
        <table className="table table-sm table-hover text-nowrap">
          <thead>
            <tr>
              <th className="text-center">TYPE</th>
              <th className="text-center">TOTAL NETTO</th>
              <th className="text-center">TOTAL QTY</th>
              <th className="text-center">PERCENTAGE</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            <tr>
              <td className="text-center">OFFLINE</td>
              <td className="text-center">RP {currrency(report.offline_netto)}</td>
              <td className="text-center">{report.offline_qty} PCS</td>
              <td className="text-center">{((report.offline_netto / report.total_netto) * 100).toFixed(1)} %</td>
            </tr>
            <tr>
              <td className="text-center">ONLINE</td>
              <td className="text-center">RP {currrency(report.online_netto)}</td>
              <td className="text-center">{report.online_qty} PCS</td>
              <td className="text-center">{((report.online_netto / report.total_netto) * 100).toFixed(1)} %</td>
            </tr>
            <tr>
              <td className="text-center fw-bold">TOTAL</td>
              <td className="text-center fw-bold">RP {currrency(report.total_netto)}</td>
              <td className="text-center fw-bold">{report.total_qty} PCS</td>
              <td className="text-center fw-bold">100 %</td>
            </tr>
          </tbody>
        </table>
      </div>

      {Array.from({ length: 31 }, (_, i) => {
        if (i < range.start - 1) return
        if (i > range.end - 1) return

        const day = i + 1
        const daily = filter.filter((x) => x.day === day).sort((a, b) => a.type.localeCompare(b.type, "id", { sensitivity: "base" }))

        const on = daily.filter((x) => x.type === "ECM")
        const off = daily.filter((x) => x.type !== "ECM")

        const total = arrHelper(daily, "TOTAL")
        const offline = arrHelper(off, "OFFLINE")
        const online = arrHelper(on, "ONLINE")

        const data = [...daily, offline, online, total]

        return (
          <div className="table-responsive" key={i}>
            <table className="table table-sm table-striped table-hover text-nowrap mb-5">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="text-center">
                    DAY
                  </th>
                  <th scope="col" className="text-start">
                    NOTA
                  </th>
                  <th scope="col" className="text-center">
                    TYPE
                  </th>
                  <th scope="col" className="text-start">
                    BON
                  </th>
                  <th scope="col" className="text-start">
                    SKU
                  </th>
                  <th scope="col" className="text-end">
                    PRICE
                  </th>
                  <th scope="col" className="text-end">
                    NETT
                  </th>
                  <th scope="col" className="text-end">
                    DISC 1
                  </th>
                  <th scope="col" className="text-end">
                    DISC 2
                  </th>
                  <th scope="col" className="text-end">
                    DISC 3
                  </th>
                  <th scope="col" className="text-end">
                    NETTO
                  </th>
                  <th scope="col" className="text-center">
                    QTY
                  </th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {data.map((item, idx) => {
                  let color = ""

                  if (idx < data.length && item.qty < 0) color = "text-danger"

                  if (item.nota === "ONLINE") color = "fw-bold"
                  if (item.nota === "OFFLINE") color = "fw-bold"
                  if (item.nota === "TOTAL") color = "text-danger fw-bold"

                  return (
                    <tr key={`${day}-${idx}`}>
                      <td className={`text-center ${color}`}>{item.day}</td>
                      <td className={`text-start ${color}`}>{item.nota}</td>
                      <td className={`text-center ${color}`}>{item.type}</td>
                      <td className={`text-start ${color}`}>{item.bon}</td>
                      <td className={`text-start ${color}`}>{item.till_code}</td>
                      <td className={`text-end ${color}`}>{currrency(item.price)}</td>
                      <td className={`text-end ${color}`}>{currrency(item.netto)}</td>
                      <td className={`text-end text-secondary ${color}`}>{currrency(item.disc_1)}</td>
                      <td className={`text-end text-secondary ${color}`}>{currrency(item.disc_2)}</td>
                      <td className={`text-end text-secondary ${color}`}>{currrency(item.disc_3)}</td>
                      <td className={`text-end ${color}`}>{currrency(item.netto + item.disc_3)}</td>
                      <td className={`text-center ${color}`}>{item.qty}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
