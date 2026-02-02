import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"

import { setCSV } from "../store/rekapan.js"

import currrency from "../utils/currency.js"
import generateRekapan from "../utils/generateRekapan.js"

const acara = {
  "00": "NORMAL",
  "01": "10%",
  "02": "20%",
  "03": "30%",
  "04": "40%",
  "05": "50%",
  "06": "60%",
  "07": "70%",
  10: "SP",
  11: "BUY 1 GET 1",
  12: "BUY 1 GET 2",
  13: "BUY 2 GET 1",
  18: "SP+10%",
  19: "NORMAL+20%",
  78: "55%",
  83: "30+10%",
  85: "50+10%",
  92: "20+20%",
  93: "30+20%",
  95: "50+20%",
  212: "GET WITH PURCHASE",
}

const kompetitor = [
  // LADIES SHOES
  { brand: "EVERBEST LADIES", alias: "EVERBEST", division: "LADIES SHOES", counter: "4467", de: "2058", transmarco: false },
  { brand: "HUSH PUPPIES LADIES SHOES", alias: "HUSH PUPPIES", division: "LADIES SHOES", counter: "4413", de: "2073", transmarco: true },
  { brand: "BRUNO PREMI LADIES", alias: "BRUNO PREMI", division: "LADIES SHOES", counter: "4477", de: "20194", transmarco: false },
  { brand: "PLAYBOY LADIES", alias: "PLAYBOY", division: "LADIES SHOES", counter: "4475", de: "20173", transmarco: true },
  { brand: "OBERMAIN LADIES SHOES", alias: "OBERMAIN", division: "LADIES SHOES", counter: "4433", de: "20119", transmarco: true },
  { brand: "VIZZANO", alias: "VIZZANO", division: "LADIES SHOES", counter: "4462", de: "20158", transmarco: false },
  { brand: "BEBOB", alias: "BEBOB", division: "LADIES SHOES", counter: "4425", de: "2019", transmarco: false },
  { brand: "EVB LADIES SHOES", alias: "EVB", division: "LADIES SHOES", counter: "4486", de: "", transmarco: false },
  { brand: "CROCODILE LADIES SHOES", alias: "CROCODILE", division: "LADIES SHOES", counter: "4464", de: "20162", transmarco: false },
  { brand: "STEVE & CO LADIES SHOES", alias: "STEVE & CO", division: "LADIES SHOES", counter: "4485", de: "20195", transmarco: false },
  { brand: "LAVIOLLA", alias: "LAVIOLLA", division: "LADIES SHOES", counter: "4474", de: "20170", transmarco: false },
  { brand: "ROHDE ST. BARBARA LDS", alias: "ROHDE", division: "LADIES SHOES", counter: "4412", de: "20139", transmarco: false },
  { brand: "BOSSWAY LADIES", alias: "BOSSWAY", division: "LADIES SHOES", counter: "4415", de: "", transmarco: false },
  { brand: "ELLE LADIES", alias: "ELLE", division: "LADIES SHOES", counter: "4468", de: "2054", transmarco: false },
  { brand: "ESPERANZA", alias: "ESPERANZA", division: "LADIES SHOES", counter: "4405", de: "2055", transmarco: false },
  { brand: "AMANDA", alias: "AMANDA", division: "LADIES SHOES", counter: "4429", de: "2006", transmarco: false },
  { brand: "STUDIO NINE LADIES", alias: "STUDIO NINE", division: "LADIES SHOES", counter: "4402", de: "20149", transmarco: false },
  { brand: "PIERE CARDIN LDS", alias: "PIERRE CARDIN", division: "LADIES SHOES", counter: "4420", de: "20125", transmarco: false },
  // MENS SHOES
  { brand: "CATERPILLAR SHOES", alias: "CATERPILLAR", division: "MEN'S SHOES", counter: "3560", de: "2034", transmarco: true },
  { brand: "OBERMAIN MENS SHOES", alias: "OBERMAIN", division: "MEN'S SHOES", counter: "3520", de: "20118", transmarco: true },
  { brand: "PLAYBOY", alias: "PLAYBOY", division: "MEN'S SHOES", counter: "3504", de: "20129", transmarco: true },
  { brand: "EVERBEST", alias: "EVERBEST", division: "MEN'S SHOES", counter: "3551", de: "2056", transmarco: false },
  { brand: "CROCODILE SHOES MEN'S", alias: "CROCODILE", division: "MEN'S SHOES", counter: "3515", de: "2046", transmarco: false },
  { brand: "PAKALOLO", alias: "PAKALOLO", division: "MEN'S SHOES", counter: "3510", de: "20123", transmarco: false },
  { brand: "BRUNO PREMI", alias: "BRUNO PREMI", division: "MEN'S SHOES", counter: "3563", de: "20179", transmarco: false },
  { brand: "JIM JOKER", alias: "JIM JOKER", division: "MEN'S SHOES", counter: "3565", de: "", transmarco: false },
  { brand: "HUSH PUPPIES MENS SHOES", alias: "HUSH PUPPIES", division: "MEN'S SHOES", counter: "3503", de: "2076", transmarco: false },
  { brand: "GINO MARIANI", alias: "GINO MARIANI", division: "MEN'S SHOES", counter: "3550", de: "", transmarco: false },
  { brand: "ROHDE ST BARBARA MENS", alias: "ROHDE", division: "MEN'S SHOES", counter: "3518", de: "20138", transmarco: false },
  { brand: "PIERRE CARDIN MENS", alias: "PIERRE CARDIN", division: "MEN'S SHOES", counter: "3517", de: "20128", transmarco: false },
  { brand: "TRACCE MEN", alias: "TRACCE", division: "MEN'S SHOES", counter: "3567", de: "", transmarco: false },
  // BAG LADIES
  { brand: "HUSH PUPPIES LDS BAG", alias: "HUSH PUPPIES", division: "BAG LADIES", counter: "4505", de: "2074", transmarco: true },
  { brand: "OBERMAIN LADIES BAGS", alias: "OBERMAIN", division: "BAG LADIES", counter: "4530", de: "20172", transmarco: true },
  { brand: "EVERBEST BAGS", alias: "EVERBEST", division: "BAG LADIES", counter: "4525", de: "2057", transmarco: false },
  { brand: "BELLEZZA", alias: "BELLEZZA", division: "BAG LADIES", counter: "4526", de: "2020", transmarco: false },
  { brand: "EVB BAG LADIES", alias: "EVB", division: "BAG LADIES", counter: "4535", de: "20205", transmarco: false },
  { brand: "HANA HANDBAG", alias: "HANA", division: "BAG LADIES", counter: "4531", de: "", transmarco: false },
  { brand: "ELLE BAGS", alias: "ELLE", division: "BAG LADIES", counter: "4528", de: "2053", transmarco: false },
  { brand: "PIERRE CARDIN LADIES BAG", alias: "PIERRE CARDIN", division: "BAG LADIES", counter: "4533", de: "20202", transmarco: false },
  { brand: "TRACCE BAG LADIES", alias: "TRACCE", division: "BAG LADIES", counter: "4536", de: "", transmarco: false },
  { brand: "BRUNO PREMI LADIES BAG", alias: "BRUNO PREMI", division: "BAG LADIES", counter: "4532", de: "20187", transmarco: false },
  { brand: "LES FEMMES BAG", alias: "LES FEMMES", division: "BAG LADIES", counter: "4510", de: "2093", transmarco: false },
  // BAG MENS
  { brand: "HUSH PUPPIES MENS BAG", alias: "HUSH PUPPIES", division: "BAG MENS", counter: "3525", de: "2077", transmarco: true },
  { brand: "OBERMAIN MENS BAG", alias: "OBERMAIN", division: "BAG MENS", counter: "3524", de: "20120", transmarco: true },
  { brand: "EVERBEST BAGS MENS", alias: "EVERBEST", division: "BAG MENS", counter: "NOTHING", de: "", transmarco: false },
  { brand: "VINEZIA UOMO", alias: "VINEZIA UOMO", division: "BAG MENS", counter: "3615", de: "", transmarco: false },
  { brand: "PIERRE CARDIN BAG MENS", alias: "PIERRE CARDIN", division: "BAG MENS", counter: "3611", de: "", transmarco: false },
  { brand: "CASERINI", alias: "CASERINI", division: "BAG MENS", counter: "3606", de: "", transmarco: false },
  { brand: "SAINT LUCAS", alias: "SAINT LUCAS", division: "BAG MENS", counter: "3627", de: "", transmarco: false },
  { brand: "VALENTINO F", alias: "VALENTINO F", division: "BAG MENS", counter: "3602", de: "", transmarco: false },
  // LADIES APPAREL
  { brand: "HUSH PUPPIES AP LADIES", alias: "HUSH PUPPIES", division: "LADIES APPAREL", counter: "4409", de: "2071", transmarco: true },
  { brand: "LOGO", alias: "LOGO", division: "LADIES APPAREL", counter: "4301", de: "2095", transmarco: false },
  { brand: "NOVEL MICE", alias: "NOVEL MICE", division: "LADIES APPAREL", counter: "4312", de: "20117", transmarco: false },
  { brand: "AKO", alias: "AKO", division: "LADIES APPAREL", counter: "4303", de: "2005", transmarco: false },
  { brand: "C2", alias: "C2", division: "LADIES APPAREL", counter: "4302", de: "2027", transmarco: false },
  { brand: "SHINY APP", alias: "SHINY APP", division: "LADIES APPAREL", counter: "4206", de: "20144", transmarco: false },
  { brand: "ULTRAVIOLET", alias: "ULTRAVIOLET", division: "LADIES APPAREL", counter: "4237", de: "20155", transmarco: false },
  { brand: "3H", alias: "3H", division: "LADIES APPAREL", counter: "4207", de: "2002", transmarco: false },
  { brand: "COME", alias: "COME", division: "LADIES APPAREL", counter: "4236", de: "2038", transmarco: false },
  { brand: "SIMPLICITY", alias: "SIMPLICITY", division: "LADIES APPAREL", counter: "4248", de: "20196", transmarco: false },
  // MENS APPAREL
  { brand: "HUSH PUPPIES AP MENS", alias: "HUSH PUPPIES", division: "MENS APPAREL", counter: "3558", de: "2072", transmarco: true },
  { brand: "OBERMAIN APP MENS", alias: "OBERMAIN", division: "MENS APPAREL", counter: "3237", de: "20163", transmarco: true },
  { brand: "BOMB BOOGIE", alias: "BOMB BOOGIE", division: "MENS APPAREL", counter: "3401", de: "2022", transmarco: false },
  { brand: "CROCODILE APP MEN", alias: "CROCODILE", division: "MENS APPAREL", counter: "3134", de: "2044", transmarco: false },
  { brand: "DF", alias: "D&F", division: "MENS APPAREL", counter: "3405", de: "2048", transmarco: false },
  { brand: "LEGGS CASUAL", alias: "LEGGS CASUAL", division: "MENS APPAREL", counter: "3201", de: "", transmarco: false },
  { brand: "F&P MENS", alias: "F&P", division: "MENS APPAREL", counter: "3248", de: "", transmarco: false },
  { brand: "EMBA JEANS", alias: "EMBA JEANS", division: "MENS APPAREL", counter: "3247", de: "20193", transmarco: false },
  { brand: "EMBA CLASSIC", alias: "EMBA CLASSIC", division: "MENS APPAREL", counter: "3246", de: "20192", transmarco: false },
  { brand: "BRUNO PREMI APP", alias: "BRUNO PREMI", division: "MENS APPAREL", counter: "3243", de: "20190", transmarco: false },
  // LADIES UNDERWEAR
  { brand: "HUSH PUPPIES UWG", alias: "HUSH PUPPIES", division: "LADIES UNDERWARE", counter: "4610", de: "", transmarco: true },
  { brand: "OBERMAIN UWG", alias: "OBERMAIN", division: "LADIES UNDERWARE", counter: "4611", de: "", transmarco: true },
  { brand: "CHRISTINE SISTER", alias: "CHRISTINE", division: "LADIES UNDERWARE", counter: "4603", de: "2047", transmarco: false },
  { brand: "WACOAL", alias: "WACOAL", division: "LADIES UNDERWARE", counter: "4601", de: "20159", transmarco: false },
  { brand: "VENICY", alias: "VENICY", division: "LADIES UNDERWARE", counter: "4602", de: "20157", transmarco: false },
  // MENS UNDERWARE
  { brand: "HUSH PUPPIES UNDERWEAR", alias: "HUSH PUPPIES", division: "MENS UNDERWEAR", counter: "3713", de: "", transmarco: true },
  { brand: "OBERMAIN UW", alias: "OBERMAIN", division: "MENS UNDERWEAR", counter: "3711", de: "", transmarco: true },
  { brand: "PIERE CARDIN UW", alias: "PIERE CARDIN", division: "MENS UNDERWEAR", counter: "3705", de: "", transmarco: false },
  { brand: "BYFORD UW", alias: "BYFORD", division: "MENS UNDERWEAR", counter: "3702", de: "", transmarco: false },
  { brand: "FELIX BUHLER", alias: "FELIX B", division: "MENS UNDERWEAR", counter: "3703", de: "", transmarco: false },
  { brand: "GT MAN", alias: "GT MAN", division: "MENS UNDERWEAR", counter: "3717", de: "", transmarco: false },
  { brand: "GIOVEN CALVIN UW", alias: "GIOVEN CALVIN", division: "MENS UNDERWEAR", counter: "3714", de: "", transmarco: false },
  { brand: "ARROW UW", alias: "ARROW UW", division: "MENS UNDERWEAR", counter: "3715", de: "", transmarco: false },
  { brand: "MUNDO", alias: "MUNDO", division: "MENS UNDERWEAR", counter: "3701", de: "", transmarco: false },
]

export default function Rekapan() {
  const { csv } = useSelector((s) => s.rekapan)

  const [rekapan, setRekapan] = useState([])
  const [filter, setFilter] = useState([])
  const [brands, setBrands] = useState([])

  const [str, setStr] = useState("")
  const [range, setRange] = useState({ start: "", end: "" })

  const dispatch = useDispatch()

  const reportToSTR = (rekapan, sd, ed, em, ey) => {
    const bulan = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"]

    let str = `*KOMPETITOR PERIODE ${sd}-${ed} ${bulan[em - 1]} ${ey}*\n*CITRUS BOTANI*\n`

    const divisons = [...new Set(kompetitor.map((x) => x.division))]

    const lists = kompetitor.map((x) => {
      const arr = rekapan.filter((y) => y.brand === x.brand).map((y) => ({ ...y, promo_code: y.till_code.replace(x.counter, "").replace(x.de, "") }))

      const promo = [...new Set(arr.map((y) => acara[y.promo_code] || null).filter((x) => x))]

      const netto = arr.map((y) => y.netto + y.disc_3).reduce((a, b) => a + b, 0)
      const qty = arr.map((y) => y.qty).reduce((a, b) => a + b, 0)

      return { ...x, netto, qty, promo }
    })

    divisons.forEach((division) => {
      const arr = lists.filter((x) => x.division === division).sort((a, b) => b.netto - a.netto)
      str += `\n*CITRUS BOTANI ${division}*\n`

      arr.forEach((x, i) => {
        const bold = x.transmarco ? "*" : ""
        str += `${String(i + 1).padStart(2, " ")}. ${bold}${x.alias} : ${currrency(x.netto)}/${x.qty}/${x.promo.join(",")}${bold}\n`
      })
    })

    console.log(str)
    setStr(str)
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = (event) => dispatch(setCSV(event.target.result))
      reader.readAsText(file)
    }
  }

  const generate = (csv) => {
    const { brands, data, start, end } = generateRekapan(csv)

    const arr = brands.sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }))
    const range = { start: start.str, end: end.str }

    setBrands(arr)
    setFilter(data)
    setRekapan(data)
    setRange(range)

    reportToSTR(data, start.day, end.day, end.month, end.year)
  }

  useEffect(() => {
    if (csv && csv.includes("Tanggal")) generate(csv)
  }, [csv])

  useEffect(() => {
    if (!range.start) return
    if (!range.end) return

    const [sy, sm, sd] = range.start.split("-").map((x) => parseInt(x))
    const [ey, em, ed] = range.end.split("-").map((x) => parseInt(x))

    const arr = rekapan.filter((x) => x.day >= sd && x.month >= sm && x.year >= sy && x.day <= ed && x.month <= em && x.year <= ey)

    setFilter(arr)
  }, [range])

  return (
    <div className="p-0">
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5 fw-bold px-1" id="staticBackdropLabel">
                SALES REPORTS
              </h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-3">
              <textarea className="form-control" style={{ height: "55vh", fontSize: "0.8rem" }} value={str} onChange={(e) => setStr(e.target.value)} />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="form-group col input-group-sm">
          <label className="col-form-label px-1">Upload Rekapan</label>
          <input type="file" className="form-control" onChange={(e) => handleUpload(e)} />
        </div>
        <div className="d-flex gap-3 mt-3 mb-3">
          <div className="form-group col input-group-sm">
            <label className="col-form-label px-1">Start</label>
            <input type="date" className="form-control" value={range.start} onChange={(e) => setRange((prev) => ({ ...prev, start: e.target.value }))} />
          </div>
          <div className="form-group col input-group-sm">
            <label className="col-form-label px-1">End</label>
            <input type="date" className="form-control" value={range.end} onChange={(e) => setRange((prev) => ({ ...prev, end: e.target.value }))} />
          </div>
        </div>

        <button type="button" class="btn btn-sm btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
          REPORTS
        </button>
      </div>

      <div className="table-responsive p-2 mt-3">
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-start">Brand</th>
              <th className="text-end">Total</th>
              <th className="text-end">Qty</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand, i) => {
              const arr = filter.filter((x) => x.brand === brand)

              const real_netto = arr.map((x) => x.netto + x.disc_3).reduce((a, b) => a + b, 0)
              const qty = arr.map((x) => x.qty).reduce((a, b) => a + b, 0)

              const transmarco = ["HUSH PUPPIES", "OBERMAIN", "PLAYBOY", "CATTERPILAR"].find((x) => brand.includes(x))

              return (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td className={`text-start ${transmarco ? "fw-bold" : ""}`} onClick={() => window.open(`/sales?brand=${brand}`)}>
                    {brand}
                  </td>
                  <td className="text-end text-dark">{currrency(real_netto)}</td>
                  <td className="text-end text-dark fw-bold">{qty}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
