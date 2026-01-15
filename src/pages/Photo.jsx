import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import axios from "axios"
import JSZip from "jszip"

export default function Photo() {
  const { host } = useSelector((s) => s.config)

  const [value, setValue] = useState("")
  const [query, setQuery] = useState([])
  const [photos, setPhotos] = useState([])

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

      const message = `Success generate ${data.length} media album with total ${data.flat().length} photo.`

      toast.success(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
      setPhotos(data)
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

  return (
    <>
      <div className="container py-2">
        <form onSubmit={(e) => generatePhotos(e)}>
          <div className="d-flex flex-column justify-content-center align-items-center py-3">
            <div className="alert alert-success" role="alert">
              <h4 className="alert-heading">IMAGE DOWNLOADER</h4>
              <p className="fw-bold">ZALORA, HUSH PUPPIES, AND 9TO9 WEBSITE SUPPORTED, THIS SITE CREATED AND DEVELOPED BY GILANG IF.</p>
              {value && (
                <>
                  <hr />
                  <p className="mb-0">
                    Show {photos.flat().length} photo from {photos.length} result by search "{value}"
                  </p>
                </>
              )}

              {photos.length > 1 && (
                <div className="d-flex flex-column gap-2 py-1 my-3">
                  <button type="button" className="btn btn-sm btn-danger w-100 p-3" onClick={() => downloadImageBulk(photos.flat())}>
                    SAVE ALL {photos.flat().length} PHOTO AS JPEG
                  </button>
                  <button type="button" className="btn btn-sm btn-success w-100 p-3" onClick={() => downloadZip(photos, `BULK ${query.toUpperCase()} ${Date.now()}.zip`, true)}>
                    SAVE ALL {photos.flat().length} PHOTO AS ZIP
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="py-3">
            <input type="text" className="form-control" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste URL link or search something from zalora website" />
          </div>

          <div className="d-flex gap-3 justify-content-end">
            <button type="button" className="btn btn-danger" onClick={() => setValue("")}>
              RESET
            </button>
            <button type="submit" className="btn btn-primary">
              SEARCH
            </button>
          </div>
        </form>
      </div>

      <div className="py-3">
        {photos.map((media, i) => {
          const title = `${media[0]?.title} ${media[0]?.variant}`
          const zipname = `BULK ${title} ${media[0]?.merchant} ${Date.now()}.zip`

          return (
            <div className="container py-3" key={i}>
              <div className="d-flex py-4">
                <div className="d-flex w-100 align-items-center">
                  <h1>
                    <Link className="text-light" to={media[0]?.source} target="_blank">
                      {title}
                    </Link>
                  </h1>
                </div>
                <div className="d-flex gap-4 px-1">
                  <button className="btn btn-sm btn-light text-dark fw-bold px-2 rounded-circle" style={{ scale: "1.2", aspectRatio: "1/1" }} onClick={() => downloadImageBulk(media)}>
                    <span className="material-symbols-outlined">save_as</span>
                  </button>
                  <button className="btn btn-sm btn-danger text-light fw-bold px-2 rounded-circle" style={{ scale: "1.2", aspectRatio: "1/1" }} onClick={() => downloadZip(media, zipname, false)}>
                    <span className="material-symbols-outlined">folder_zip</span>
                  </button>
                </div>
              </div>
              <div className="row p-1 m-0 bg-light rounded" key={i}>
                {media.map((photo, idx) => (
                  <div className="col-6 col-lg-3 p-1 rounded" key={idx}>
                    <div className="card h-100 nocursor border border-1">
                      <div className="img-hover-wrapper">
                        <img src={photo.url} className="card-img-top" alt={photo.file} />

                        <div className="img-overlay nocursor">
                          <p>ESTIMATE TIME</p>
                          <p>{photo.file}</p>
                          <p>{photo.merchant}</p>
                        </div>
                      </div>

                      <div className="card-body p-2 text-center">
                        <h6 className="card-title fw-bold my-1">
                          {photo.title} {photo.variant} {i + 1}
                        </h6>
                      </div>

                      <div className="p-1">
                        <a className="btn btn-success btn-sm fw-bold w-100" type="button" onClick={() => downloadImage(photo.url, photo.file)}>
                          DOWNLOAD
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
