"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, UserPlus, Shield, ShieldOff } from "lucide-react"
import { useSelector } from "react-redux"
import UserEditModal from "./UserEditModal"
import AddUserModal from "./AddUserModal"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [processingUserId, setProcessingUserId] = useState(null)

  const { currentUser } = useSelector((state) => state.user)

  useEffect(() => {
    // Only fetch users if we have a current user
    if (currentUser) {
      fetchUsers()
    } else {
      setError("Please sign in to access user management")
      setLoading(false)
    }
  }, [currentUser])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Current user:", currentUser)
      console.log("Fetching users from /api/user/all...")

      const res = await fetch("/api/user/all", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", res.status)
      console.log("Response ok:", res.ok)

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to fetch users: ${res.status} ${res.statusText} - ${errorText}`)
      }

      const data = await res.json()
      console.log(`Fetched ${data.length} users`)
      setUsers(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError(`Failed to load users: ${error.message}`)
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = async (userId) => {
    try {
      const user = users.find((u) => u._id === userId)
      const confirmed = window.confirm(
        `Are you sure you want to delete user "${user?.username}"? This action cannot be undone.`,
      )
      if (!confirmed) return

      setProcessingUserId(userId)
      const res = await fetch(`/api/user/delete/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`)
      }

      setUsers(users.filter((user) => user._id !== userId))
      alert("User deleted successfully")
      setProcessingUserId(null)
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user. Please try again later.")
      setProcessingUserId(null)
    }
  }

  const handleToggleAdminRole = async (userId, currentAdminStatus) => {
    try {
      const user = users.find((u) => u._id === userId)
      const action = currentAdminStatus ? "remove admin privileges from" : "grant admin privileges to"
      const confirmed = window.confirm(`Are you sure you want to ${action} "${user?.username}"?`)
      if (!confirmed) return

      setProcessingUserId(userId)
      const res = await fetch(`/api/user/role/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAdmin: !currentAdminStatus }),
        credentials: "include",
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to update user role: ${res.status} ${res.statusText} - ${errorText}`)
      }

      const updatedUser = await res.json()
      setUsers(users.map((user) => (user._id === userId ? updatedUser : user)))

      const newStatus = updatedUser.isAdmin ? "granted admin privileges" : "removed admin privileges"
      alert(`Successfully ${newStatus} for ${updatedUser.username}`)

      setProcessingUserId(null)
    } catch (error) {
      console.error("Error updating user role:", error)
      setError(`Failed to update user role: ${error.message}`)
      setProcessingUserId(null)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
  }

  const handleSaveUser = (updatedUser) => {
    setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
    setEditingUser(null)
  }

  const handleAddUser = (newUser) => {
    setUsers([newUser, ...users])
    setShowAddModal(false)
    alert(`User "${newUser.username}" created successfully!`)
  }

  // Show sign-in prompt if no current user
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please sign in to access the user management panel.</p>
        <a
          href="/sign-in"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </a>
      </div>
    )
  }

  // Show admin check if user is not admin
  if (currentUser && !currentUser.isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
        <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchUsers}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={fetchUsers} className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
            Retry
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{users.filter((user) => user.isAdmin).length}</div>
          <div className="text-sm text-gray-500">Admin Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{users.filter((user) => !user.isAdmin).length}</div>
          <div className="text-sm text-gray-500">Regular Users</div>
        </div>
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
                  <tr key={user._id} className={processingUserId === user._id ? "opacity-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={
                              user.avatar ||
                              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={user.username}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">ID: {user._id}</div>
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
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleEditUser(user)}
                          disabled={processingUserId === user._id}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className={`${
                            user.isAdmin
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          onClick={() => handleToggleAdminRole(user._id, user.isAdmin)}
                          disabled={processingUserId === user._id}
                          title={user.isAdmin ? "Remove admin privileges" : "Grant admin privileges"}
                        >
                          {user.isAdmin ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={processingUserId === user._id}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />}
    </div>
  )
}
