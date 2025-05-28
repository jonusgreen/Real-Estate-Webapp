"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import OAuth from "../components/OAuth"
import { useEffect } from "react"
import FacebookAuth from "../components/FacebookAuth"

function SignUp() {
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [phoneValue, setPhoneValue] = useState("")
  const navigate = useNavigate()

  /************************    PHONE FORMATTING FUNCTION **********************/
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "")

    // Uganda phone number formatting
    if (phoneNumber.length === 0) return ""
    if (phoneNumber.startsWith("256")) {
      // International format: +256 XXX XXX XXX
      if (phoneNumber.length <= 3) return `+${phoneNumber}`
      if (phoneNumber.length <= 6) return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`
      if (phoneNumber.length <= 9)
        return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`
      return `+${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)} ${phoneNumber.slice(9, 12)}`
    } else if (phoneNumber.startsWith("0")) {
      // Local format: 0XXX XXX XXX
      if (phoneNumber.length <= 4) return phoneNumber
      if (phoneNumber.length <= 7) return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 10)}`
    } else {
      // Assume local without leading 0
      if (phoneNumber.length <= 3) return phoneNumber
      if (phoneNumber.length <= 6) return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)}`
    }
  }

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "")

    if (!cleanPhone) return { isValid: true, error: "" } // Optional field

    // Uganda phone number validation
    // Format 1: +256XXXXXXXXX (12 digits total)
    // Format 2: 0XXXXXXXXX (10 digits starting with 0)
    // Format 3: XXXXXXXXX (9 digits without country code or leading 0)

    if (cleanPhone.startsWith("256")) {
      // International format
      if (cleanPhone.length !== 12) {
        return { isValid: false, error: "Uganda phone number with +256 must be 12 digits total" }
      }
      // Check if the number after 256 is valid (should start with 7, 3, or 4)
      const localPart = cleanPhone.slice(3)
      if (!/^[734]\d{8}$/.test(localPart)) {
        return { isValid: false, error: "Please enter a valid Uganda phone number" }
      }
    } else if (cleanPhone.startsWith("0")) {
      // Local format with leading 0
      if (cleanPhone.length !== 10) {
        return { isValid: false, error: "Uganda phone number starting with 0 must be 10 digits" }
      }
      // Check if valid Uganda mobile number (07XX, 03XX, 04XX)
      if (!/^0[734]\d{8}$/.test(cleanPhone)) {
        return { isValid: false, error: "Please enter a valid Uganda phone number" }
      }
    } else {
      // Local format without leading 0
      if (cleanPhone.length !== 9) {
        return { isValid: false, error: "Uganda phone number must be 9 digits" }
      }
      // Check if valid Uganda mobile number (7XX, 3XX, 4XX)
      if (!/^[734]\d{8}$/.test(cleanPhone)) {
        return { isValid: false, error: "Please enter a valid Uganda phone number" }
      }
    }

    return { isValid: true, error: "" }
  }

  /************************    HANDLE CHANGE FUNCTION **********************/
  const handleChange = (e) => {
    const { id, value } = e.target

    if (id === "phone") {
      // Format the phone number for display
      const formattedPhone = formatPhoneNumber(value)
      setPhoneValue(formattedPhone)

      // Validate the phone number
      const validation = validatePhoneNumber(value)
      setPhoneError(validation.error)

      // Store clean phone number (digits only) in form data
      const cleanPhone = value.replace(/\D/g, "")
      setFormData({
        ...formData,
        phone: cleanPhone || undefined, // Don't store empty string
      })
      return
    }

    setFormData({
      ...formData,
      [id]: value,
    })
  }

  /*************************    HANDLE SUBMIT FUNCTION **************************************/
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check for phone validation errors
    if (phoneError) {
      setError("Please fix the phone number error before submitting.")
      return
    }

    // Validate all required fields
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all required fields.")
      return
    }

    // Encourage phone number but don't require it
    if (!formData.phone) {
      const addPhone = window.confirm(
        "Adding a phone number helps potential tenants contact you more easily. Would you like to add one now?",
      )
      if (addPhone) {
        document.getElementById("phone").focus()
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Submitting form data:", formData)

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Server response:", data)

      if (data.success === false) {
        setLoading(false)
        setError(data.message)
        return
      }

      setLoading(false)
      setError(null)

      // Show success message and redirect
      alert("Account created successfully! You can now sign in.")
      navigate("/sign-in")
    } catch (error) {
      setLoading(false)
      setError("Network error. Please check your connection and try again.")
      console.error("Signup error:", error)
    }
  }

  /****************************    SETTIMEOUT USEEFFECT   **********************************/
  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null)
    }, 8000)

    return () => clearTimeout(timer)
  }, [error])

  /*****************************  RETURN UI     ****************************************/
  return (
    <div className="p-3 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-lg mt-10 shadow-lg">
        <h1 className="text-2xl text-center font-semibold my-7 text-slate-600">Create Your Account</h1>

        {/* Benefits section */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">📱 Why add your phone number?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Get contacted faster by potential tenants</li>
            <li>• Enable WhatsApp messaging for quick responses</li>
            <li>• Build trust with verified contact information</li>
            <li>• Increase your listing response rates by 40%</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="username"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="email"
            onChange={handleChange}
            required
          />

          {/* Enhanced phone number section */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone Number (e.g., +256 700 123 456 or 0700 123 456)"
                className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 ${
                  phoneError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                id="phone"
                value={phoneValue}
                onChange={handleChange}
                maxLength={17} // +256 XXX XXX XXX
              />
              {formData.phone && !phoneError && <div className="absolute right-3 top-3 text-green-500 text-lg">✓</div>}
            </div>

            {phoneError && (
              <div className="flex items-center text-red-500 text-sm">
                <span className="mr-1">⚠️</span>
                <span>{phoneError}</span>
              </div>
            )}

            {!phoneError && formData.phone && (
              <div className="flex items-center text-green-600 text-sm">
                <span className="mr-1">✓</span>
                <span>Great! Tenants can now call or WhatsApp you</span>
              </div>
            )}

            <p className="text-gray-500 text-xs">
              Format: +256 XXX XXX XXX or 0XXX XXX XXX • Helps tenants contact you quickly
            </p>
          </div>

          <input
            type="password"
            placeholder="Password (minimum 6 characters)"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="password"
            onChange={handleChange}
            required
            minLength={6}
          />

          <button
            disabled={loading || phoneError}
            className="bg-slate-500 text-white p-3 rounded-lg uppercase hover:opacity-90 disabled:opacity-80 transition-opacity"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="flex flex-col gap-4 mt-4">
            <OAuth />
            <FacebookAuth />
          </div>
        </form>

        <div className="flex gap-2 mt-5 justify-center">
          <span className="text-gray-600">Already have an account?</span>
          <Link to="/sign-in">
            <span className="text-blue-700 hover:underline">Sign in</span>
          </Link>
        </div>

        {error && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            {error.includes("Email already exists") && (
              <div className="mt-2">
                <Link
                  to="/sign-in"
                  className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center"
                >
                  → Sign in to your existing account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SignUp
