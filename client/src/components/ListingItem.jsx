/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { MdLocationOn } from "react-icons/md"

// eslint-disable-next-line react/prop-types
const ListingItem = ({ listing }) => {
  // Function to get currency symbol
  const getCurrencySymbol = (currency) => {
    return currency === "UGX" ? "UGX " : "$"
  }

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]">
      <Link to={`/listing/${listing._id}`}>
        <img
          src={listing.imageUrls[0] || "/placeholder.svg"}
          alt="listing cover"
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="text-lg font-semibold text-slate-700 truncate">{listing.name}</p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate">{listing.address}</p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
          <p className="text-slate-500 mt-2 font-semibold">
            {getCurrencySymbol(listing.currency)}
            {listing.offer
              ? listing.discountPrice.toLocaleString("en-US")
              : listing.regularPrice.toLocaleString("en-US")}
            {listing.type === "rent" && " / month"}
          </p>
          <div className="flex gap-4">
            <div className="font-bold text-xs">
              {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms ` : `${listing.bedrooms} bedroom`}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms ` : `${listing.bathrooms} bathroom `}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ListingItem
