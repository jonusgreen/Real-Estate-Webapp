"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice"
import OAuth from "../components/OAuth"
import FacebookAuth from "../components/FacebookAuth"

function SignIn() {
  const [formData, setFormData] = useState({})
  const { loading, error, currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  // Get redirect URL from query parameters if it exists
  const queryParams = new URLSearchParams(location.search)
  const redirectUrl = queryParams.get("redirect") || "/"

  // If user is already logged in, redirect to the redirect URL
  useEffect(() => {
    if (currentUser) {
      navigate(redirectUrl)
    }
  }, [currentUser, navigate, redirectUrl])

  /************************    HANDLE CHANGE FUNCTION    ********************************/
  /*  HANDLE CHANGE FUNCTION - update the form data when the user types in the input fields
  1. setFormData - update the form data with the new value from the input field
  2. The id of the input field is used as the key to update the form data
  3. ...formData - spread the form data to keep the other form data properties
  4. e.target.id - the id of the input field that triggered the change event (username, email, or password).
  */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  /*******************  HANDLE SUBMIT FUNCTION        ***********************/
  /* 
  1.API CALL TO SIGN IN A USER - make a POST request to /api/auth/signin
    2. dispatch(signInStart()) - Dispatching a start action indicating the sign-in process has started
    3. response - the response from the server after fetch by making the POST request
    4. formData - the form data sent to the server - email and password of the user
    5. data - the JSON data from the response to be compared with user input data.
    6. If the success property is false, dispatch(signInFailure(data.message)) - Dispatching a failure action if sign-in was not successful
    7. If the success property is true, dispatch(signInSuccess(data)) - Dispatching a success action if sign-in was successful
    8. navigate("/") - Redirecting to the home page after sign-in
    9. If there is an error, dispatch(signInFailure(error.message)) - Dispatching a failure action if there was an error during sign-in
    10. The error message will be displayed to the user if there is an error and will clear after 4 seconds.
    11. We are using Redux in this component to manage the user state and share the user data with other components.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(signInStart())
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success === false) {
        dispatch(signInFailure(data.message))
        setTimeout(() => {
          dispatch(signInFailure(null))
        }, 4000)
        return
      }
      dispatch(signInSuccess(data))
      navigate(redirectUrl) // Navigate to the redirect URL after successful sign-in
    } catch (error) {
      dispatch(signInFailure(error.message))
      setTimeout(() => {
        dispatch(signInFailure(null))
      }, 4000)
    }
  }

  // Check if we're coming from rental manager
  const isFromRentalManager = redirectUrl.includes("post-listing-preview")

  /***************************    RETURN UI   ***************************/
  return (
    <div className="h-full items-center justify-center bg-sage-300 max-w-lg mx-auto">
      <div className="bg-white bg-opacity-90 p-8 rounded-md w-full max-w-md mt-12">
        {isFromRentalManager && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800">Sign in to continue</h2>
            <p className="text-gray-600 mt-2">Sign in to your account to post your rental property</p>
          </div>
        )}

        <h1 className="text-2xl text-center font-semibold mb-7 text-slate-600">Sign-in</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Email" className="border p-3 rounded-md" id="email" onChange={handleChange} />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-md"
            id="password"
            onChange={handleChange}
          />

          <div className="justify-between items-center mt-5">
            <button
              disabled={loading}
              className="bg-slate-500 hover:opacity-95 text-white p-3 rounded-md uppercase disabled:opacity-80 w-full"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>

            <div className="flex justify-between items-center">
              <h1 className="text-slate-600 font-semibold">Forgot your password?</h1>
              <Link to="/forgot-password">
                <span className="text-blue-700 font-semibold hover:underline">Reset</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <OAuth />
            <FacebookAuth />
          </div>
        </form>
        <div className="flex justify-between items-center">
          <h1 className="text-slate-600 font-semibold">Do not have an account?</h1>
          <Link to={`/sign-up${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}>
            <span className="text-blue-700 font-semibold hover:underline">Sign up</span>
          </Link>
        </div>
        {error && <p className="text-red-500 mt-5">{error}</p>}
      </div>
    </div>
  )
}

export default SignIn
