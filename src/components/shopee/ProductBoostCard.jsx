import { useEffect, useState } from "react"
import timestamp from "../../utils/timestamp.js"

function secondsToHHMMSS(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
}

export default function ProductBoostCard({ image, id, boost_id, cool_down_seconds, date, name, detail, estimate }) {
  const [counter, setCounter] = useState(cool_down_seconds || 0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => setCounter(counter - 1), 1000)
    } else {
      setShow(false)
    }
  }, [counter])

  return (
    <div className="col-4 col-lg-2 p-1" style={{ display: show ? "block" : "none" }}>
      <div className="card h-100 border border-0 nocursor">
        <div className="img-hover-wrapper">
          <img src={image} className="card-img-top" alt={name} />

          <div className="img-overlay nocursor">
            <p>ESTIMATE TIME</p>
            <p>{estimate}</p>
          </div>
        </div>

        <div className="card-body p-2 text-center">
          <p className="card-title fw-bold my-1">{name}</p>
        </div>

        <div className="p-1">
          <a href={`/shopee?id=${id}`} className="btn btn-success btn-sm fw-bold w-100">
            {secondsToHHMMSS(counter)}
          </a>
        </div>
      </div>
    </div>
  )
}
