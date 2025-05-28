import jwt from "jsonwebtoken"

export const verifyToken = async (req, res, next) => {
  try {
    console.log("=== Token Verification Debug ===")
    console.log("Request URL:", req.url)
    console.log("Request method:", req.method)
    console.log("All cookies:", req.cookies)
    console.log("Authorization header:", req.headers.authorization)
    console.log("Raw cookie header:", req.headers.cookie)

    // Try multiple ways to get the token
    let token =
      req.cookies?.access_token ||
      req.cookies?.["access_token"] ||
      (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""))

    // Manual cookie parsing as fallback
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(";")
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=")
        if (name === "access_token") {
          token = decodeURIComponent(value)
          break
        }
      }
    }

    console.log("Token found:", !!token)
    console.log("Token value (first 20 chars):", token ? token.substring(0, 20) + "..." : "None")

    if (!token) {
      console.log("❌ No token provided")
      console.log("Available cookies:", Object.keys(req.cookies || {}))
      console.log("Raw cookie string:", req.headers.cookie)
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
        debug: {
          cookies: Object.keys(req.cookies || {}),
          hasAuthHeader: !!req.headers.authorization,
        },
      })
    }

    console.log("🔍 Token found, verifying with JWT_SECRET...")
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log("❌ Token verification failed:", err.message)
        console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)
        return res.status(403).json({
          success: false,
          message: "Forbidden - Invalid token",
          debug: {
            error: err.message,
            tokenLength: token.length,
          },
        })
      }

      console.log("✅ Token verified successfully!")
      console.log("User ID:", user.id)
      console.log("User isAdmin:", user.isAdmin)
      req.user = user
      next()
    })
  } catch (error) {
    console.error("❌ Token verification error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      debug: {
        error: error.message,
      },
    })
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
