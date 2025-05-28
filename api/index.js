import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"
import listingRouter from "./routes/listing.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import contactRouter from "./routes/contact.route.js"
import debugRouter from "./routes/debug.route.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to load .env from multiple possible locations
const envPaths = [
  path.join(__dirname, ".env"), // api/.env
  path.join(__dirname, "..", ".env"), // root/.env
  path.join(process.cwd(), ".env"), // current working directory
]

let envLoaded = false
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath })
    if (!result.error) {
      console.log(`✅ Environment file loaded from: ${envPath}`)
      envLoaded = true
      break
    }
  } catch (error) {
    // Continue to next path
  }
}

if (!envLoaded) {
  console.log("⚠️  No .env file found, trying default dotenv.config()")
  dotenv.config()
}

// Debug environment variables
console.log("Environment check:")
console.log("NODE_ENV:", process.env.NODE_ENV || "not set")
console.log("MONGO defined:", !!process.env.MONGO)
console.log("PORT:", process.env.PORT || "not set")
console.log("Current working directory:", process.cwd())
console.log("__dirname:", __dirname)

// Validate required environment variables
if (!process.env.MONGO) {
  console.error("❌ ERROR: MONGO environment variable is not defined!")
  console.error("\n📝 Please create a .env file in your project root with:")
  console.error("MONGO=mongodb://localhost:27017/estate-app")
  console.error("JWT_SECRET=your_jwt_secret_here")
  console.error("EMAIL_USERNAME=your_email@gmail.com")
  console.error("EMAIL_PASSWORD=your_email_password")
  console.error("PORT=3000")
  console.error("ADMIN_SECRET_KEY=your_admin_secret")
  console.error("NODE_ENV=development")
  console.error("\n🔍 Checked these locations for .env file:")
  envPaths.forEach((p) => console.error(`  - ${p}`))
  process.exit(1)
}

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("✅ Connected to MongoDB!")
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
  })

const app = express()

app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}!`)
})

app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/listing", listingRouter)
app.use("/api/contact", contactRouter)
app.use("/api/debug", debugRouter)

app.use(express.static(path.join(__dirname, "..", "client", "dist")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"))
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})
