"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash, Eye, CheckCircle, Plus, Check } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import ListingEditModal from "./ListingEditModal"

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterApproval, setFilterApproval] = useState("all")
  const [error, setError] = useState(null)
  const [editingListing, setEditingListing] = useState(null)
  const [bulkApproving, setBulkApproving] = useState(false)
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/sign-in")
      return
    }

    // Fetch listings based on filter
    const fetchListings = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching listings for admin dashboard...")

        // Build the query URL
        let url = "/api/listing/get"
        const params = new URLSearchParams()

        // Only add approval filter if it's not "all"
        if (filterApproval !== "all") {
          params.append("approved", filterApproval === "approved" ? "true" : "false")
        }

        // Add the params to the URL if there are any
        if (params.toString()) {
          url += `?${params.toString()}`
        }

        console.log(`Fetching listings with URL: ${url}`)

        const res = await fetch(url, {
          credentials: "include",
        })

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch listings: ${res.status} ${res.statusText} - ${errorText}`)
        }

        const data = await res.json()

        // Handle both formats - array or object with listings property
        const listingsData = Array.isArray(data) ? data : data.listings || []

        console.log(`Fetched ${listingsData.length} listings`)
        setListings(listingsData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching listings:", error)
        setError(`Failed to load listings: ${error.message}`)
        setLoading(false)
      }
    }

    fetchListings()
  }, [currentUser, navigate, filterApproval])

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || listing.type === filterType

    return matchesSearch && matchesType
  })

  const handleDeleteListing = async (listingId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this listing?")
      if (!confirmed) return

      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to delete listing: ${res.status} ${res.statusText}`)
      }

      // Remove the deleted listing from the list
      setListings(listings.filter((listing) => listing._id !== listingId))
    } catch (error) {
      console.error("Error deleting listing:", error)
      setError("Failed to delete listing. Please try again later.")
    }
  }

  const handleApproveListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/approve/${listingId}`, {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to approve listing: ${res.status} ${res.statusText}`)
      }

      // Update the listing in the list
      setListings(listings.map((listing) => (listing._id === listingId ? { ...listing, approved: true } : listing)))
    } catch (error) {
      console.error("Error approving listing:", error)
      setError("Failed to approve listing. Please try again later.")
    }
  }

  const handleBulkApprove = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to approve all pending listings?")
      if (!confirmed) return

      setBulkApproving(true)
      const res = await fetch("/api/listing/bulk-approve", {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to bulk approve listings: ${res.status} ${res.statusText}`)
      }

      const result = await res.json()

      // Update all listings to be approved
      setListings(listings.map((listing) => ({ ...listing, approved: true })))

      alert(`Successfully approved ${result.modifiedCount} listings`)
      setBulkApproving(false)
    } catch (error) {
      console.error("Error bulk approving listings:", error)
      setError("Failed to bulk approve listings. Please try again later.")
      setBulkApproving(false)
    }
  }

  const handleCreateListing = () => {
    navigate("/create-listing")
  }

  const pendingCount = listings.filter((listing) => !listing.approved).length

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Listings</h1>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={bulkApproving}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              <Check className="mr-2 h-5 w-5" />
              {bulkApproving ? "Approving..." : `Approve All (${pendingCount})`}
            </button>
          )}
          <button
            onClick={handleCreateListing}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Listing
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search listings..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="border rounded-md px-3 py-2"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>

        <select
          className="border rounded-md px-3 py-2"
          value={filterApproval}
          onChange={(e) => setFilterApproval(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Approval</option>
        </select>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
          <div className="text-sm text-gray-500">Total Listings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {listings.filter((listing) => listing.approved).length}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-500">Pending Approval</div>
        </div>
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No listings found
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={
                              listing.imageUrls?.[0] ||
                              "https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={listing.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                          <div className="text-sm text-gray-500">{listing.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          listing.type === "rent" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {listing.type === "rent" ? "For Rent" : "For Sale"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {listing.type === "rent"
                        ? `$${listing.regularPrice}/month`
                        : `$${listing.regularPrice?.toLocaleString() || 0}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {listing.approved ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => window.open(`/listing/${listing._id}`, "_blank")}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => setEditingListing(listing)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {!listing.approved && (
                        <button
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => handleApproveListing(listing._id)}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteListing(listing._id)}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingListing && (
        <ListingEditModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSave={(updatedListing) => {
            setListings(listings.map((listing) => (listing._id === updatedListing._id ? updatedListing : listing)))
            setEditingListing(null)
          }}
        />
      )}
    </div>
  )
}
