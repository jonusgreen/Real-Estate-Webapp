import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { useSelector } from "react-redux";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import { FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import Contact from "../components/Contact";

const Listing = () => {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  /**********************   FETCH LISTING USEEFFECT  ********************************/
  /*
    1. This useEffect hook is responsible for fetching a listing from the server when the listingId parameter changes.
    2. When the fetchListing function is called, it sets the loading state to true to indicate that the fetch operation has started.
    3. It then makes a GET request to the server to fetch the listing with the given listingId. In JavaScript, when you make a request to an API using the fetch API, the default HTTP method used is implicitly GET if not specified otherwise.
    4. The response data from the server is then converted to JSON using the response.json() method.
    5. If the success property of the data object is false, it sets the error state to true. When it is true, it displays an error message to the user that "something went wrong" - futher down in the RETURN UI code - {error && <p className="text-center my-7 text-2xl">Something went wrong!</p>}.
    6. Sets loading to false to indicate that the fetch operation has completed and returns.
    7. If the success property of the data object is true, it sets the listing state to the data object (earlier converted to json). This data object contains the listing details fetched from the server.
    8. Sets loading to false to indicate that the fetch operation has completed and sets the error state to false.
    9. The [params.listingId] dependency array for the useEffect hook. Whenever the listingId parameter changes, the fetchListing function is called to fetch the listing with the new listingId.
  */

    useEffect(() => {
      const fetchListing = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/listing/get/${params.listingId}`);
          const data = await response.json();
          if (data.success === false) {
            setError(true);
            setLoading(false);
            setTimeout(() => setError(false), 4000); 
            return;
          }
          setListing(data);
          setLoading(false);
          setError(false);
        } catch (error) {
          setError(true);
          setLoading(false);
          setTimeout(() => setError(false), 4000); 
        }
      };
      fetchListing();
    }, [params.listingId]);
    

/**************************** RETURN UI ***************************************/

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && <p className="text-center my-7 text-2xl">Something went wrong!</p>}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - ${" "}
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-US")
                : listing.regularPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600 text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <div className="flex gap-4 justify-between items-center">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ${+listing.regularPrice - +listing.discountPrice} OFF
                </p>
              )}
              {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-slate-900 w-full max-w-[200px] text-white text-center p-1 rounded-md"
              >
                Contact Landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}

              <Link to={'/'}>
              <p className="text-green-700 font-semibold underline">To Home Page</p>
              </Link>

            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black truncate">Description - </span>
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds `
                  : `${listing.bedrooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths `
                  : `${listing.bathrooms} bath `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>
          </div>
        </div>
      )}
      <hr style={{ borderTop: '2px solid #ccc', margin: '20px 0' }} />
    </main>
  );
};

export default Listing;
