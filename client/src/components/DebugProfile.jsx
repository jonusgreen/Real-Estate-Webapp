"use client"

import { useSelector } from "react-redux"
import { useState } from "react"

function DebugProfile() {
  const { currentUser } = useSelector((state) => state.user)
  const [testResult, setTestResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setTestResult("Testing...")

    try {
      console.log("Testing API with user:", currentUser)

      // Test 1: Basic API connection
      const testResponse = await fetch("/api/user/test", {
        credentials: "include",
      })
      console.log("Test API response:", testResponse.status)

      // Test 2: User listings endpoint
      if (currentUser?._id) {
        const listingsResponse = await fetch(`/api/user/listings/${currentUser._id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Listings API response status:", listingsResponse.status)
        console.log("Listings API response headers:", listingsResponse.headers)

        const responseText = await listingsResponse.text()
        console.log("Raw response:", responseText)

        try {
          const data = JSON.parse(responseText)
          console.log("Parsed data:", data)
          setTestResult(`Success! Found ${data.length || 0} listings. Check console for details.`)
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          setTestResult(`Error: Invalid JSON response. Status: ${listingsResponse.status}`)
        }
      } else {
        setTestResult("Error: No current user found")
      }
    } catch (error) {
      console.error("API test error:", error)
      setTestResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg m-4">
      <h3 className="font-bold text-lg mb-2">Debug Profile Issues</h3>
      <p className="mb-2">Current User ID: {currentUser?._id || "Not logged in"}</p>
      <p className="mb-2">Current User: {currentUser?.username || "None"}</p>

      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test API Connection"}
      </button>

      {testResult && (
        <div className="mt-4 p-2 bg-white border rounded">
          <strong>Result:</strong> {testResult}
        </div>
      )}
    </div>
  )
}

export default DebugProfile
