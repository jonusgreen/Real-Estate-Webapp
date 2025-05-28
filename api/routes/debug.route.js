import express from "express"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

// Test route that doesn't require authentication
router.get("/test", (req, res) => {
  res.json({ message: "Debug API is working!" })
})

// Test route that requires authentication
router.get("/auth-test", verifyToken, (req, res) => {
  res.json({
    message: "Authentication is working!",
    user: req.user,
  })
})

// Test route to check if cookies are being sent
router.get("/cookie-test", (req, res) => {
  res.json({
    message: "Cookie test",
    cookiesReceived: !!req.headers.cookie,
    cookieHeader: req.headers.cookie,
  })
})

export default router
