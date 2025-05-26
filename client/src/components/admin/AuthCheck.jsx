"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"

export default function AuthCheck() {
  const [authStatus, setAuthStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const { currentUser } = useSelector((state) => state.user)

  const checkAuth = async () => {
    setLoading(true)
    try {
      // Test the debug endpoint first
      console.log("Testing debug endpoint...")
      const debugRes = await fetch("/api/auth/debug", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      let debugData = null
      if (debugRes.ok) {
        debugData = await debugRes.json()
        console.log("Debug endpoint response:", debugData)
      } else {
        const debugError = await debugRes.text()
        console.log("Debug endpoint error:", debugError)
        debugData = { error: debugError, status: debugRes.status }
      }

      // Check API status
      const statusRes = await fetch("/api/status", {
        credentials: "include",
      })
      const statusData = await statusRes.json()

      // Try to access the protected route
      const userRes = await fetch("/api/user/all", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      let userError = null
      let userData = null
      if (!userRes.ok) {
        userError = await userRes.text()
      } else {
        userData = await userRes.json()
      }

      setAuthStatus({
        currentUser,
        debugEndpoint: debugData,
        apiStatus: statusData,
        userRequest: {
          status: userRes.status,
          ok: userRes.ok,
          error: userError,
          data: userData ? `${userData.length} users` : null,
        },
        cookies: document.cookie,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setAuthStatus({
        error: error.message,
        currentUser,
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  const forceSignOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        credentials: "include",
      })
      // Clear local storage and reload
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const testCookieEndpoint = async () => {
    try {
      const res = await fetch("/api/auth/debug", {
        credentials: "include",
      })
      const data = await res.json()
      alert(`Cookie Test Result:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      alert(`Cookie Test Error: ${error.message}`)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔍 Authentication Debug</h3>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={checkAuth}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check Auth"}
          </button>
          <button
            onClick={testCookieEndpoint}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Test Cookies
          </button>
          <button onClick={forceSignOut} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
            Force Sign Out
          </button>
        </div>

        {currentUser ? (
          <div className="bg-green-100 p-3 rounded">
            <strong className="text-green-800">✅ Redux User State:</strong>
            <div className="text-sm mt-1">
              <div>ID: {currentUser._id}</div>
              <div>Email: {currentUser.email}</div>
              <div>Admin: {currentUser.isAdmin ? "Yes" : "No"}</div>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 p-3 rounded">
            <strong className="text-red-800">❌ No User in Redux State</strong>
            <div className="text-sm mt-1">You need to sign in first</div>
          </div>
        )}

        {authStatus && (
          <div className="bg-gray-100 p-3 rounded">
            <strong>🔧 Debug Info:</strong>
            <pre className="text-xs mt-2 overflow-auto max-h-60 bg-white p-2 rounded">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
