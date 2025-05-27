"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Home, DollarSign, AlertTriangle, Users } from "lucide-react"
import { optimizedFetch } from "../../utils/optimizedFetch"

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

  // Memoize expensive calculations
  const dashboardStats = useMemo(
    () => ({
      totalListings: stats.total,
      totalRevenue: stats.revenue,
      userBreakdown: {
        total: stats.totalUsers,
        admin: stats.adminUsers,
        regular: stats.regularUsers,
      },
      pendingCount: stats.pendingApproval,
    }),
    [stats],
  )

  useEffect(() => {
    if (!currentUser?.isAdmin) {
      navigate("/sign-in")
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel with optimized fetch
        const [statsData, usersData, listingsData] = await Promise.allSettled([
          optimizedFetch("/api/listing/stats", { credentials: "include" }),
          optimizedFetch("/api/user/all", { credentials: "include" }),
          optimizedFetch("/api/listing/recent", { credentials: "include" }),
        ])

        // Process stats data
        if (statsData.status === "fulfilled") {
          const userStats =
            usersData.status === "fulfilled"
              ? {
                  totalUsers: usersData.value.length,
                  adminUsers: usersData.value.filter((user) => user.isAdmin).length,
                  regularUsers: usersData.value.filter((user) => !user.isAdmin).length,
                }
              : { totalUsers: 0, adminUsers: 0, regularUsers: 0 }

          setStats({
            ...statsData.value,
            ...userStats,
          })
        }

        // Process listings data
        if (listingsData.status === "fulfilled") {
          setRecentListings(listingsData.value)
        }

        // Handle any errors
        const errors = [statsData, usersData, listingsData]
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason.message)

        if (errors.length > 0) {
          console.warn("Some data failed to load:", errors)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentUser, navigate])

  const handleApproveListing = async (listingId) => {
    try {
      const res = await optimizedFetch(`/api/listing/approve/${listingId}`, {
        method: "POST",
        credentials: "include",
        cache: false,
      })

      // Update local state immediately for better UX
      setRecentListings((prev) =>
        prev.map((listing) => (listing._id === listingId ? { ...listing, approved: true } : listing)),
      )

      setStats((prev) => ({
        ...prev,
        pendingApproval: Math.max(0, prev.pendingApproval - 1),
      }))
    } catch (error) {
      console.error("Error approving listing:", error)
      setError("Failed to approve listing. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-2xl font-semibold">{dashboardStats.totalListings}</p>
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

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold">${dashboardStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Based on listing prices</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{dashboardStats.userBreakdown.total}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Admins</p>
              <p className="font-medium">{dashboardStats.userBreakdown.admin}</p>
            </div>
            <div>
              <p className="text-gray-500">Regular</p>
              <p className="font-medium">{dashboardStats.userBreakdown.regular}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-semibold">{dashboardStats.pendingCount}</p>
            </div>
          </div>
          <div className="mt-4">
            {dashboardStats.pendingCount > 0 ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/admin?tab=approvals")}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Review pending listings
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No listings pending approval</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/admin?tab=users")}
          className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 text-left transition-colors"
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
          className="bg-green-50 hover:bg-green-100 p-6 rounded-lg border border-green-200 text-left transition-colors"
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
          className="bg-yellow-50 hover:bg-yellow-100 p-6 rounded-lg border border-yellow-200 text-left transition-colors"
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

      {/* Recent Listings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Listings</h2>
          <button
            onClick={() => navigate("/admin?tab=listings")}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
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
                  <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={listing.imageUrls?.[0] || "/placeholder.svg"}
                            alt={listing.name}
                            loading="lazy"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">{listing.address}</div>
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
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          onClick={() => window.open(`/listing/${listing._id}`, "_blank")}
                        >
                          View
                        </button>
                        {!listing.approved && (
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors"
                            onClick={() => handleApproveListing(listing._id)}
                          >
                            Approve
                          </button>
                        )}
                      </div>
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
