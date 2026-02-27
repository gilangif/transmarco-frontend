import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { setNavbarTitle } from "../store/config.js"

import axios from "axios"
import JSZip from "jszip"

export default function Photo() {
  const { host } = useSelector((s) => s.config)

  const [search, setSearch] = useState("")
  const [merchant, setMerchant] = useState("lazada")

  const [results, setResults] = useState([])
  const [detail, setDetail] = useState({})

  const dispatch = useDispatch()

  const DEFAULT_IMAGE = "https://usagif.com/wp-content/uploads/2021/4fh5wi/pepefrg-8.gif"

  const generatePhotos = async (url, type) => {
    const toastId = toast.loading("Searching data...")

    try {
      const { data } = await axios.post(host + "/photo/generator", { url, type })

      toast.update(toastId, { render: `Success generate ${data.length} results`, type: "success", isLoading: false, autoClose: 1500, theme: "colored" })

      setResults(data)
      dispatch(setNavbarTitle({ title: "Photo Generator", desc: `Showing ${data.length} media album` }))
    } catch (error) {
      const message = error.msg || error.user_message || error.message || "UNKNOWN ERROR"

      toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 3000, theme: "colored" })
    }
  }

  const handleZIP = async (thumbs, name) => {
    try {
      const zip = new JSZip()

      for (const thumb of thumbs) {
        const { file_url, file_name } = thumb

        const res = await fetch(file_url)
        const blob = await res.blob()

        zip.file(file_name, blob)
      }

      const zipName = `${name ? `${name} ${Date.now()}` : Date.now()}.zip`
      const zipBlob = await zip.generateAsync({ type: "blob" })

      const link = document.createElement("a")

      link.href = URL.createObjectURL(zipBlob)
      link.download = zipName
      link.click()

      URL.revokeObjectURL(link.href)
    } catch (err) {
      toast.error("Failed generate ZIP file")
    }
  }

  const handleBulkZIP = async (lists, name) => {
    try {
      const zip = new JSZip()

      for (const list of lists) {
        const { title, variant, thumbs } = list

        for (const thumb of thumbs) {
          const { file_url, file_name } = thumb

          const res = await fetch(file_url)
          const blob = await res.blob()

          const folderPath = `${title} ${variant}`
          const folder = zip.folder(folderPath)

          folder.file(file_name, blob)
        }
      }

      const zipName = `${name ? `${name} ${Date.now()}` : Date.now()} BULK.zip`
      const zipBlob = await zip.generateAsync({ type: "blob" })

      const link = document.createElement("a")

      link.href = URL.createObjectURL(zipBlob)
      link.download = zipName
      link.click()

      URL.revokeObjectURL(link.href)
    } catch (err) {
      toast.error("Failed generate ZIP file")
    }
  }

  const handleDownload = async (url, filename) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()

      const link = document.createElement("a")

      link.href = URL.createObjectURL(blob)
      link.download = filename.replace(".jpg", `_${Date.now()}.jpeg`)

      document.body.appendChild(link)
      link.click()

      URL.revokeObjectURL(link.href)
      link.remove()
    } catch (err) {
      toast.error(`failed download file ${filename}`)
    }
  }

  const handleBulkDownload = async (thumbs) => {
    for (const thumb of thumbs) {
      const { file_url, file_name } = thumb

      await handleDownload(file_url, file_name)
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const regex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i

    let url = search
    let type = "auto"

    if (regex.test(search)) {
      const { host } = new URL(search)

      if (host === "9to9.co.id") type = "9to9"
      if (host === "www.zalora.co.id") type = "zalora"
      if (host === "hana-collections.com") type = "hana"
      if (host === "hushpuppies.co.id") type = "hush_puppies"

      return generatePhotos(url, type)
    }

    if (merchant === "lazada") url = "https://www.zalora.co.id/search?q=" + search
    if (merchant === "9to9") url = "https://9to9.co.id/search?q=" + search
    if (merchant === "hana") url = "https://hana-collections.com/?s=" + search
    if (merchant === "hush_puppies") url = "https://hushpuppies.co.id/search?q=" + search

    return generatePhotos(url, "auto")
  }

  useEffect(() => {
    document.title = "Photo Generator"

    dispatch(setNavbarTitle({ title: "Photo Generator", desc: "Search product or download product image from URL" }))
  }, [])

  return (
    <>
      <div class="modal fade" id="modal-detail" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">
                {detail.brand} {detail.title} {detail.variant}
              </h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <ul class="list-group mb-3">
                <li class="list-group-item active" aria-current="true">
                  {detail.sku}
                </li>
                <li class="list-group-item">RP. {detail.price}</li>
                <li class="list-group-item">Rp. {detail.netto}</li>
              </ul>
              <textarea className="form-control" value={detail.description} style={{ height: "50vh" }} />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="d-flex gap-3 input-group input-group-sm py-2 mb-4">
            <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Paste URL link or search something.." />

            <button type="button" className="btn btn-sm rounded btn-secondary" onClick={() => setSearch("")}>
              RESET
            </button>
            <button type="submit" className="btn btn-sm rounded btn-success">
              SEARCH
            </button>
          </div>

          <div className="d-flex gap-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" value="lazada" checked={"lazada" === merchant} onChange={(e) => setMerchant(e.target.value)} />
              <label class="form-check-label">Lazada</label>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="radio" value="9to9" checked={"9to9" === merchant} onChange={(e) => setMerchant(e.target.value)} />
              <label class="form-check-label">9to9</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" value="hush_puppies" checked={"hush_puppies" === merchant} onChange={(e) => setMerchant(e.target.value)} />
              <label class="form-check-label">Hush Puppies</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" value="hana" checked={"hana" === merchant} onChange={(e) => setMerchant(e.target.value)} />
              <label class="form-check-label">Hana Bags</label>
            </div>
          </div>
        </form>

        {results.length > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-2 bg-danger py-3 my-3 text-light rounded">
            <div className="px-2">
              <span className="fw-bold">SAVE ALL {results.length} RESULTS</span>
            </div>

            <div className="d-flex gap-4 px-2 mt-2 mt-md-0">
              <span className="fw-bold" type="button" onClick={() => handleBulkDownload(thumbs)}>
                JPEG ALL
              </span>
              <span className="fw-bold" type="button" onClick={() => handleZIP(results.map(({ thumbs }) => thumbs).flat(), `${results[0].title} LAZADA`, false)}>
                ZIP ALL
              </span>
              <span className="fw-bold" type="button" onClick={() => handleBulkZIP(results, `${results[0].title}`, false)}>
                ZIP DIR
              </span>
            </div>
          </div>
        )}

        <div className="d-flex flex-column mt-4">
          {results.map((x, i) => {
            const { url, type, brand, sku, title, variant, description, price, netto, thumbs } = x

            return (
              <div className="">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-2 bg-dark text-light rounded">
                  <div className="px-2">
                    <a href={url} className="text-light text-decoration-none">
                      <span className="fw-bold">
                        {brand} {title} {variant}
                      </span>
                    </a>
                  </div>

                  <div className="d-flex gap-4 px-2 mt-2 mt-md-0">
                    <span className="fw-bold" type="button" onClick={() => handleBulkDownload(thumbs)}>
                      JPEG
                    </span>
                    <span className="fw-bold" type="button" onClick={() => handleZIP(thumbs, `${title} ${variant}`, false)}>
                      ZIP
                    </span>
                    <span className="fw-bold" role="button" data-bs-toggle="modal" data-bs-target="#modal-detail" onClick={() => setDetail(x)}>
                      DETAIL
                    </span>
                  </div>
                </div>

                <div className="row g-1 py-3">
                  {thumbs.map((y, i) => {
                    const { file_url, file_name } = y

                    return (
                      <div className="col-3 col-lg-2 p-1">
                        <img src={file_url || DEFAULT_IMAGE} class="photo-card-img card-img-top rounded border border-1 mb-2" onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)} />
                        <div class="text-center">
                          <p class="m-0 p-0 ">
                            {title} {variant} {i + 1}
                          </p>
                          <a href={file_url} target="_blank" class="mt-2 w-100 btn btn-sm btn-secondary">
                            PREVIEW
                          </a>
                          <a class="mt-2 w-100 btn btn-sm btn-dark" onClick={() => handleDownload(file_url, file_name)}>
                            DOWNLOAD
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
