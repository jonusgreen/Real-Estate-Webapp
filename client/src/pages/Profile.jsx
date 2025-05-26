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
  const dispatch = useDispatch()

  /***************************** HANDLE FILE UPLOAD USEEFFECT *****************************/
  /* 
 1. useEffect for triggering the file upload function when the file state changes. The state changes when the user selects a file to upload. When a user selects a file, the file state is updated with the selected file triggering a rerender of the component initiating a file upload to Firebase.
*/

  useEffect(() => {
    if (file) {
      handleFileUpload(file)
    }
  }, [file])

  // Fetch user listings when component mounts
  useEffect(() => {
    if (currentUser) {
      handleShowListings()
    }
  }, [currentUser])

  /*************************   HANDLE FILE UPLOAD FUNCTION   ****************************/
  /* 
 1. Get the storage reference from the firebase app
 2. Create a new file name by concatenating the current time and the file name you want to upload to the storage bucket in firebase. The time part is to ensure that the file name is unique
 3. Create a reference to the file in the storage bucket
 4. Create a new upload task to upload the file to the storage bucket
 5. Listen for state changes in the upload task. If the state changes, calculate the upload progress and set the filePerc state to the progress percentage
 6. If there is an error during the upload, set the fileUploadError state to true
 7. If the upload is successful, get the download URL of the uploaded file and set the avatar in the formData state to the download URL
 */
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
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  /*****************************    HANDLE SUBMIT FUNCTION   ******************************/
  /* 
   1. API REQUEST TO UPDATE USER to api/user/update/:id to fetch the user data from the db
   2. If the response is unsuccessful (ie if the user data is NOT updated), dispatch updateUserFailure action with the error message
   3. Clear the error message after 4 seconds
   4. If the response is successful(ie if the user data is updated), dispatch updateUserSuccess action with the user data as payload to update the user state in the redux store.
   5. Set the updateSuccess state to true to display a success message to the user for 4 seconds and then set it back to false after 4 seconds
   6. If there is an error during the API request, dispatch updateUserFailure action with the error message
   7. Clear the error message after 4 seconds
   8. Set the updateSuccess state to false after 4 seconds
   9. The updateSuccess is set to false after 4 seconds to clear any possible success message from the UI.
   */

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(updateUserStart())
      const response = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()
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
      setTimeout(() => {
        setUpdateSuccess(false)
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
  /*
1. API REQUEST TO DELETE LISTING to api/listing/delete/:id to delete the listing from the db
2. If the response is unsuccessful (ie if the listing is NOT deleted), log the error message to the console
3. If the response is successful(ie if the listing is deleted), filter the user listings to remove the deleted listing from the user listings
4. If there is an error during the API request, dispatch deleteListingFailure action with the error message
5. Clear the error message after 4 seconds
*/

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
            placeholder="username"
            defaultValue={currentUser.username}
            className="border p-3 rounded-lg"
            id="username"
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="email"
            defaultValue={currentUser.email}
            className="border p-3 rounded-lg"
            id="email"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="password"
            className="border p-3 rounded-lg"
            id="password"
            onChange={handleChange}
          />
          <button
            disabled={loading}
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
