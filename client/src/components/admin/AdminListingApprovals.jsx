"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Eye, Clock, User } from "lucide-react"

export default function AdminListingApprovals() {
  const [pendingListings, setPendingListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectingId, setRejectingId] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/sign-in")
      return
    }

    fetchPendingListings()
  }, [currentUser, navigate])

  // Helper function to make authenticated requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1]

    console.log("Making authenticated request to:", url)
    console.log("Token found:", !!token)
    console.log("Current user:", currentUser?.email, "Admin:", currentUser?.isAdmin)

    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(url, { ...defaultOptions, ...options })

    console.log("Response status:", response.status)

    if (response.status === 401) {
      console.error("Authentication failed - token may be expired")
      setError("Authentication failed. Please refresh the page or log in again.")
      throw new Error("Authentication failed. Please refresh the page or log in again.")
    }

    return response
  }

  const fetchPendingListings = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching pending listings...")
      const res = await makeAuthenticatedRequest("/api/listing/get?approved=false")

      if (!res.ok) {
        throw new Error(`Failed to fetch pending listings: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      console.log("Pending listings response:", data)

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

  const handleApproveListing = async (listingId) => {
    try {
      setProcessingId(listingId)
      setError(null)

      console.log("Approving listing:", listingId)
      const res = await makeAuthenticatedRequest(`/api/listing/approve/${listingId}`, {
        method: "POST",
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Approve failed:", res.status, errorText)
        throw new Error(`Failed to approve listing: ${res.status} ${res.statusText}`)
      }

      const approvedListing = await res.json()
      console.log("Listing approved successfully:", approvedListing)

      // Remove the approved listing from the list
      setPendingListings((prevListings) => prevListings.filter((listing) => listing._id !== listingId))

      // Show success message
      alert(`Listing "${approvedListing.name}" has been approved and is now live!`)

      setProcessingId(null)
    } catch (error) {
      console.error("Error approving listing:", error)
      setError(`Failed to approve listing: ${error.message}`)
      setProcessingId(null)
    }
  }

  const handleRejectListing = async (listingId) => {
    try {
      setProcessingId(listingId)
      setError(null)

      console.log("Rejecting listing:", listingId)
      const res = await makeAuthenticatedRequest(`/api/listing/reject/${listingId}`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Reject failed:", res.status, errorText)
        throw new Error(`Failed to reject listing: ${res.status} ${res.statusText}`)
      }

      const rejectedListing = await res.json()
      console.log("Listing rejected successfully:", rejectedListing)

      // Reset rejection state
      setRejectionReason("")
      setRejectingId(null)

      // Remove the rejected listing from the list
      setPendingListings((prevListings) => prevListings.filter((listing) => listing._id !== listingId))

      // Show success message
      alert(`Listing "${rejectedListing.name}" has been rejected.`)

      setProcessingId(null)
    } catch (error) {
      console.error("Error rejecting listing:", error)
      setError(`Failed to reject listing: ${error.message}`)
      setProcessingId(null)
    }
  }

  const handleBulkApprove = async () => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to approve all ${pendingListings.length} pending listings? This will make them live on the website.`,
      )
      if (!confirmed) return

      setLoading(true)
      setError(null)

      console.log("Starting bulk approve...")
      const res = await makeAuthenticatedRequest("/api/listing/bulk-approve", {
        method: "POST",
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Bulk approve failed:", res.status, errorText)
        throw new Error(`Failed to bulk approve listings: ${res.status} ${res.statusText}`)
      }

      const result = await res.json()
      console.log("Bulk approval result:", result)

      // Clear the pending listings
      setPendingListings([])

      // Show success message
      alert(`Successfully approved ${result.modifiedCount} listings! They are now live on the website.`)

      setLoading(false)
    } catch (error) {
      console.error("Error bulk approving listings:", error)
      setError(`Failed to bulk approve listings: ${error.message}`)
      setLoading(false)
    }
  }

  const handleRefreshAuth = () => {
    window.location.reload()
  }

  // Add authentication check component
  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please log in to access admin features.
        </div>
        <button
          onClick={() => navigate("/sign-in")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    )
  }

  if (!currentUser.isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Access denied. Admin privileges required.
        </div>
        <button onClick={() => navigate("/")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Go to Home
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <div className="mt-2 flex gap-2">
          <button onClick={fetchPendingListings} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
            Retry
          </button>
          <button onClick={handleRefreshAuth} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (pendingListings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            No listings pending approval. All listings are up to date!
          </div>
        </div>
        <button onClick={fetchPendingListings} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">
            {pendingListings.length} listing{pendingListings.length !== 1 ? "s" : ""} waiting for approval
          </p>
        </div>
        {pendingListings.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={fetchPendingListings}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={handleBulkApprove}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Approve All ({pendingListings.length})
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingListings.map((listing) => (
          <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden border">
            <div className="relative h-48">
              <img
                src={listing.imageUrls[0] || "/placeholder.svg"}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </span>
              </div>
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    listing.type === "rent" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {listing.type === "rent" ? "For Rent" : "For Sale"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 line-clamp-1">{listing.name}</h2>
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">{listing.address}</p>
              <p className="text-gray-800 font-bold mb-2">
                ${listing.regularPrice.toLocaleString()}
                {listing.type === "rent" && " / month"}
              </p>
              <div className="text-sm text-gray-600 mb-3">
                <p>
                  {listing.bedrooms} {listing.bedrooms > 1 ? "beds" : "bed"} · {listing.bathrooms}{" "}
                  {listing.bathrooms > 1 ? "baths" : "bath"}
                </p>
                <p className="flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  Submitted: {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>

              {rejectingId === listing._id ? (
                <div className="mt-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="w-full p-2 border rounded-md mb-2 text-sm"
                    rows={2}
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleRejectListing(listing._id)}
                      disabled={processingId === listing._id}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {processingId === listing._id ? "Rejecting..." : "Confirm Reject"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null)
                        setRejectionReason("")
                      }}
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
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveListing(listing._id)}
                      disabled={processingId === listing._id}
                      className="flex items-center text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {processingId === listing._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => setRejectingId(listing._id)}
                      disabled={processingId === listing._id}
                      className="flex items-center text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
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
