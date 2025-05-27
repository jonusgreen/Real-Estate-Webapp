import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import Header from "./components/Header"
import PrivateRoute from "./components/PrivateRoute"

// Import critical pages directly (no lazy loading for better UX)
import Home from "./pages/Home"
import Admin from "./pages/Admin"

// Lazy load less critical pages
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
const RentalManagement = lazy(() => import("./pages/RentalManagement"))
const RentalManagerLogin = lazy(() => import("./pages/RentalManagerLogin"))
const PostListingPreview = lazy(() => import("./pages/PostListingPreview"))
const ShowListings = lazy(() => import("./pages/ShowListings"))
const Advertise = lazy(() => import("./pages/Advertise"))
const PromoteListing = lazy(() => import("./pages/PromoteListing"))
const AdvertisePayment = lazy(() => import("./pages/AdvertisePayment"))
const AdvertiseSuccess = lazy(() => import("./pages/AdvertiseSuccess"))

// Minimal loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Critical pages - no lazy loading */}
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />

          {/* Less critical pages - lazy loaded */}
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
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
