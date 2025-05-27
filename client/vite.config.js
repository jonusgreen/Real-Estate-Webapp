import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        secure: false,
        changeOrigin: true,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err)
          })
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url)
          })
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  plugins: [react()],
  build: {
    // Disable sourcemaps in production to fix the error
    sourcemap: false,
    // Optimize build for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          swiper: ["swiper"],
          firebase: ["firebase"],
        },
      },
    },
    // Enable compression and optimization
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize assets
    assetsDir: "assets",
    // Better error handling
    reportCompressedSize: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@reduxjs/toolkit", "react-redux"],
    exclude: ["@vitejs/plugin-react"],
  },
  // Better error handling
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
})
