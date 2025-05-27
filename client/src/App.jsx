"use client"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy, memo } from "react"
import React from "react"
import Header from "./components/Header"
import PrivateRoute from "./components/PrivateRoute"
import ErrorBoundary from "./components/ErrorBoundary"

// Lazy load components with preloading
const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.default })))
const SignIn = lazy(() => import("./pages/SignIn"))
const SignUp = lazy(() => import("./pages/SignUp"))
const About = lazy(() => import("./pages/About"))
const Profile = lazy(() => import("./pages/Profile"))
const CreateListing = lazy(() => import("./pages/CreateListing"))
const UpdateListing = lazy(() => import("./pages/UpdateListing"))
const Listing = lazy(() => import("./pages/Listing"))
const Search = lazy(() => import("./pages/Search"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const Admin = lazy(() => import("./pages/Admin"))
const RentalManagement = lazy(() => import("./pages/RentalManagement"))
const RentalManagerLogin = lazy(() => import("./pages/RentalManagerLogin"))
const PostListingPreview = lazy(() => import("./pages/PostListingPreview"))
const ShowListings = lazy(() => import("./pages/ShowListings"))
const Advertise = lazy(() => import("./pages/Advertise"))
const PromoteListing = lazy(() => import("./pages/PromoteListing"))
const AdvertisePayment = lazy(() => import("./pages/AdvertisePayment"))
const AdvertiseSuccess = lazy(() => import("./pages/AdvertiseSuccess"))

// Optimized loading component
const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
    </div>
  </div>
))

// Preload critical routes on hover
const preloadRoute = (routeImport) => {
  const componentImport = routeImport()
  return componentImport
}

// Add route preloading on app mount
const preloadCriticalRoutes = () => {
  // Preload most commonly accessed routes
  setTimeout(() => {
    import("./pages/Search")
    import("./pages/SignIn")
    import("./pages/About")
  }, 2000)
}

export default function App() {
  // Preload routes after initial render
  React.useEffect(() => {
    preloadCriticalRoutes()
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Header />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route path="/listing/:listingId" element={<Listing />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/rental-manager" element={<RentalManagement />} />
            <Route path="/rental-manager/login" element={<RentalManagerLogin />} />
            <Route path="/rental-manager-login" element={<RentalManagerLogin />} />
            <Route path="/post-listing-preview" element={<PostListingPreview />} />
            <Route path="/show-listings" element={<ShowListings />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/advertise/promote/:id" element={<PromoteListing />} />
            <Route path="/advertise/payment/:id" element={<AdvertisePayment />} />
            <Route path="/advertise/success" element={<AdvertiseSuccess />} />

            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/update-listing/:listingId" element={<UpdateListing />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
