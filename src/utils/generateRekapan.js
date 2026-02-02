function strDate(str) {
  const [year, month, day] = str.split("-").map((x) => parseInt(x))

  const date = new Date(str)

  return { date, str, day, month, year }
}

export default function (csv) {
  const arr = csv.split("\n").filter((x) => x)

  const tanggal = arr
    .find((x) => x.includes("Tanggal"))
    .split(",")[1]
    .split("-")

  const tmp = { brand: "", brands: [], data: [], start: strDate(tanggal.slice(0, 3).join("-")), end: strDate(tanggal.slice(3, 6).join("-")) }

  arr.forEach((row) => {
    const [str, nota, bon, till_code, jumlah, harga, discount_1, discount_2, discount_3, nett] = row.split(",")

    const price = parseInt(harga)
    const netto = parseInt(nett)
    const qty = parseInt(jumlah)

    const disc_1 = parseInt(discount_1)
    const disc_2 = parseInt(discount_2)
    const disc_3 = parseInt(discount_3)

    if (row.includes("Rekap Penjualan")) return
    if (row.includes("Tanggal")) return
    if (row.includes("Total")) return

    if (row.includes("Nota")) {
      tmp.brand = str.toUpperCase()
      return
    }

    const alias = tmp.brand
    const brand = alias.replace(" DE", "")

    const date = strDate(str)

    const code = nota.slice(0, 3)
    const type = code.includes("ECM") ? "ECM" : code.includes("BZ") ? "BZ" : code.includes("CS") && tmp.brand.includes(" DE") ? "DE" : "CS"

    const transmarco = ["HUSH PUPPIES", "PLAYBOY", "OBERMAIN", "CATTERPILLAR"].includes(brand)

    const obj = { ...date, transmarco, alias, brand, nota, bon, type, till_code, disc_1, disc_2, disc_3, price, netto, qty }

    if (!tmp.brands.includes(brand)) tmp.brands.push(brand)

    tmp.data.push(obj)
  })

  return tmp
}
