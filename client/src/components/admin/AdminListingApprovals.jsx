"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Eye } from "lucide-react"

export default function AdminListingApprovals() {
  const [pendingListings, setPendingListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectingId, setRejectingId] = useState(null)
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/sign-in")
      return
    }

    // Fetch pending listings
    const fetchPendingListings = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching pending listings...")
        const res = await fetch("/api/listing/get?approved=false", {
          credentials: "include",
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch pending listings: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        console.log("Pending listings response:", data)

        // Handle both array and object responses
        if (Array.isArray(data)) {
          setPendingListings(data)
        } else if (data.listings && Array.isArray(data.listings)) {
          setPendingListings(data.listings)
        } else {
          setPendingListings([])
          console.warn("Unexpected response format:", data)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching pending listings:", error)
        setError("Failed to load pending listings. Please try again later.")
        setLoading(false)
      }
    }

    fetchPendingListings()
  }, [currentUser, navigate])

  const handleApproveListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/approve/${listingId}`, {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to approve listing: ${res.status} ${res.statusText}`)
      }

      // Remove the approved listing from the list
      setPendingListings(pendingListings.filter((listing) => listing._id !== listingId))
    } catch (error) {
      console.error("Error approving listing:", error)
      setError("Failed to approve listing. Please try again later.")
    }
  }

  const handleRejectListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/reject/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to reject listing: ${res.status} ${res.statusText}`)
      }

      // Reset rejection state
      setRejectionReason("")
      setRejectingId(null)

      // Remove the rejected listing from the list
      setPendingListings(pendingListings.filter((listing) => listing._id !== listingId))
    } catch (error) {
      console.error("Error rejecting listing:", error)
      setError("Failed to reject listing. Please try again later.")
    }
  }

  const handleBulkApprove = async () => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to approve all ${pendingListings.length} pending listings?`,
      )
      if (!confirmed) return

      const res = await fetch("/api/listing/bulk-approve", {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to bulk approve listings: ${res.status} ${res.statusText}`)
      }

      // Clear the pending listings
      setPendingListings([])
    } catch (error) {
      console.error("Error bulk approving listings:", error)
      setError("Failed to bulk approve listings. Please try again later.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  if (pendingListings.length === 0) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        No listings pending approval.
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        {pendingListings.length > 0 && (
          <button
            onClick={handleBulkApprove}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Approve All ({pendingListings.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingListings.map((listing) => (
          <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={listing.imageUrls[0] || "/placeholder.svg"}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                  Pending
                </span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{listing.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{listing.address}</p>
              <p className="text-gray-800 font-bold mb-2">
                ${listing.regularPrice.toLocaleString()}
                {listing.type === "rent" && " / month"}
              </p>
              <div className="text-sm text-gray-600 mb-4">
                <p>
                  {listing.bedrooms} {listing.bedrooms > 1 ? "beds" : "bed"} · {listing.bathrooms}{" "}
                  {listing.bathrooms > 1 ? "baths" : "bath"}
                </p>
                <p>
                  {listing.furnished ? "Furnished" : "Not furnished"} · {listing.parking ? "Parking" : "No parking"}
                </p>
              </div>

              {rejectingId === listing._id ? (
                <div className="mt-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="w-full p-2 border rounded-md mb-2"
                    rows={2}
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleRejectListing(listing._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => setRejectingId(null)}
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => window.open(`/listing/${listing._id}`, "_blank")}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-5 w-5 mr-1" />
                    View
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveListing(listing._id)}
                      className="flex items-center text-green-600 hover:text-green-800"
                    >
                      <CheckCircle className="h-5 w-5 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(listing._id)}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <XCircle className="h-5 w-5 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
