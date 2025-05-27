"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Edit, Trash2, UserPlus, Shield, ShieldOff, RefreshCw } from "lucide-react"
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
  const [refreshing, setRefreshing] = useState(false)

  const { currentUser } = useSelector((state) => state.user)

  // Memoized filtered users for better performance
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    const term = searchTerm.toLowerCase()
    return users.filter(
      (user) => user.username?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term),
    )
  }, [users, searchTerm])

  // Memoized stats for better performance
  const userStats = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((user) => user.isAdmin).length,
      regular: users.filter((user) => !user.isAdmin).length,
    }),
    [users],
  )

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers()
    } else if (currentUser) {
      setError("Admin access required")
      setLoading(false)
    } else {
      setError("Please sign in to access user management")
      setLoading(false)
    }
  }, [currentUser])

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const res = await fetch("/api/user/all", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      setUsers(data)
    } catch (error) {
      if (error.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.")
      } else {
        console.error("Error fetching users:", error)
        setError(`Failed to load users: ${error.message}`)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

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
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user. Please try again later.")
    } finally {
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
        throw new Error(`Failed to update user role: ${res.status} ${res.statusText}`)
      }

      const updatedUser = await res.json()
      setUsers(users.map((user) => (user._id === userId ? updatedUser : user)))

      const newStatus = updatedUser.isAdmin ? "granted admin privileges" : "removed admin privileges"
      alert(`Successfully ${newStatus} for ${updatedUser.username}`)
    } catch (error) {
      console.error("Error updating user role:", error)
      setError(`Failed to update user role: ${error.message}`)
    } finally {
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6 max-w-md">Please sign in to access the user management panel.</p>
        <a
          href="/sign-in"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Sign In
        </a>
      </div>
    )
  }

  // Show admin check if user is not admin
  if (currentUser && !currentUser.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
        <p className="text-gray-600 mb-6 max-w-md">You need administrator privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage users, roles, and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => fetchUsers()}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{userStats.total}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{userStats.admin}</div>
          <div className="text-sm text-gray-500">Admin Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{userStats.regular}</div>
          <div className="text-sm text-gray-500">Regular Users</div>
        </div>
      </div>

      {/* Users Table/Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
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
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "No users found matching your search" : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50 transition-colors ${processingUserId === user._id ? "opacity-50" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                user.avatar ||
                                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" ||
                                "/placeholder.svg"
                              }
                              alt={user.username}
                              loading="lazy"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-[200px]">{user.email}</div>
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
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            onClick={() => handleEditUser(user)}
                            disabled={processingUserId === user._id}
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className={`transition-colors ${
                              user.isAdmin
                                ? "text-orange-600 hover:text-orange-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            onClick={() => handleToggleAdminRole(user._id, user.isAdmin)}
                            disabled={processingUserId === user._id}
                            title={user.isAdmin ? "Remove admin privileges" : "Grant admin privileges"}
                          >
                            {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 transition-colors"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={processingUserId === user._id}
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                {searchTerm ? "No users found matching your search" : "No users found"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`bg-white rounded-lg shadow-sm border p-4 ${processingUserId === user._id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={
                          user.avatar ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" ||
                          "/placeholder.svg"
                        }
                        alt={user.username}
                        loading="lazy"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isAdmin ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                      onClick={() => handleEditUser(user)}
                      disabled={processingUserId === user._id}
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 rounded transition-colors ${
                        user.isAdmin
                          ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                          : "text-green-600 hover:text-green-900 hover:bg-green-50"
                      }`}
                      onClick={() => handleToggleAdminRole(user._id, user.isAdmin)}
                      disabled={processingUserId === user._id}
                      title={user.isAdmin ? "Remove admin privileges" : "Grant admin privileges"}
                    >
                      {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </button>
                    <button
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={processingUserId === user._id}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />}
    </div>
  )
}
