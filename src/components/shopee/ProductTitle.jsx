import timestamp from "../../utils/timestamp.js"

export default function ProductTitle({ name = "PRODUCT NOT FOUND", category = "CATEGORY NOT FOUND", desc = "-", date = Date.now() / 1000, sku, id, weight }) {
  return (
    <div className="col-lg-12">
      <div className="alert alert-success" role="alert">
        <h4 className="alert-heading fw-bold">{name}</h4>
        <h6 className="fw-bold">{category}</h6>
        <hr />
        <p style={{ whiteSpace: "pre-line" }}>{desc}</p>
        <br />
        <hr />
        <li className="mx-lg-3">Create Time : {timestamp(new Date(date * 1000))}</li>
        <li className="mx-lg-3">
          Product : {sku} {id}
        </li>
        <li className="mx-lg-3">Weight : {}</li>
      </div>
    </div>
  )
}
