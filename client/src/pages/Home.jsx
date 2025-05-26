"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import SwiperCore from "swiper"
import "swiper/css/bundle"
import ListingItem from "../components/ListingItem"

export default function Home() {
  const [offerListings, setOfferListings] = useState([])
  const [saleListings, setSaleListings] = useState([])
  const [rentListings, setRentListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  SwiperCore.use([Navigation, Autoplay])

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        console.log("Fetching offer listings for home page...")
        const res = await fetch("/api/listing/get?offer=true&limit=4")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        console.log("Offer listings:", data)
        setOfferListings(Array.isArray(data) ? data : data.listings || [])
        fetchRentListings()
      } catch (error) {
        console.error("Error fetching offer listings:", error)
        setError("Failed to load listings. Please try again later.")
        setLoading(false)
      }
    }

    const fetchRentListings = async () => {
      try {
        console.log("Fetching rent listings for home page...")
        const res = await fetch("/api/listing/get?type=rent&limit=4")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        console.log("Rent listings:", data)
        setRentListings(Array.isArray(data) ? data : data.listings || [])
        fetchSaleListings()
      } catch (error) {
        console.error("Error fetching rent listings:", error)
        setError("Failed to load listings. Please try again later.")
        setLoading(false)
      }
    }

    const fetchSaleListings = async () => {
      try {
        console.log("Fetching sale listings for home page...")
        const res = await fetch("/api/listing/get?type=sale&limit=4")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        console.log("Sale listings:", data)
        setSaleListings(Array.isArray(data) ? data : data.listings || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching sale listings:", error)
        setError("Failed to load listings. Please try again later.")
        setLoading(false)
      }
    }

    fetchOfferListings()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      </div>
    )
  }

  // Get all listings for the slider
  const allListings = [...offerListings, ...rentListings, ...saleListings]
  const sliderListings = []

  // Add first and last from each category
  if (offerListings.length > 0) {
    sliderListings.push(offerListings[0])
    if (offerListings.length > 1) {
      sliderListings.push(offerListings[offerListings.length - 1])
    }
  }
  if (rentListings.length > 0) {
    sliderListings.push(rentListings[0])
    if (rentListings.length > 1) {
      sliderListings.push(rentListings[rentListings.length - 1])
    }
  }
  if (saleListings.length > 0) {
    sliderListings.push(saleListings[0])
    if (saleListings.length > 1) {
      sliderListings.push(saleListings[saleListings.length - 1])
    }
  }

  return (
    <div>
      {/* Hero Section with Background Slider */}
      <div className="relative h-screen">
        {/* Background Image Slider */}
        {sliderListings.length > 0 && (
          <Swiper
            navigation
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            modules={[Navigation, Autoplay]}
            className="absolute inset-0 h-full w-full z-10"
          >
            {sliderListings.map((listing, index) => (
              <SwiperSlide key={`slider-${listing._id}-${index}`}>
                <div
                  style={{
                    background: `url(${listing.imageUrls[0]}) center no-repeat`,
                    backgroundSize: "cover",
                    filter: "brightness(1.1) contrast(1.1)",
                  }}
                  className="h-full w-full"
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Light Overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-25 z-20"></div>

        {/* Hero Content */}
        <div className="relative z-30 flex flex-col justify-center items-center h-full text-center px-3 max-w-6xl mx-auto">
          <h1 className="text-white font-bold text-4xl lg:text-7xl mb-6 drop-shadow-2xl">
            Find your next <span className="text-blue-400">perfect</span>
            <br />
            place with ease
          </h1>
          <div className="text-gray-100 text-sm sm:text-lg mb-8 max-w-2xl drop-shadow-lg bg-black bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            Exela Realtors' Estate is the best place to find your next perfect place to live.
            <br />
            We have a wide range of beautiful properties for you to choose from.
          </div>
          <Link
            to={"/search"}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            Let's get started
          </Link>
        </div>
      </div>

      {/* Listing results for offer, sale, and rent */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent offers</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?offer=true"}>
                Show more offers
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent places for rent</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?type=rent"}>
                Show more places for rent
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent places for sale</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?type=sale"}>
                Show more places for sale
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
