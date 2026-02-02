import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { setNavbarTitle } from "../store/config.js"

import axios from "axios"
import JSZip from "jszip"

export default function Photo() {
  const { host } = useSelector((s) => s.config)

  const [value, setValue] = useState("")
  const [query, setQuery] = useState([])
  const [photos, setPhotos] = useState([])

  const dispatch = useDispatch()

  const generatePhotos = async (e) => {
    try {
      e.preventDefault()

      let target = value.trim()

      if (!target) return

      const arr = ["HUSHPUPPIES", "9TO9", "ZALORA"]
      const find = arr.find((x) => target.toUpperCase().includes(x))

      if (!find) target = "https://www.zalora.co.id/search?q=" + target.replace(/\s+/g, "+")

      const url = new URL(target)
      const query = url.searchParams.get("q")

      if (query) setQuery(query)

      const { data } = await axios.post(host + "/tools/photo", { target })

      const photos = data.flat()
      const message = `Success generate ${data.length} media album with total ${photos.length} photo.`

      toast.success(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })

      setPhotos(data)
      dispatch(setNavbarTitle({ title: "Photo Generator", desc: `Showing ${data.length} media album with ${photos.length} photos` }))
    } catch (error) {
      const message = error.msg || error.user_message || error.message || "UNKNOWN ERROR"
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    }
  }

  const downloadImage = async (url, filename) => {
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

  const downloadImageBulk = async (media) => {
    for (const { url, file } of media) {
      await downloadImage(url, file)
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  const downloadZip = async (files, zipName = "images.zip", bulk) => {
    try {
      const zip = new JSZip()

      if (bulk) {
        for (const x of files) {
          for (const y of x) {
            const { title, variant, url, desc, file } = y

            const res = await fetch(url)
            const blob = await res.blob()

            const folderPath = `${title} ${variant}`
            const folder = zip.folder(folderPath)

            folder.file(file, blob)
          }
        }
      } else {
        for (const file of files) {
          const res = await fetch(file.url)
          const blob = await res.blob()

          zip.file(file.file, blob)
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")

      link.href = URL.createObjectURL(zipBlob)
      link.download = zipName
      link.click()

      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error(err)
      alert("Gagal membuat ZIP")
    }
  }

  useEffect(() => {
    dispatch(setNavbarTitle({ title: "Photo Generator", desc: "Search product or download product image from URL" }))
  }, [])

  return (
    <>
      <div className="p-2">
        <form onSubmit={(e) => generatePhotos(e)}>
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div className="alert alert-success w-100" role="alert">
              <h4 className="alert-heading mb-2">Image Downloader by Gilang IF</h4>

              {value && (
                <>
                  <hr />
                  <p className="fw-bold mb-2">
                    Show {photos.flat().length} photo from {photos.length} result by search "{value}"
                  </p>
                </>
              )}

              {photos.length > 1 && (
                <div className="d-flex flex-column gap-2 py-1">
                  <button type="button" className="btn btn-sm btn-secondary w-100 p-2" onClick={() => downloadImageBulk(photos.flat())}>
                    SAVE ALL {photos.flat().length} PHOTO AS JPEG
                  </button>
                  <button type="button" className="btn btn-sm btn-success w-100 p-2" onClick={() => downloadZip(photos, `BULK ${query.toUpperCase()} ${Date.now()}.zip`, true)}>
                    SAVE ALL {photos.flat().length} PHOTO AS ZIP
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="py-2 mb-3">
            <input type="text" className="form-control" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste URL link or search something from zalora website" />
          </div>

          <div className="d-flex gap-3 justify-content-end">
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setValue("")}>
              RESET
            </button>
            <button type="submit" className="btn btn-sm btn-success">
              SEARCH
            </button>
          </div>
        </form>
      </div>

      <div className="gap-3 d-flex flex-column mt-4">
        {photos.map((media, i) => {
          const title = `${media[0]?.title} ${media[0]?.variant}`
          const zipname = `BULK ${title} ${media[0]?.merchant} ${Date.now()}.zip`

          return (
            <div className="p-2" key={i}>
              <div className="d-flex gap-1 bg-dark rounded p-0 mb-2">
                <div className="col p-2">
                  <Link className="text-decoration-none fw-bold" to={media[0]?.source} target="_blank">
                    <h6 className="text-light fw-bold mt-2 px-1">{title}</h6>
                  </Link>
                </div>
                <div className="d-flex gap-3 p-2">
                  <button type="button" className="btn btn-sm text-light fw-bold" onClick={() => downloadImageBulk(media)}>
                    JPEG
                  </button>
                  <button type="button" className="btn btn-sm text-light fw-bold" onClick={() => downloadZip(media, zipname, false)}>
                    ZIP
                  </button>
                </div>
              </div>

              <div className="row p-0 m-0 bg-light text-dark" key={i}>
                {media.map((photo, idx) => {
                  const name = `${photo.title} ${photo.variant} ${i + 1}`

                  return (
                    <div className="col-4 col-lg-3 p-1 rounded" key={idx}>
                      <div className="card h-100 nocursor border border-1">
                        <img src={photo.url} className="card-img-top" alt={photo.file} />

                        <div className="card-body p-2 text-center">
                          <span className="card-title fw-bold my-1">{name.trim()}</span>
                        </div>

                        <div className="p-1">
                          <a className="btn btn-dark btn-sm fw-bold w-100" type="button" onClick={() => downloadImage(photo.url, photo.file)}>
                            DOWNLOAD
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
