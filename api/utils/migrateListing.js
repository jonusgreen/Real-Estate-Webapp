import Listing from "../models/listing.model.js"

// Migration script to add approved field to existing listings
export const migrateListings = async () => {
  try {
    console.log("Starting listing migration...")

    // Update all listings that don't have the approved field
    const result = await Listing.updateMany(
      { approved: { $exists: false } },
      { $set: { approved: true } }, // Set existing listings as approved by default
    )

    console.log(`Migration completed. Updated ${result.modifiedCount} listings.`)
    return result
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  }
}
