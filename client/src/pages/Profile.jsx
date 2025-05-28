"use client"

import { useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteListingFailure } from "../redux/user/userSlice"
import { useDispatch } from "react-redux"
import { app } from "../firebase"
import { Link } from "react-router-dom"

function Profile() {
  const fileRef = useRef(null)
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0)
  const [fileUploadError, setFileUploadError] = useState(false)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [userListings, setUserListings] = useState([])
  const [showListingsError, setShowListingsError] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [phoneValue, setPhoneValue] = useState("")
  const dispatch = useDispatch()

  /***************************** PHONE FORMATTING FUNCTIONS *****************************/
  const formatPhoneNumber = (value) => {
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

    if (!cleanPhone) return { isValid: true, error: "" }

    // Uganda phone number validation
    if (cleanPhone.startsWith("256")) {
      if (cleanPhone.length !== 12) {
        return { isValid: false, error: "Uganda phone number with +256 must be 12 digits total" }
      }
      const localPart = cleanPhone.slice(3)
      if (!/^[734]\d{8}$/.test(localPart)) {
        return { isValid: false, error: "Please enter a valid Uganda phone number" }
      }
    } else if (cleanPhone.startsWith("0")) {
      if (cleanPhone.length !== 10) {
        return { isValid: false, error: "Uganda phone number starting with 0 must be 10 digits" }
      }
      if (!/^0[734]\d{8}$/.test(cleanPhone)) {
        return { isValid: false, error: "Please enter a valid Uganda phone number" }
      }
    } else {
      if (cleanPhone.length !== 9) {
        return { isValid: false, error: "Uganda phone number must be 9 digits" }
      }
      if (!/^[734]\d{8}$/.test(cleanPhone)) {
        return { isValid: false, error: "Please enter a valid Uganda phone number" }
      }
    }

    return { isValid: true, error: "" }
  }

  /***************************** HANDLE FILE UPLOAD USEEFFECT *****************************/
  useEffect(() => {
    if (file) {
      handleFileUpload(file)
    }
  }, [file])

  // Initialize phone value when component mounts
  useEffect(() => {
    if (currentUser?.phone) {
      setPhoneValue(formatPhoneNumber(currentUser.phone))
    }
  }, [currentUser])

  // Fetch user listings when component mounts
  useEffect(() => {
    if (currentUser) {
      handleShowListings()
    }
  }, [currentUser])

  /*************************   HANDLE FILE UPLOAD FUNCTION   ****************************/
  const handleFileUpload = (file) => {
    const storage = getStorage(app)
    const fileName = new Date().getTime() + file.name
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setFilePerc(Math.round(progress))
      },
      () => {
        setFileUploadError(true)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => setFormData({ ...formData, avatar: downloadURL }))
      },
    )
  }

  /*****************************    HANDLE CHANGE FUNCTION   ******************************/
  const handleChange = (e) => {
    const { id, value } = e.target

    if (id === "phone") {
      // Format the phone number for display
      const formattedPhone = formatPhoneNumber(value)
      setPhoneValue(formattedPhone)

      // Validate the phone number
      const validation = validatePhoneNumber(value)
      setPhoneError(validation.error)

      // Store clean phone number in form data
      const cleanPhone = value.replace(/\D/g, "")
      setFormData({ ...formData, phone: cleanPhone || undefined })
      return
    }

    setFormData({ ...formData, [id]: value })
  }

  /*****************************    HANDLE SUBMIT FUNCTION   ******************************/
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check for phone validation errors
    if (phoneError) {
      dispatch(updateUserFailure("Please fix the phone number error before submitting."))
      return
    }

    try {
      dispatch(updateUserStart())

      console.log("Updating user with data:", formData)

      const response = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Update response:", data)

      if (data.success === false) {
        dispatch(updateUserFailure(data.message))
        setTimeout(() => {
          dispatch(updateUserFailure(null))
        }, 4000)
        return
      }

      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
      setTimeout(() => {
        setUpdateSuccess(false)
      }, 4000)
    } catch (error) {
      dispatch(updateUserFailure(error.message))
      setTimeout(() => {
        dispatch(updateUserFailure(null))
      }, 4000)
    }
  }

  /**************************    HANDLE SHOW LISTINGS FUNCTION   *********************/
  const handleShowListings = async () => {
    try {
      setShowListingsError(false)
      const response = await fetch(`/api/user/listings/${currentUser._id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success === false) {
        setShowListingsError(true)
        return
      }

      setUserListings(data)
    } catch (error) {
      setShowListingsError(true)
    }
  }

  /**************************    HANDLE LISTING DELETE FUNCTION   *********************/
  const handleListingDelete = async (listingId) => {
    try {
      const response = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()
      if (data.success === false) {
        dispatch(deleteListingFailure(data.message))
        setTimeout(() => {
          dispatch(deleteListingFailure(null))
        }, 4000)
        return
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId))
    } catch (error) {
      dispatch(deleteListingFailure(error.message))
      setTimeout(() => {
        dispatch(deleteListingFailure(null))
      }, 4000)
    }
  }

  /*********************************    RETURN UI   *************************************/
  return (
    <div className="p-3 max-w-lg mx-auto text-center mt-5">
      {/* Profile picture, centered */}
      <img
        onClick={() => fileRef.current.click()}
        src={formData.avatar || currentUser.avatar}
        alt="profile"
        className="rounded-full h-20 w-20 object-cover cursor-pointer mx-auto mb-5"
      />

      {/* Form container with white background */}
      <div className="bg-white p-5 rounded-lg mt-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <hr />

          {/* Input fields and buttons */}
          <input type="file" onChange={(e) => setFile(e.target.files[0])} ref={fileRef} hidden accept="image/*" />
          <p className="text-sm self-center">
            {fileUploadError ? (
              <span className="text-red-700">Error image upload (image must be less than 2MB)</span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className="text-green-700">Image successfully uploaded</span>
            ) : (
              ""
            )}
          </p>

          <input
            type="text"
            placeholder="Username"
            defaultValue={currentUser.username}
            className="border p-3 rounded-lg"
            id="username"
            onChange={handleChange}
          />

          <input
            type="email"
            placeholder="Email"
            defaultValue={currentUser.email}
            className="border p-3 rounded-lg"
            id="email"
            onChange={handleChange}
          />

          {/* Enhanced phone number section */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone Number (e.g., +256 700 123 456 or 0700 123 456)"
                value={phoneValue}
                className={`border p-3 rounded-lg w-full ${phoneError ? "border-red-500" : ""}`}
                id="phone"
                onChange={handleChange}
                maxLength={17}
              />
              {formData.phone && !phoneError && <div className="absolute right-3 top-3 text-green-500 text-lg">✓</div>}
            </div>

            {phoneError && (
              <div className="flex items-center text-red-500 text-sm">
                <span className="mr-1">⚠️</span>
                <span>{phoneError}</span>
              </div>
            )}

            {!phoneError && (formData.phone || currentUser.phone) && (
              <div className="flex items-center text-green-600 text-sm">
                <span className="mr-1">✓</span>
                <span>Great! Tenants can call or WhatsApp you</span>
              </div>
            )}

            <p className="text-gray-500 text-xs">Adding your phone number helps potential tenants contact you faster</p>
          </div>

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg"
            id="password"
            onChange={handleChange}
          />

          <button
            disabled={loading || phoneError}
            className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Loading..." : "Update"}
          </button>
        </form>
      </div>

      {/* Error and success messages */}
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">{updateSuccess ? "User is updated successfully" : ""}</p>

      {/* Button to show listings */}
      <button
        onClick={handleShowListings}
        className="bg-green-700 text-white p-3 rounded-lg uppercase text-center w-full max-w-lg mx-auto mt-5"
      >
        Show Listings
      </button>

      {/* Display user listings */}
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">My Listings</h1>

          {userListings.map((listing) => (
            <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4 bg-white">
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0] || "/placeholder.svg"}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold  hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col item-center">
                <button onClick={() => handleListingDelete(listing._id)} className="text-red-700 uppercase">
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showListingsError && <p className="text-red-700 mt-5">Error showing listings</p>}
    </div>
  )
}

export default Profile
