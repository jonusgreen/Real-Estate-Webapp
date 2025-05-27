import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"
import listingRouter from "./routes/listing.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import cors from "cors"
import { fileURLToPath } from "url"

dotenv.config()

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// CORS Configuration - Single, clean setup
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "http://localhost:3000", // local backend
  "https://exela-realtors-islo.onrender.com", // production frontend
  process.env.FRONTEND_URL, // environment variable fallback
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
)

// Security headers for production
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true")
  if (process.env.NODE_ENV === "production") {
    res.header("Cross-Origin-Embedder-Policy", "cross-origin")
    res.header("Cross-Origin-Opener-Policy", "same-origin")
  }
  next()
})

// Improved MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    // Don't exit the process, just return false to indicate failure
    return false
  }
}

// Connect to MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(cookieParser())

// Add request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} - ${req.method} ${req.path}`)

  // Log cookies for debugging
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    console.log("Cookies received:", Object.keys(req.cookies))
    if (req.cookies.access_token) {
      console.log("Access token present:", req.cookies.access_token ? "Yes" : "No")
    }
  } else {
    console.log("No cookies received")
  }

  next()
})

// Add basic diagnostic route
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    cookies: req.cookies ? Object.keys(req.cookies) : [],
    hasAccessToken: !!req.cookies?.access_token,
  })
})

// API routes
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/listing", listingRouter)

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Serve static files with proper headers
  app.use(
    express.static(path.join(__dirname, "../client/dist"), {
      maxAge: "1y",
      etag: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript")
        }
        if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css")
        }
      },
    }),
  )

  // Handle client-side routing - catch all handler
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"))
  })
} else {
  app.get("/", (req, res) => {
    res.send("API is running...")
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`API Error: ${req.method} ${req.url}`)
  console.error(`Error message: ${err.message}`)
  console.error(err.stack)

  const statusCode = err.statusCode || 500
  const message = err.message || "Internal server error"
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
