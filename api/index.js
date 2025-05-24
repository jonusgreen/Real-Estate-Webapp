import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"
import listingRouter from "./routes/listing.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
dotenv.config()

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Add basic diagnostic route
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    database: mongoose.connection.readyState === 1 ? "connected to MongoDB" : "disconnected",
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/listing", listingRouter)

// Serve static assets if in production. Must come after routes.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")))
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
