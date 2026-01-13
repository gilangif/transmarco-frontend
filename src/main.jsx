import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./store"

import { ToastContainer } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.min.css"

import "./index.css"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <ToastContainer />
  </Provider>
)
