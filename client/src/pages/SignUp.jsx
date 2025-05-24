"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import OAuth from "../components/OAuth"
import { useEffect } from "react"
import FacebookAuth from "../components/FacebookAuth"

function SignUp() {
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  /************************    HANDLE CHANGE FUNCTION **********************/
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

  /*************************    HANDLE SUBBMIT FUNCTION **************************************/
  /*  API CALL TO SIGN UP A USER - make a POST request to /api/auth/signup
  1. response - the response from the server after fetch by making the POST request
  2. data - the JSON data from the response
  3. success - the success property from the data object sent by the server
  4. message - the message property from the data object sent by the server
  5. If the success property is false, set the loading state to false, set the error state to the message property, and return from the function
  6. If the success property is true, set the loading state to false, set the error state to null, and navigate to the sign-in page
  7. If there is an error, set the loading state to false and set the error state to the error message
  8. The error message will be displayed to the user if there is an error
  9. We are not using Redux in this component because we have all the data we need in the component state, and we are not sharing the data with other components.
  */

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success === false) {
        setLoading(false)
        setError(data.message)
        return
      }
      setLoading(false)
      setError(null)
      navigate("/sign-in")
    } catch (error) {
      setLoading(false)
      setError(error.message)
    }
  }

  /****************************    SETTIMEOUT USEEFFECT   **********************************/
  /*  
1. useEffect - a hook that runs after the component has been rendered to the DOM and after every update to the component state or props, and before the component is removed from the DOM. It is used to perform side effects in the component, such as data setting time out for messages, fetching, subscriptions etc.
 2. The first argument is a function that runs the side effect, and the second argument is an array of dependencies that the side effect depends on. If the dependencies change, the side effect will run again.
  3. The side effect in this case is a timer that clears the error message after 4 seconds.
  4. setError(null) - clear the error message (in the UI) - after 4 seconds
 */
  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null)
    }, 4000)

    return () => clearTimeout(timer)
  }, [error])

  /*****************************  RETURN UI     ****************************************/
  return (
    <div className="p-3 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-lg mt-10">
        <h1 className="text-2xl text-center font-semibold my-7 text-slate-600">Sign-Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-3 rounded-lg"
            id="username"
            onChange={handleChange}
          />
          <input type="text" placeholder="Email" className="border p-3 rounded-lg" id="email" onChange={handleChange} />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg"
            id="password"
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className="bg-slate-500 text-white p-3 rounded-lg uppercase hover:opacity-90 disabled:opacity-80"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
          <div className="flex flex-col gap-4 mt-4">
            <OAuth />
            <FacebookAuth />
          </div>
        </form>
        <div className="flex gap-2 mt-5">
          <h1>Have an account?</h1>
          <Link to="/sign-in">
            <span className="text-blue-700">Sign in</span>
          </Link>
        </div>
        {error && <p className="text-red-500 mt-5">{error}</p>}
      </div>
    </div>
  )
}

export default SignUp
