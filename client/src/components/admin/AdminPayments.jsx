"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye } from "lucide-react"

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    // Fetch payments
    const fetchPayments = async () => {
      try {
        // In a real implementation, you would fetch this data from your API
        // For now, we'll use placeholder data
        setPayments([
          {
            _id: "1",
            userId: "user123",
            username: "John Doe",
            amount: 49.99,
            paymentMethod: "Credit Card",
            status: "completed",
            date: "2023-05-15",
            description: "Premium Listing Fee",
          },
          {
            _id: "2",
            userId: "user456",
            username: "Jane Smith",
            amount: 99.99,
            paymentMethod: "PayPal",
            status: "completed",
            date: "2023-05-10",
            description: "Featured Listing - 30 days",
          },
          {
            _id: "3",
            userId: "user789",
            username: "Robert Johnson",
            amount: 29.99,
            paymentMethod: "Credit Card",
            status: "pending",
            date: "2023-05-18",
            description: "Basic Listing Fee",
          },
          {
            _id: "4",
            userId: "user101",
            username: "Sarah Williams",
            amount: 149.99,
            paymentMethod: "Bank Transfer",
            status: "failed",
            date: "2023-05-12",
            description: "Annual Subscription",
          },
        ])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching payments:", error)
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || payment.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Download className="mr-2 h-5 w-5" />
          Export
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search payments..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="text-center py-4">Loading payments...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{payment._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.username}</div>
                    <div className="text-sm text-gray-500">ID: {payment.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        payment.status,
                      )}`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
