"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateAdminStatus } from "../redux/user/userSlice"

export default function ForceAdmin() {
  const { currentUser } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in")
    }
  }, [currentUser, navigate])

  const handleForceAdmin = async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      // Update Redux store directly
      dispatch(updateAdminStatus(true))

      // Also update in database for persistence
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAdmin: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to update admin status")
      }

      setSuccess(true)

      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate("/admin")
      }, 2000)
    } catch (error) {
      console.error("Error forcing admin status:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-center">Admin Access</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">This page will force update your admin status in both the Redux store and the database.</p>

        {currentUser && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p>
              <strong>User:</strong> {currentUser.username}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Current Admin Status:</strong> {currentUser.isAdmin ? "Yes" : "No"}
            </p>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
            Admin status updated successfully! Redirecting to admin dashboard...
          </div>
        )}

        <button
          onClick={handleForceAdmin}
          disabled={loading || success}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Force Admin Status"}
        </button>
      </div>
    </div>
  )
}
