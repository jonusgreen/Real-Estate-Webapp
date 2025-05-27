import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://real-estate-webapp-client.onrender.com",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            console.error("Proxy Error:", err.message);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("→ Proxying:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("← Response from Target:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },

  plugins: [react()],

  build: {
    sourcemap: true, // ✅ Enables proper source map resolution
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          swiper: ["swiper"],
          icons: ["react-icons"],
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
    ],
  },
});
