"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function ListingEditModal({ listing, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    regularPrice: 0,
    discountPrice: 0,
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    parking: false,
    offer: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (listing) {
      setFormData({
        name: listing.name || "",
        address: listing.address || "",
        description: listing.description || "",
        regularPrice: listing.regularPrice || 0,
        discountPrice: listing.discountPrice || 0,
        type: listing.type || "rent",
        bedrooms: listing.bedrooms || 1,
        bathrooms: listing.bathrooms || 1,
        furnished: listing.furnished || false,
        parking: listing.parking || false,
        offer: listing.offer || false,
      })
    }
  }, [listing])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/listing/update/${listing._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrls: listing.imageUrls, // Keep the existing images
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        setError(data.message)
        setLoading(false)
        return
      }

      setLoading(false)
      onSave(data)
    } catch (error) {
      setError("An error occurred while updating the listing")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Listing</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price</label>
              <input
                type="number"
                name="regularPrice"
                value={formData.regularPrice}
                onChange={handleChange}
                min="1"
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                required
              />
            </div>

            {formData.offer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  min="0"
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="1"
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="1"
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="furnished"
                checked={formData.furnished}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Furnished</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="parking"
                checked={formData.parking}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Parking</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="offer"
                checked={formData.offer}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Offer</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
