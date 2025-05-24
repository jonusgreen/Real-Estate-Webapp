"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, ChevronDown, ChevronUp } from "lucide-react"

export default function AdminReports() {
  const [dateRange, setDateRange] = useState("last30")
  const [expandedSection, setExpandedSection] = useState("listings")
  const [listingStats, setListingStats] = useState({
    forRent: 0,
    forSale: 0,
    total: 0,
    active: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchListingStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/listing/stats")

        if (!res.ok) {
          throw new Error(`Failed to fetch listing stats: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setListingStats({
          forRent: data.forRent || 0,
          forSale: data.forSale || 0,
          total: data.total || 0,
          active: data.active || 0,
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching listing stats:", error)
        setError("Failed to load listing statistics. Please try again later.")
        setLoading(false)

        // Use fallback data for development
        setListingStats({
          forRent: 86,
          forSale: 42,
          total: 128,
          active: 110,
        })
      }
    }

    fetchListingStats()
  }, [])

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md">
            <select
              className="border-0 rounded-md px-4 py-2"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <div className="px-3 py-2 border-l">
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <Download className="mr-2 h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Listings</h3>
              <p className="text-3xl font-bold mt-2">{listingStats.total}</p>
              <p className="text-sm text-green-600 mt-1">All properties on platform</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
              <p className="text-3xl font-bold mt-2">{listingStats.active}</p>
              <p className="text-sm text-green-600 mt-1">Currently available</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">For Rent</h3>
              <p className="text-3xl font-bold mt-2">{listingStats.forRent}</p>
              <p className="text-sm text-blue-600 mt-1">Rental properties</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">For Sale</h3>
              <p className="text-3xl font-bold mt-2">{listingStats.forSale}</p>
              <p className="text-sm text-purple-600 mt-1">Properties for sale</p>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-6">
            {/* Listings Report */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <button
                className="w-full px-6 py-4 flex justify-between items-center text-left"
                onClick={() => toggleSection("listings")}
              >
                <h3 className="text-lg font-semibold">Listings Report</h3>
                {expandedSection === "listings" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSection === "listings" && (
                <div className="px-6 py-4 border-t">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">For Rent</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listingStats.forRent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listingStats.forRent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {listingStats.total > 0 ? Math.round((listingStats.forRent / listingStats.total) * 100) : 0}
                            %
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">For Sale</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listingStats.forSale}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listingStats.forSale}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {listingStats.total > 0 ? Math.round((listingStats.forSale / listingStats.total) * 100) : 0}
                            %
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* User Activity Report */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <button
                className="w-full px-6 py-4 flex justify-between items-center text-left"
                onClick={() => toggleSection("users")}
              >
                <h3 className="text-lg font-semibold">User Activity Report</h3>
                {expandedSection === "users" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSection === "users" && (
                <div className="px-6 py-4 border-t">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Previous Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            New Registrations
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">145</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">134</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+8.2%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Active Users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">892</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">845</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+5.6%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Premium Subscriptions
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">68</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">52</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+30.8%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Report */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <button
                className="w-full px-6 py-4 flex justify-between items-center text-left"
                onClick={() => toggleSection("revenue")}
              >
                <h3 className="text-lg font-semibold">Revenue Report</h3>
                {expandedSection === "revenue" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSection === "revenue" && (
                <div className="px-6 py-4 border-t">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Previous Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Premium Listings
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$12,450</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$10,890</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+14.3%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Featured Properties
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$8,320</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$7,650</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+8.8%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Subscriptions
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$3,810</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$3,420</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+11.4%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
