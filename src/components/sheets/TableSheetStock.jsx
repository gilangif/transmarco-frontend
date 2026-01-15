import { useSelector, useDispatch } from "react-redux"

export default function TableSheetStock({ arr = [] }) {
  const { fields } = useSelector((s) => s.sheets)

  const header = fields.map((item, item_index) => <th key={item_index}>{item === "XXL" ? "2XL" : item === "XXXL" ? "3XL" : item === "XXXXL" ? "4XL" : item}</th>)

  const types = [
    { name: "STOCK", params: "stock" },
    { name: "SALES", params: "sales" },
    { name: "IN", params: "incoming" },
    { name: "OUT", params: "outgoing" },
    { name: "ECOMM", params: "ecomm" },
    { name: "SISA", params: "inventory" },
  ]

  const stock = arr.map((item, i) => {
    return types.map(({ name, params }, j) => (
      <tr key={`${i}-${name}`} className="text-center align-middle">
        {j === 0 && (
          <td rowSpan={types.length} className="fw-bold p-0">
            {item.artikel.slice(7)}
          </td>
        )}

        <td className="fw-bold">{name}</td>

        {fields.map((field, k) => {
          const stock = item[params + "_field"] || []

          const value = stock[k] || ""

          let style = field === "TTL" ? "fw-bold" : ""

          if (name === "STOCK") style = "text-success fw-bold"
          if (name === "SISA") style = "text-primary fw-bold"

          if (value && value < 0) style = "text-dark bg-danger fw-bold"

          return (
            <td key={k} className={style}>
              {value}
            </td>
          )
        })}
      </tr>
    ))
  })

  return (
    <div className="table-responsive rounded no-scrollbar ">
      <table className="table table-sm table-striped table-bordered m-0">
        <thead>
          <tr>
            <th colSpan="1" rowSpan="2" className="text-center align-middle">
              SKU
            </th>
            <th colSpan="1" rowSpan="2" className="text-center align-middle">
              TYPE
            </th>
            <th colSpan={fields.length} className="text-center align-middle">
              PRODUCT STOCK
            </th>
          </tr>
          <tr className="align-middle text-center">{header}</tr>
        </thead>
        <tbody>{stock}</tbody>
      </table>
    </div>
  )
}
