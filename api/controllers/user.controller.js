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
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account!"))
  }
  try {
    await User.findByIdAndDelete(req.params.id)
    res.clearCookie("access_token")
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
    const user = await User.findById(req.params.id)

    if (!user) return next(errorHandler(404, "User not found!"))

    const { password: pass, ...rest } = user._doc

    res.status(200).json(rest)
  } catch (error) {
    next(error)
  }
}

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user && req.user.id) {
      const currentUser = await User.findById(req.user.id)
      if (!currentUser || !currentUser.isAdmin) {
        console.log("Non-admin attempted to access getAllUsers")
        return next(errorHandler(403, "Admin access required"))
      }
    } else {
      console.log("Unauthenticated access attempt to getAllUsers")
      return next(errorHandler(401, "Authentication required"))
    }

    const users = await User.find({}, { password: 0 })
    res.status(200).json(users)
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    next(error)
  }
}

// Get user count (admin only)
export const getUserCount = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user && req.user.id) {
      const currentUser = await User.findById(req.user.id)
      if (!currentUser || !currentUser.isAdmin) {
        console.log("Non-admin attempted to access getUserCount")
        return next(errorHandler(403, "Admin access required"))
      }
    } else {
      console.log("Unauthenticated access attempt to getUserCount")
      return next(errorHandler(401, "Authentication required"))
    }

    const count = await User.countDocuments()
    res.status(200).json({ count })
  } catch (error) {
    console.error("Error in getUserCount:", error)
    next(error)
  }
}

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user && req.user.id) {
      const adminUser = await User.findById(req.user.id)
      if (!adminUser || !adminUser.isAdmin) {
        console.log("Non-admin attempted to update user role")
        return next(errorHandler(403, "Admin access required"))
      }
    } else {
      console.log("Unauthenticated access attempt to update user role")
      return next(errorHandler(401, "Authentication required"))
    }

    const { isAdmin } = req.body

    if (typeof isAdmin !== "boolean") {
      return next(errorHandler(400, "isAdmin must be a boolean value"))
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { isAdmin } }, { new: true })

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    const { password, ...rest } = updatedUser._doc
    res.status(200).json(rest)
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
