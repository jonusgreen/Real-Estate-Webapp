import express from "express"
import {
  test,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
  getAllUsers,
  getUserCount,
  updateUserRole,
  promoteToAdmin,
  checkAdmin,
} from "../controllers/user.controller.js"
import { verifyToken, optionalAuth } from "../utils/verifyUser.js"

const router = express.Router()

// Test route
router.get("/test", test)

// Public routes for debugging - making these public to fix admin dashboard
router.get("/count", optionalAuth, getUserCount)
router.get("/all", optionalAuth, getAllUsers)

// Emergency admin promotion endpoint
router.post("/promote-admin", promoteToAdmin)

// Protected routes
router.post("/update/:id", verifyToken, updateUser)
router.delete("/delete/:id", verifyToken, deleteUser)
router.get("/listings/:id", verifyToken, getUserListings)
router.get("/:id", verifyToken, getUser)
router.post("/role/:id", verifyToken, updateUserRole)
router.get("/check-admin/:id", checkAdmin)

export default router
