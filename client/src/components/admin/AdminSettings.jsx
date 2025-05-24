"use client"

import { useState } from "react"
import { Save } from "lucide-react"

export default function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Real Time Estate",
    siteDescription: "Find your dream property with Real Time Estate",
    contactEmail: "contact@realtimeestate.com",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Main Street, New York, NY 10001",
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@realtimeestate.com",
    smtpPassword: "••••••••••••",
    senderName: "Real Time Estate",
    senderEmail: "notifications@realtimeestate.com",
  })

  const [paymentSettings, setPaymentSettings] = useState({
    currency: "USD",
    paypalClientId: "••••••••••••••••••••••••••",
    stripePublicKey: "pk_••••••••••••••••••••••••••",
    stripeSecretKey: "sk_••••••••••••••••••••••••••",
  })

  const handleGeneralChange = (e) => {
    setGeneralSettings({
      ...generalSettings,
      [e.target.name]: e.target.value,
    })
  }

  const handleEmailChange = (e) => {
    setEmailSettings({
      ...emailSettings,
      [e.target.name]: e.target.value,
    })
  }

  const handlePaymentChange = (e) => {
    setPaymentSettings({
      ...paymentSettings,
      [e.target.name]: e.target.value,
    })
  }

  const handleGeneralSubmit = (e) => {
    e.preventDefault()
    // In a real implementation, you would call your API to save the settings
    alert("General settings saved successfully!")
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    // In a real implementation, you would call your API to save the settings
    alert("Email settings saved successfully!")
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    // In a real implementation, you would call your API to save the settings
    alert("Payment settings saved successfully!")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <form onSubmit={handleGeneralSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={generalSettings.phoneNumber}
                  onChange={handleGeneralChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <textarea
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows="3"
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                ></textarea>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Email Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Email Settings</h2>
          <form onSubmit={handleEmailSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
                <input
                  type="text"
                  name="smtpServer"
                  value={emailSettings.smtpServer}
                  onChange={handleEmailChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <input
                  type="text"
                  name="smtpPort"
                  value={emailSettings.smtpPort}
                  onChange={handleEmailChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                <input
                  type="text"
                  name="smtpUsername"
                  value={emailSettings.smtpUsername}
                  onChange={handleEmailChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                <input
                  type="password"
                  name="smtpPassword"
                  value={emailSettings.smtpPassword}
                  onChange={handleEmailChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={emailSettings.senderName}
                  onChange={handleEmailChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={emailSettings.senderEmail}
                  onChange={handleEmailChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={paymentSettings.currency}
                  onChange={handlePaymentChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                >
                  <option value="USD">USD - UGX</option>
                  <option value="EUR">EUR - US Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Client ID</label>
                <input
                  type="password"
                  name="paypalClientId"
                  value={paymentSettings.paypalClientId}
                  onChange={handlePaymentChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Public Key</label>
                <input
                  type="password"
                  name="stripePublicKey"
                  value={paymentSettings.stripePublicKey}
                  onChange={handlePaymentChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                <input
                  type="password"
                  name="stripeSecretKey"
                  value={paymentSettings.stripeSecretKey}
                  onChange={handlePaymentChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
