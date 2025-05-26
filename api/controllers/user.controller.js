import bcryptjs from "bcryptjs"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import Listing from "../models/listing.model.js"
import dotenv from "dotenv"

dotenv.config()

export const test = (req, res) => {
  res.json({
    message: "API route is working!",
  })
}

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only update your own account!"))
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10)
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true },
    )

    const { password, ...rest } = updatedUser._doc

    res.status(200).json(rest)
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  // Allow admin to delete any user, or user to delete their own account
  const isAdmin = req.user.isAdmin
  const isOwnAccount = req.user.id === req.params.id

  if (!isAdmin && !isOwnAccount) {
    return next(errorHandler(401, "You can only delete your own account!"))
  }

  try {
    await User.findByIdAndDelete(req.params.id)

    // Only clear cookie if deleting own account
    if (isOwnAccount) {
      res.clearCookie("access_token")
    }

    res.status(200).json("User has been deleted!")
  } catch (error) {
    next(error)
  }
}

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id })
      res.status(200).json(listings)
    } catch (error) {
      next(error)
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings!"))
  }
}

export const getUser = async (req, res, next) => {
  try {
    console.log("getUser called with ID:", req.params.id)

    // Validate that the ID is a valid ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid ObjectId format:", req.params.id)
      return next(errorHandler(400, "Invalid user ID format"))
    }

    const user = await User.findById(req.params.id)

    if (!user) return next(errorHandler(404, "User not found!"))

    const { password: pass, ...rest } = user._doc

    res.status(200).json(rest)
  } catch (error) {
    console.error("Error in getUser:", error)
    next(error)
  }
}

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    console.log("getAllUsers called")
    console.log("Request user:", req.user)

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found")
      return next(errorHandler(401, "Authentication required"))
    }

    // Get current user and check admin status
    const currentUser = await User.findById(req.user.id)
    console.log("Current user found:", currentUser ? "Yes" : "No", "isAdmin:", currentUser?.isAdmin)

    if (!currentUser) {
      console.log("Current user not found in database")
      return next(errorHandler(404, "User not found"))
    }

    if (!currentUser.isAdmin) {
      console.log("User is not admin")
      return next(errorHandler(403, "Admin access required"))
    }

    // Fetch all users excluding passwords
    const users = await User.find({}).select("-password").sort({ createdAt: -1 })
    console.log(`Found ${users.length} users`)

    res.status(200).json(users)
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    next(error)
  }
}

// Get user count (admin only)
export const getUserCount = async (req, res, next) => {
  try {
    console.log("getUserCount called")

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found")
      return next(errorHandler(401, "Authentication required"))
    }

    // Get current user and check admin status
    const currentUser = await User.findById(req.user.id)
    console.log("Current user found:", currentUser ? "Yes" : "No", "isAdmin:", currentUser?.isAdmin)

    if (!currentUser) {
      console.log("Current user not found in database")
      return next(errorHandler(404, "User not found"))
    }

    if (!currentUser.isAdmin) {
      console.log("User is not admin")
      return next(errorHandler(403, "Admin access required"))
    }

    const count = await User.countDocuments()
    console.log(`Total user count: ${count}`)

    res.status(200).json({ count })
  } catch (error) {
    console.error("Error in getUserCount:", error)
    next(error)
  }
}

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    console.log("updateUserRole called")

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found")
      return next(errorHandler(401, "Authentication required"))
    }

    // Get current user and check admin status
    const adminUser = await User.findById(req.user.id)
    console.log("Admin user found:", adminUser ? "Yes" : "No", "isAdmin:", adminUser?.isAdmin)

    if (!adminUser) {
      console.log("Admin user not found in database")
      return next(errorHandler(404, "User not found"))
    }

    if (!adminUser.isAdmin) {
      console.log("User is not admin")
      return next(errorHandler(403, "Admin access required"))
    }

    const { isAdmin } = req.body

    if (typeof isAdmin !== "boolean") {
      return next(errorHandler(400, "isAdmin must be a boolean value"))
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { isAdmin } }, { new: true }).select(
      "-password",
    )

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    console.log(`User ${updatedUser.username} role updated to admin: ${isAdmin}`)
    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    next(error)
  }
}

// Add a direct admin promotion endpoint for emergency access
export const promoteToAdmin = async (req, res, next) => {
  try {
    const { email, secretKey } = req.body

    // Verify the secret key matches the environment variable
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return next(errorHandler(403, "Invalid secret key"))
    }

    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    // Update the user to be an admin
    user.isAdmin = true
    await user.save()

    res.status(200).json({ message: "User promoted to admin successfully" })
  } catch (error) {
    console.error("Error in promoteToAdmin:", error)
    next(error)
  }
}

// Check if a user is an admin
export const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.params.id

    // Validate that the ID is a valid ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid ObjectId format:", userId)
      return next(errorHandler(400, "Invalid user ID format"))
    }

    const user = await User.findById(userId)

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    res.status(200).json({ isAdmin: !!user.isAdmin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    next(error)
  }
}
