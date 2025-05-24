"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"
import UserEditModal from "./UserEditModal"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching users...")
        const res = await fetch("/api/user/all")

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch users: ${res.status} ${res.statusText} - ${errorText}`)
        }

        const data = await res.json()
        console.log(`Fetched ${data.length} users`)
        setUsers(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Failed to load users. Please try again later.")
        setLoading(false)

        // Use fallback data for development
        setUsers([
          {
            _id: "1",
            username: "johndoe",
            email: "john@example.com",
            avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            createdAt: "2023-01-15",
            isAdmin: false,
          },
          {
            _id: "2",
            username: "janedoe",
            email: "jane@example.com",
            avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            createdAt: "2023-02-20",
            isAdmin: true,
          },
        ])
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = async (userId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this user?")
      if (!confirmed) return

      const res = await fetch(`/api/user/delete/${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`)
      }

      setUsers(users.filter((user) => user._id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user. Please try again later.")
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
  }

  const handleSaveUser = (updatedUser) => {
    setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
    setEditingUser(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          <UserPlus className="mr-2 h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Database Status Check */}
      <div className="mb-6">
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/status")
              const data = await res.json()
              alert(`API Status: ${data.status}\nDatabase: ${data.database}\nTimestamp: ${data.timestamp}`)
            } catch (error) {
              alert(`Error checking status: ${error.message}`)
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Database Connection
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={
                              user.avatar ||
                              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" ||
                              "/placeholder.svg"
                            }
                            alt={user.username}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAdmin ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteUser(user._id)}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
    </div>
  )
}
