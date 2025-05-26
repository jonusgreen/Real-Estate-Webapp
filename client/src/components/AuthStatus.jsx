"use client"

import { useSelector } from "react-redux"
import { useState } from "react"

export default function AuthStatus() {
  const { currentUser } = useSelector((state) => state.user)
  const [authTest, setAuthTest] = useState(null)
  const [testing, setTesting] = useState(false)

  const testAuth = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/auth/test", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setAuthTest({
        status: response.status,
        data: data,
        cookies: document.cookie,
      })
    } catch (error) {
      setAuthTest({
        error: error.message,
        cookies: document.cookie,
      })
    }
    setTesting(false)
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Authentication Debug</h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Redux User:</strong> {currentUser ? "✅ Logged in" : "❌ Not logged in"}
        </div>

        {currentUser && (
          <div>
            <strong>User ID:</strong> {currentUser._id}
            <br />
            <strong>Email:</strong> {currentUser.email}
            <br />
            <strong>Admin:</strong> {currentUser.isAdmin ? "✅ Yes" : "❌ No"}
          </div>
        )}

        <div>
          <strong>Browser Cookies:</strong> {document.cookie || "None"}
        </div>

        <button
          onClick={testAuth}
          disabled={testing}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? "Testing..." : "Test Auth API"}
        </button>

        {authTest && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <strong>API Test Result:</strong>
            <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(authTest, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
