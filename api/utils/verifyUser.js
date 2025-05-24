//For verifying a user before updating any of the CRUD
import { errorHandler } from "./error.js"
import jwt from "jsonwebtoken"

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token

    if (!token) {
      console.log("No token provided")
      return next(errorHandler(401, "Unauthorized - No token provided"))
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log("Token verification failed:", err.message)
        return next(errorHandler(403, "Forbidden - Invalid token"))
      }

      console.log("Token verified for user:", user.id)
      req.user = user
      next()
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return next(errorHandler(500, "Internal server error during authentication"))
  }
}

// Add a middleware that doesn't require authentication for certain admin routes
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token
    if (!token) {
      console.log("No token provided for optional auth, continuing as unauthenticated")
      req.user = null
      return next()
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log("Optional auth token invalid, continuing as unauthenticated")
        req.user = null
      } else {
        console.log("Optional auth token verified for user:", user.id)
        req.user = user
      }
      next()
    })
  } catch (error) {
    console.error("Optional auth error:", error)
    req.user = null
    next()
  }
}
