"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Home, CreditCard, BarChart3, Settings, LogOut, CheckSquare } from "lucide-react"
import AdminUsers from "../components/admin/AdminUsers"
import AdminListings from "../components/admin/AdminListings"
import AdminPayments from "../components/admin/AdminPayments"
import AdminReports from "../components/admin/AdminReports"
import AdminSettings from "../components/admin/AdminSettings"
import AdminDashboard from "../components/admin/AdminDashboard"
import AdminListingApprovals from "../components/admin/AdminListingApprovals"
import { updateAdminStatus } from "../redux/user/userSlice"

export default function Admin() {
  const { currentUser } = useSelector((state) => state.user)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (adminCheckComplete) return

      setLoading(true)
      setError(null)

      try {
        if (!currentUser) {
          console.log("No current user, redirecting to sign-in")
          navigate("/sign-in")
          return
        }

        // First check if isAdmin is already in the currentUser object
        if (currentUser.isAdmin === true) {
          console.log("User is admin according to Redux store")
          setIsAdmin(true)
          setLoading(false)
          setAdminCheckComplete(true)
          return
        }

        // If not, make an API call to check
        console.log("Checking admin status for user:", currentUser._id)
        const res = await fetch(`/api/user/check-admin/${currentUser._id}`)

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Failed to check admin status")
        }

        const data = await res.json()
        console.log("Admin check response:", data)

        if (data.isAdmin) {
          setIsAdmin(true)
          // Update Redux store
          dispatch(updateAdminStatus(true))
        } else {
          console.log("User is not an admin, redirecting")
          navigate("/")
        }
      } catch (error) {
        console.error("Error checking admin access:", error)
        setError(error.message)
        navigate("/")
      } finally {
        setLoading(false)
        setAdminCheckComplete(true)
      }
    }

    checkAdminAccess()
  }, [currentUser, navigate, adminCheckComplete, dispatch])

  useEffect(() => {
    // Check for tab parameter in URL
    const params = new URLSearchParams(location.search)
    const tabParam = params.get("tab")
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [location.search])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/admin?tab=${tab}`)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />
      case "users":
        return <AdminUsers />
      case "listings":
        return <AdminListings key="listings" />
      case "approvals":
        return <AdminListingApprovals key="approvals" />
      case "payments":
        return <AdminPayments />
      case "reports":
        return <AdminReports />
      case "settings":
        return <AdminSettings />
      default:
        return <AdminDashboard />
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <button
                onClick={() => handleTabChange("dashboard")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "dashboard"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("users")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "users" ? "bg-slate-100 text-slate-900 font-medium" : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                Users
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("listings")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "listings"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <Home className="mr-3 h-5 w-5" />
                Listings
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("approvals")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "approvals"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <CheckSquare className="mr-3 h-5 w-5" />
                Approvals
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("payments")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "payments"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Payments
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("reports")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "reports"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Reports
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("settings")}
                className={`flex items-center w-full px-4 py-3 ${
                  activeTab === "settings"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </li>
            <li>
              <a href="/" className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-slate-50">
                <LogOut className="mr-3 h-5 w-5" />
                Back to Site
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  )
}
