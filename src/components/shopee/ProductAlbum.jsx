export default function ProductAlbum({ images }) {
  return (
    <div className="col-lg-12 p-1 m-0">
      <div className="p-2">
        <div className="row g-1">
          {images?.map((src, src_index) => {
            const source = `https://down-id.img.susercontent.com/file/${src}`

            return (
              <div className="col-4 col-sm-6 col-md-3" key={src}>
                <div className="card h-100">
                  <img src={source} className="card-img-top" alt="img" />
                  <div className="card-body fw-bold m-0 p-2 text-center">
                    <p className="card-text">Photo {src_index + 1}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
