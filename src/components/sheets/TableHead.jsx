import { useSelector, useDispatch } from "react-redux"

export default function TableHead() {
  const { stocks, fields, type, loading, error } = useSelector((s) => s.sheets)

  return (
    <thead>
      <tr>
        <th colSpan="4" className="text-center">
          TRANSMARCO
        </th>
        <th colSpan={fields.length} className="text-center">
          {type.name}
        </th>
        <th colSpan="4" className="text-center">
          UNIT
        </th>
        <th colSpan="3" className="text-center">
          DETAIL
        </th>
      </tr>
      <tr>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          #
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          Artikel
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          Desc
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          Brand
        </th>
        {fields.map((item) => (
          <th key={item} className="text-center align-middle">
            {item === "XXL" ? "2XL" :item === "XXXL" ? "3XL" : item}
          </th>
        ))}
        <th scope="col" rowSpan="1" className="text-center align-middle">
          PRICE
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          PROMO
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          HELPER
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          NETTO
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          REFF CODE
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          SHOPEE
        </th>
        <th scope="col" rowSpan="1" className="text-center align-middle">
          LAZADA
        </th>
      </tr>
    </thead>
  )
}
