import express from "express"
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  getListingStats,
  getRecentListings,
  approveListing,
  rejectListing,
  bulkApproveListings,
} from "../controllers/listing.controller.js"
import { verifyToken, optionalAuth } from "../utils/verifyUser.js"

const router = express.Router()

// Public routes - no authentication required
router.get("/get", optionalAuth, getListings)
router.get("/get/:id", getListing)

// Stats routes - optional authentication for debugging
router.get("/stats", optionalAuth, getListingStats)
router.get("/recent", optionalAuth, getRecentListings)

// Protected routes - authentication required
router.post("/create", verifyToken, createListing)
router.delete("/delete/:id", verifyToken, deleteListing)
router.post("/update/:id", verifyToken, updateListing)

// Admin routes
router.post("/approve/:id", verifyToken, approveListing)
router.post("/reject/:id", verifyToken, rejectListing)
router.post("/bulk-approve", verifyToken, bulkApproveListings)

export default router
