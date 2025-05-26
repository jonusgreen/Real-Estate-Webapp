"use client"

import { useState } from "react"
import { useSelector } from "react-redux"

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const { currentUser } = useSelector((state) => state.user)

  const checkAuthStatus = async () => {
    setLoading(true)
    try {
      // Check API status
      const statusRes = await fetch("/api/status", {
        credentials: "include",
      })
      const statusData = await statusRes.json()

      // Try to fetch users
      const usersRes = await fetch("/api/user/all", {
        credentials: "include",
      })

      let usersData = null
      let usersError = null

      if (usersRes.ok) {
        usersData = await usersRes.json()
      } else {
        usersError = await usersRes.text()
      }

      setDebugInfo({
        currentUser,
        apiStatus: statusData,
        usersResponse: {
          ok: usersRes.ok,
          status: usersRes.status,
          data: usersData,
          error: usersError,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        currentUser,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>

      <div className="space-y-4">
        <div>
          <strong>Current User:</strong>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">{JSON.stringify(currentUser, null, 2)}</pre>
        </div>

        <button
          onClick={checkAuthStatus}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Auth Status"}
        </button>

        {debugInfo && (
          <div>
            <strong>Debug Info:</strong>
            <pre className="bg-white p-2 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
