export default function TableSheetStock({ fields = [], sheets }) {
  const header = fields.map((item, item_index) => <th key={item_index}>{item === "XXL" ? "2XL" : item === "XXXL" ? "3XL" : item === "XXXXL" ? "4XL" : item}</th>)

  const stock = sheets?.map((item, i) => {
    const types = [
      { name: "STOCK", params: "STOCK AWAL" },
      { name: "SALES", params: "PENJUALAN BARANG" },
      { name: "IN", params: "DATANG BARANG" },
      { name: "OUT", params: "RETUR BARANG" },
      { name: "ECOMM", params: "E-COMMERCE" },
      { name: "SISA", params: "STOCK AKHIR" },
    ]

    return types.map((type, j) => (
      <tr key={`${i}-${type.name}`} className="text-center align-middle">
        {j === 0 && (
          <td rowSpan={types.length} className="fw-bold p-0">
            {item.ARTIKEL.slice(7)}
          </td>
        )}

        <td className="fw-bold">{type.name}</td>

        {fields.map((size, k) => {
          const sku = item["ARTIKEL"] + size
          const value = item?.[type.params]?.[sku] || ""

          let className = size === "TTL" ? "fw-bold" : ""

          if (type.name === "STOCK") className = " text-success fw-bold"
          if (type.name === "SISA") className = " text-primary fw-bold"

          if (value && value < 0) className = "text-dark bg-danger fw-bold"

          return (
            <td key={k} className={className}>
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
