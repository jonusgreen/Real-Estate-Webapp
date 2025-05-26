"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Home, DollarSign, AlertTriangle, Users } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    forRent: 0,
    forSale: 0,
    pendingApproval: 0,
    revenue: 0,
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  })
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/sign-in")
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch listing stats
        const statsRes = await fetch("/api/listing/stats", {
          credentials: "include",
        })

        if (!statsRes.ok) {
          throw new Error(`Failed to fetch listing stats: ${statsRes.status} ${statsRes.statusText}`)
        }

        const statsData = await statsRes.json()

        // Fetch user count
        const userCountRes = await fetch("/api/user/count", {
          credentials: "include",
        })

        let userStats = { totalUsers: 0, adminUsers: 0, regularUsers: 0 }
        if (userCountRes.ok) {
          const userCountData = await userCountRes.json()

          // Fetch all users to get admin/regular breakdown
          const usersRes = await fetch("/api/user/all", {
            credentials: "include",
          })

          if (usersRes.ok) {
            const usersData = await usersRes.json()
            console.log("Users data:", usersData) // Add debug logging
            userStats = {
              totalUsers: usersData.length,
              adminUsers: usersData.filter((user) => user.isAdmin).length,
              regularUsers: usersData.filter((user) => !user.isAdmin).length,
            }
            console.log("User stats:", userStats) // Add debug logging
          } else {
            console.error("Failed to fetch users:", usersRes.status, usersRes.statusText)
            userStats.totalUsers = userCountData.count || 0
          }
        } else {
          console.error("Failed to fetch user count:", userCountRes.status, userCountRes.statusText)
        }

        setStats({
          ...statsData,
          ...userStats,
        })

        // Fetch recent listings
        const listingsRes = await fetch("/api/listing/recent", {
          credentials: "include",
        })

        if (!listingsRes.ok) {
          throw new Error(`Failed to fetch recent listings: ${listingsRes.status} ${listingsRes.statusText}`)
        }

        const listingsData = await listingsRes.json()
        setRecentListings(listingsData)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }

    fetchDashboardData()
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

      // Update the listing in the list
      setRecentListings(
        recentListings.map((listing) => (listing._id === listingId ? { ...listing, approved: true } : listing)),
      )

      // Update stats
      setStats({
        ...stats,
        pendingApproval: Math.max(0, stats.pendingApproval - 1),
      })
    } catch (error) {
      console.error("Error approving listing:", error)
      setError("Failed to approve listing. Please try again later.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">For Rent</p>
              <p className="font-medium">{stats.forRent}</p>
            </div>
            <div>
              <p className="text-gray-500">For Sale</p>
              <p className="font-medium">{stats.forSale}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold">${stats.revenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Based on listing prices</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Admins</p>
              <p className="font-medium">{stats.adminUsers}</p>
            </div>
            <div>
              <p className="text-gray-500">Regular</p>
              <p className="font-medium">{stats.regularUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-semibold">{stats.pendingApproval}</p>
            </div>
          </div>
          <div className="mt-4">
            {stats.pendingApproval > 0 ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/admin?tab=approvals")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Review pending listings
                </button>
                <button
                  onClick={async () => {
                    try {
                      const confirmed = window.confirm("Are you sure you want to approve all pending listings?")
                      if (!confirmed) return

                      const res = await fetch("/api/listing/bulk-approve", {
                        method: "POST",
                        credentials: "include",
                      })

                      if (!res.ok) {
                        throw new Error(`Failed to bulk approve listings: ${res.status} ${res.statusText}`)
                      }

                      const result = await res.json()
                      alert(`Successfully approved ${result.modifiedCount} listings`)

                      // Refresh the page to update stats
                      window.location.reload()
                    } catch (error) {
                      console.error("Error bulk approving listings:", error)
                      alert("Failed to bulk approve listings. Please try again later.")
                    }
                  }}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve All
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No listings pending approval</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate("/admin?tab=users")}
          className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 text-left transition"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900">Manage Users</h3>
              <p className="text-sm text-blue-700">View and edit user accounts</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin?tab=listings")}
          className="bg-green-50 hover:bg-green-100 p-6 rounded-lg border border-green-200 text-left transition"
        >
          <div className="flex items-center">
            <Home className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-900">Manage Listings</h3>
              <p className="text-sm text-green-700">Review and approve properties</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin?tab=approvals")}
          className="bg-yellow-50 hover:bg-yellow-100 p-6 rounded-lg border border-yellow-200 text-left transition"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-semibold text-yellow-900">Pending Approvals</h3>
              <p className="text-sm text-yellow-700">Review listings awaiting approval</p>
            </div>
          </div>
        </button>
      </div>

      {/* Migration Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Database Migration</h3>
        <p className="text-sm text-yellow-700 mb-4">
          If you're not seeing existing listings, you may need to run a migration to add the approval field to existing
          listings.
        </p>
        <button
          onClick={async () => {
            try {
              const confirmed = window.confirm("This will set all existing listings as approved. Continue?")
              if (!confirmed) return

              const res = await fetch("/api/listing/migrate", {
                method: "POST",
                credentials: "include",
              })

              if (!res.ok) {
                throw new Error(`Migration failed: ${res.status} ${res.statusText}`)
              }

              const result = await res.json()
              alert(`Migration completed successfully. Updated ${result.modifiedCount} listings.`)

              // Refresh the page to update stats
              window.location.reload()
            } catch (error) {
              console.error("Migration error:", error)
              alert("Migration failed. Please try again later.")
            }
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Run Migration
        </button>
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Listings</h2>
          <button onClick={() => navigate("/admin?tab=listings")} className="text-sm text-blue-600 hover:text-blue-800">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentListings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No recent listings found
                  </td>
                </tr>
              ) : (
                recentListings.map((listing) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => window.open(`/listing/${listing._id}`, "_blank")}
                      >
                        View
                      </button>
                      {!listing.approved && (
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleApproveListing(listing._id)}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
