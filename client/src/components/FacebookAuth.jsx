"use client"

import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import { app } from "../firebase"
import { useDispatch } from "react-redux"
import { signInSuccess } from "../redux/user/userSlice"
import { useNavigate } from "react-router-dom"
import { FaFacebook } from "react-icons/fa"

const FacebookAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleFacebookClick = async () => {
    try {
      const provider = new FacebookAuthProvider()
      const auth = getAuth(app)

      const result = await signInWithPopup(auth, provider)

      // Send user data to backend
      const res = await fetch("/api/auth/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      })

      const data = await res.json()
      dispatch(signInSuccess(data))
      navigate("/")
    } catch (error) {
      console.log("Could not sign in with Facebook!", error)
    }
  }

  return (
    <button
      onClick={handleFacebookClick}
      type="button"
      className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:opacity-95 flex items-center justify-center"
    >
      <FaFacebook className="mr-2 text-xl" />
      Continue with Facebook
    </button>
  )
}

export default FacebookAuth
