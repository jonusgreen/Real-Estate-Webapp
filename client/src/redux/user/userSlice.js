import { createSlice } from "@reduxjs/toolkit"

// Initial state
const initialState = {
  currentUser: null,
  error: null,
  loading: false,
}

// Create slice - contains the initial state, reducers, and actions
/* 
1. Reducers - functions that take the current state and an action, and handle the action    by returning a new state.
2. Actions - objects that contain a type and a payload. Actions are dispatched to the reducer functions to update the state.
*/
const userSlice = createSlice({
  name: "user",
  initialState, // Initial state created above

  // Reducers - functions that take the current state and an action, and handle the action by returning a new state.
  reducers: {
    // Action: signInStart - Initiates the sign-in process
    signInStart: (state) => {
      state.loading = true // Reducer: Changes loading state to true
    },
    // Action: signInSuccess - Handles successful sign-in
    signInSuccess: (state, action) => {
      state.currentUser = action.payload //Sets currentUser with payload (user data)
      state.loading = false //Changes loading state to false
      state.error = null // Clears any previous error
    },
    // Action: signInFailure - Handles sign-in failure
    signInFailure: (state, action) => {
      state.error = action.payload // Reducer: Sets error with payload (error message)
      state.loading = false // Reducer: Changes loading state to false
    },
    // Action: updateUserStart - Initiates the update user process
    updateUserStart: (state) => {
      state.loading = true // Reducer: Changes loading state to true
    },
    // Action: updateUserSuccess - Handles successful user update
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload //Sets currentUser with payload (updated user data)
      state.loading = false // Reducer: Changes loading state to false
      state.error = null // Reducer: Clears any previous error
    },
    // Action: updateUserFailure - Handles user update failure
    updateUserFailure: (state, action) => {
      state.error = action.payload // Reducer: Sets error with payload (error message)
      state.loading = false // Reducer: Changes loading state to false
    },
    // Action: deleteUserStart - Initiates the delete user process
    deleteUserStart: (state) => {
      state.loading = true // Reducer: Changes loading state to true
    },
    // Action: deleteUserSuccess - Handles successful user deletion
    deleteUserSuccess: (state) => {
      state.currentUser = null // Reducer: Clears currentUser
      state.loading = false // Reducer: Changes loading state to false
      state.error = null // Reducer: Clears any previous error
    },
    // Action: deleteUserFailure - Handles user deletion failure
    deleteUserFailure: (state, action) => {
      state.error = action.payload // Reducer: Sets error with payload (error message)
      state.loading = false // Reducer: Changes loading state to false
    },
    // Action: signOutUserStart - Initiates the sign-out process
    signOutUserStart: (state) => {
      state.loading = true // Reducer: Changes loading state to true
    },
    // Action: signOutUserSuccess - Handles successful sign-out
    signOutUserSuccess: (state) => {
      state.currentUser = null // Reducer: Clears currentUser
      state.loading = false // Reducer: Changes loading state to false
      state.error = null // Reducer: Clears any previous error
    },
    // Action: signOutUserFailure - Handles sign-out failure
    signOutUserFailure: (state, action) => {
      state.error = action.payload // Reducer: Sets error with payload (error message)
      state.loading = false // Reducer: Changes loading state to false
    },
    // Action: deleteListingFailure - Handles failure in deleting a listing
    deleteListingFailure: (state, action) => {
      state.error = action.payload // Reducer: Sets error with payload (error message)
      state.loading = false // Reducer: Changes loading state to false
    },
    // Action: updateAdminStatus - Updates the admin status in the Redux store
    updateAdminStatus: (state, action) => {
      if (state.currentUser) {
        state.currentUser.isAdmin = action.payload
      }
    },
  },
})

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
  deleteListingFailure,
  updateAdminStatus,
} = userSlice.actions

export default userSlice.reducer
