import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { persistor, store } from "./redux/store.js"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import axios from 'axios';

// Optimized loading component
const LoadingComponent = () => (
  <div className="flex justify-center items-center h-screen bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
      <p className="text-slate-600 text-lg">Loading EstateApp...</p>
    </div>
  </div>
)

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload logo
  const logoLink = document.createElement("link")
  logoLink.rel = "preload"
  logoLink.href = "/src/assets/logo.png"
  logoLink.as = "image"
  document.head.appendChild(logoLink)
}

  axios.get('https://real-estate-webapp-client.onrender.com')
      .then(response => console.log(response.data))
      .catch(error => console.error('There was an error!', error));

// Initialize preloading
preloadCriticalResources()

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={<LoadingComponent />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
)
