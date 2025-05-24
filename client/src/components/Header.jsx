"use client"

import { FaSearch } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState, useRef } from "react"
import { signOutUserStart, signOutUserSuccess, signOutUserFailure, updateAdminStatus } from "../redux/user/userSlice"

export default function Header() {
  const { currentUser } = useSelector((state) => state.user)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [adminCheckDone, setAdminCheckDone] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser && !adminCheckDone) {
        try {
          // First check if isAdmin is already in the currentUser object
          if (currentUser.isAdmin === true) {
            setIsAdmin(true)
            setAdminCheckDone(true)
            return
          }

          // If not, make an API call to check
          const res = await fetch(`/api/user/check-admin/${currentUser._id}`)
          const data = await res.json()

          console.log("Admin check response:", data)
          setIsAdmin(data.isAdmin)
          setAdminCheckDone(true)

          // Update the Redux store if needed
          if (data.isAdmin && !currentUser.isAdmin) {
            console.log("User is admin but not reflected in Redux store")
            dispatch(updateAdminStatus(true))
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          setAdminCheckDone(true)
        }
      }
    }

    checkAdminStatus()
  }, [currentUser, dispatch, adminCheckDone])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set("searchTerm", searchTerm)
    const searchQuery = urlParams.toString()
    navigate(`/search?${searchQuery}`)
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchTermFromUrl = urlParams.get("searchTerm")
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl)
    }
  }, [location.search])

  const handleRentalManagerClick = (e) => {
    e.preventDefault()
    console.log("Navigating to rental manager")
    navigate("/rental-manager")
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart())
      const res = await fetch("/api/auth/signout")
      const data = await res.json()
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message))
        return
      }
      dispatch(signOutUserSuccess())
      setShowDropdown(false)
      navigate("/sign-in")
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }

  const handleAdminClick = () => {
    setShowDropdown(false)
    navigate("/admin")
  }

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Estate</span>
            <span className="text-slate-700">App</span>
          </h1>
        </Link>
        <form onSubmit={handleSubmit} className="bg-slate-100 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>
        <ul className="flex gap-4 items-center">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">Home</li>
          </Link>
          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">About</li>
          </Link>
          <li
            onClick={handleRentalManagerClick}
            className="hidden sm:inline text-slate-700 hover:underline cursor-pointer"
          >
            Rental Manager
          </li>

          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <img
                className="rounded-full h-7 w-7 object-cover cursor-pointer"
                src={currentUser.avatar || "/placeholder.svg"}
                alt="profile"
                onClick={toggleDropdown}
              />

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/profile">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Update Profile</div>
                  </Link>
                  <Link to="/show-listings">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Listings</div>
                  </Link>
                  <Link to="/create-listing">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Create Listing</div>
                  </Link>
                  <Link to="/rental-manager">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rental Manager</div>
                  </Link>
                  {isAdmin && (
                    <div
                      onClick={handleAdminClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Admin Dashboard
                    </div>
                  )}
                  <div
                    onClick={handleSignOut}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer border-t border-gray-200 mt-1 font-medium"
                  >
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/sign-in">
              <li className="text-slate-700 hover:underline">Sign in</li>
            </Link>
          )}

          {isAdmin && currentUser && !showDropdown && (
            <Link to="/admin">
              <li className="text-slate-700 hover:underline">Admin</li>
            </Link>
          )}
        </ul>
      </div>
    </header>
  )
}
