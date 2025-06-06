import Listing from "../models/listing.model.js"
import { errorHandler } from "../utils/error.js"

export const createListing = async (req, res, next) => {
  try {
    // Validate required fields
    const requiredFields = ["name", "description", "address", "regularPrice", "imageUrls"]
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required` })
      }
    }

    // Ensure imageUrls is not empty
    if (!req.body.imageUrls || req.body.imageUrls.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" })
    }

    // Create the listing (default approved to false unless user is admin)
    const isAdmin = req.user && req.user.isAdmin
    const listing = await Listing.create({
      ...req.body,
      approved: isAdmin ? true : false, // Auto-approve if admin is creating the listing
      userRef: req.user.id, // Ensure userRef is set to the current user
      approvedAt: isAdmin ? new Date() : null,
      approvedBy: isAdmin ? req.user.id : null,
    })

    console.log(`Listing created: ${listing.name}, Type: ${listing.type}, Approved: ${listing.approved}`)
    return res.status(201).json(listing)
  } catch (error) {
    console.error("Error creating listing:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ success: false, message: messages.join(", ") })
    }
    next(error)
  }
}

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    // Allow admin to delete any listing
    if (req.user && req.user.id !== listing.userRef && !req.user.isAdmin) {
      return next(errorHandler(401, "You can only delete your own listings!"))
    }

    await Listing.findByIdAndDelete(req.params.id)
    console.log(`Listing deleted: ${req.params.id}`)
    res.status(200).json({ success: true, message: "Listing has been deleted" })
  } catch (error) {
    console.error("Error deleting listing:", error)
    next(error)
  }
}

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    // Allow admin to update any listing
    if (req.user && req.user.id !== listing.userRef && !req.user.isAdmin) {
      return next(errorHandler(401, "You can only update your own listings!"))
    }

    // If a non-admin is updating, don't allow them to change the approved status
    if (!req.user.isAdmin && req.body.hasOwnProperty("approved")) {
      delete req.body.approved
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true })
    console.log(`Listing updated: ${updatedListing.name}, Type: ${updatedListing.type}`)
    res.status(200).json(updatedListing)
  } catch (error) {
    console.error("Error updating listing:", error)
    next(error)
  }
}

export const getListing = async (req, res, next) => {
  try {
    console.log(`Fetching listing with ID: ${req.params.id}`)
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }
    res.status(200).json(listing)
  } catch (error) {
    console.error(`Error fetching listing: ${error.message}`)
    next(error)
  }
}

export const getListings = async (req, res, next) => {
  try {
    console.log("Fetching listings with query:", req.query)
    console.log("User in request:", req.user ? `ID: ${req.user.id}, Admin: ${req.user.isAdmin}` : "No user")

    const limit = Number.parseInt(req.query.limit) || 9
    const startIndex = Number.parseInt(req.query.startIndex) || 0

    // Build query object
    const query = {}

    // Handle approval status based on user type and request
    if (req.user && req.user.isAdmin) {
      // Admin users can see all listings by default
      console.log("Admin user - respecting query parameters")

      // If admin specifically requests approved=true or approved=false, respect that
      if (req.query.approved !== undefined) {
        query.approved = req.query.approved === "true"
        console.log(`Admin filtering by approval status: ${query.approved}`)
      }
    } else if (req.query.userRef) {
      // Users can see all their own listings regardless of approval status
      query.userRef = req.query.userRef
      console.log("User viewing their own listings - showing all")
    } else {
      // For public queries (non-admin, not viewing own listings), only show approved
      query.approved = true
      console.log("Public query - showing only approved listings")
    }

    // Handle other filters
    if (req.query.offer === "true") {
      query.offer = true
    }

    if (req.query.furnished === "true") {
      query.furnished = true
    }

    if (req.query.parking === "true") {
      query.parking = true
    }

    // Fix the type filtering - ensure exact match
    if (req.query.type && req.query.type !== "all") {
      query.type = req.query.type
      console.log(`Filtering by type: ${req.query.type}`)
    }

    if (req.query.searchTerm) {
      query.name = { $regex: req.query.searchTerm, $options: "i" }
    }

    console.log("Final MongoDB query:", JSON.stringify(query))

    // Determine sort order
    const sort = {}
    if (req.query.sort) {
      const sortField = req.query.sort || "createdAt"
      const sortOrder = req.query.order === "asc" ? 1 : -1
      sort[sortField] = sortOrder
    } else {
      sort.createdAt = -1
    }

    const listings = await Listing.find(query).sort(sort).limit(limit).skip(startIndex)
    const total = await Listing.countDocuments(query)

    console.log(`Found ${listings.length} listings out of ${total} total`)
    console.log(
      `Listings types found:`,
      listings.map((l) => `${l.name}: ${l.type}`),
    )

    return res.status(200).json(listings)
  } catch (error) {
    console.error(`Error fetching listings: ${error.message}`)
    next(error)
  }
}

// Approve a listing (admin only)
export const approveListing = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Only administrators can approve listings"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user.id,
        rejectionReason: null, // Clear any previous rejection reason
      },
      { new: true },
    )

    console.log(`Listing approved: ${updatedListing.name} by admin ${req.user.id}`)
    res.status(200).json(updatedListing)
  } catch (error) {
    console.error("Error approving listing:", error)
    next(error)
  }
}

// Reject a listing (admin only)
export const rejectListing = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Only administrators can reject listings"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const { reason } = req.body

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        approved: false,
        rejectionReason: reason || "Rejected by administrator",
        approvedAt: null,
        approvedBy: null,
      },
      { new: true },
    )

    console.log(`Listing rejected: ${updatedListing.name} by admin ${req.user.id}`)
    res.status(200).json(updatedListing)
  } catch (error) {
    console.error("Error rejecting listing:", error)
    next(error)
  }
}

// Bulk approve all listings (admin only)
export const bulkApproveListings = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Only administrators can bulk approve listings"))
    }

    const result = await Listing.updateMany(
      { approved: { $ne: true } },
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user.id,
        rejectionReason: null,
      },
    )

    console.log(`Bulk approved ${result.modifiedCount} listings by admin ${req.user.id}`)
    res.status(200).json({
      message: `Successfully approved ${result.modifiedCount} listings`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error bulk approving listings:", error)
    next(error)
  }
}

export const getListingStats = async (req, res, next) => {
  try {
    console.log("Getting listing stats")

    const total = await Listing.countDocuments()
    const active = await Listing.countDocuments({ approved: true })
    const forRent = await Listing.countDocuments({ type: "rent", approved: true })
    const forSale = await Listing.countDocuments({ type: "sale", approved: true })
    const pendingApproval = await Listing.countDocuments({ approved: false })

    const revenueData = await Listing.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: null,
          total: { $sum: "$regularPrice" },
        },
      },
    ])

    const revenue = revenueData.length > 0 ? revenueData[0].total : 0

    console.log(
      `Stats - Total: ${total}, Active: ${active}, For Rent: ${forRent}, For Sale: ${forSale}, Pending: ${pendingApproval}`,
    )

    res.status(200).json({
      total,
      active,
      forRent,
      forSale,
      pendingApproval,
      revenue,
    })
  } catch (error) {
    console.error("Error in getListingStats:", error)
    next(error)
  }
}

export const getRecentListings = async (req, res, next) => {
  try {
    console.log("Getting recent listings")

    const query = req.user && req.user.isAdmin ? {} : { approved: true }
    const recentListings = await Listing.find(query).sort({ createdAt: -1 }).limit(5)

    console.log(`Found ${recentListings.length} recent listings`)
    res.status(200).json(recentListings)
  } catch (error) {
    console.error("Error in getRecentListings:", error)
    next(error)
  }
}
