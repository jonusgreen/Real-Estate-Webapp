"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function ShowListings() {
  const [userListings, setUserListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/user/listings/${currentUser._id}`)
        const data = await res.json()

        if (data.success === false) {
          setError(data.message)
          setLoading(false)
          return
        }

        setUserListings(data)
        setLoading(false)
      } catch (error) {
        setError("Failed to fetch listings")
        setLoading(false)
      }
    }

    fetchListings()
  }, [currentUser._id])

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (data.success === false) {
        console.log(data.message)
        return
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId))
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">My Listings</h1>

      {loading && <p className="text-center text-2xl">Loading...</p>}
      {error && <p className="text-center text-red-700">{error}</p>}

      {!loading && !error && userListings.length === 0 && (
        <div className="text-center">
          <p className="text-xl mb-4">You have no listings yet</p>
          <Link to="/create-listing">
            <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
              Create a listing
            </button>
          </Link>
        </div>
      )}

      {!loading && !error && userListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0] || "/placeholder.svg"}
                  alt="listing cover"
                  className="h-48 w-full object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/listing/${listing._id}`}>
                  <h2 className="text-lg font-semibold truncate">{listing.name}</h2>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{listing.description}</p>
                <p className="text-slate-700 mt-2">
                  <span className="font-semibold">${listing.regularPrice.toLocaleString()}</span>
                  {listing.type === "rent" && " / month"}
                </p>

                <div className="flex justify-between mt-4">
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className="bg-green-700 text-white p-2 rounded uppercase text-sm hover:opacity-95">
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className="bg-red-700 text-white p-2 rounded uppercase text-sm hover:opacity-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
