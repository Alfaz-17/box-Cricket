import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Star,
  Info,

} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AuthContext from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TimePicker from "../../components/ui/TimePicker";
import ReviewsSection from "../../components/ui/ReviewsSection";
import api from '../../utils/api.js'
import Tabs from "../../components/ui/tab.jsx";
import BookedSlots from "../../components/ui/BookedSlots.jsx";
import BlockedSlots from "../../components/ui/BlockedSlots.jsx";
import BoxMap from "../../components/ui/BoxMap.jsx";
const BoxDetail = () => {
  const { id } = useParams();
  const [box, setBox] = useState(
    ""
  );
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [activeTab, setActiveTab] = useState("details");
const [selectedQuarter, setSelectedQuarter] = useState("");
const [averageRating, setAverageRating] = useState("");
const [totalReviews, setTotalReviews] = useState("");

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchBoxDetails = async () => {
      try {
        const response = await api.get(`/boxes/public/${id}`);
        setBox(response.data);
      } catch (error) {
        console.error("Error fetching box details:", error);
        toast.error("Failed to load cricket box details");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxDetails();
  }, [id]);

const fetchReviews = async () => {
  setLoading(true);
 
  try {
    const res = await api.get(`/reviews/${id}`);
    setAverageRating(res.data.averageRating);
    setTotalReviews(res.data.reviewCount);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Refetch when box ID changes


  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    setAvailableTimes(false);
  };

//format date for api
  const formattedDate = selectedDate.toISOString().split("T")[0];
  const time = selectedTime.toString();


const handleCheckAvailability = async () => {
  if (!selectedDate || !selectedTime || !duration || !contactNumber) {
    toast.error("Please fill all details");
    return;
  }
  

  if (!isAuthenticated) {
    toast.error("Please log in to book a cricket box");
    navigate("/login", { state: { from: `/box/${id}` } });
    return;
  }
  if (!selectedQuarter) {
  toast.error("Please select a quarter");
  return;
}


  setIsCheckingAvailability(true);

  try {
    const response = await api.post("/booking/check-slot", {
      boxId: id,
      date: formattedDate,
       quarterId: selectedQuarter,
      startTime: time,
      duration,
    });

    const data = response.data;

    setAvailableTimes(data.available);

    if (data.message) {
      return toast.success(data.message);
    }

    toast.error(data.error || "Slot not available");
  } catch (error) {
    console.error("Error checking availability:", error);
    toast.error(
      error.response?.data?.message || "Failed to check availability"
    );
  } finally {
    setIsCheckingAvailability(false);
  }
};

  const handleBooking = async () => {
  if (!isAuthenticated) {
    toast.error("Please log in to book a cricket box");
    navigate("/login", { state: { from: `/box/${id}` } });
    return;
  }

  if (!selectedDate || !selectedTime || !duration) {
    toast.error("Please select date, time and duration");
    return;
  }
    if (!contactNumber) {
    toast.error("Please enter your contact number");
    return;
  }


  if (!availableTimes) {
    toast.error("This time is not available");
    return;
  }
  if (!selectedQuarter) {
  toast.error("Please select a quarter");
  return;
}


  setIsProcessingBooking(true);

  try {
    const response = await api.post("/booking/temp-booking", {
      boxId: id,
      date: formattedDate,
      startTime: time,
     quarterId: selectedQuarter,  // add this
      duration: duration,
      contactNumber,
    });

    toast.success("Your booking is confirmed");
    setAvailableTimes(false);
    console.log(response.data);
  } catch (error) {
    console.error("Error creating booking:", error);
    toast.error(
      error.response?.data?.message || "Failed to create booking"
    );
  } finally {
    setIsProcessingBooking(false);
  }
};





  // Mock data for demonstration
  const mockBox = {
    id: id,
    name: "Premium Cricket Box",
    description:
      "High-quality cricket practice box with advanced bowling machine and analytics. Perfect for players of all skill levels, from beginners to professionals. Features include adjustable bowling speed and pitch, video analysis, and comfortable waiting area.",
    location: "Central Sports Complex, New York",
    address: "123 Sports Avenue, NY 10001",
    hourlyRate: 45,
    image:
      "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    images: [
      "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      "https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    ],
    rating: 4.8,
    reviewCount: 24,
    features: [
      "Advanced bowling machine",
      "Video analysis",
      "Batting and bowling analytics",
      "Adjustable pitch conditions",
      "Comfortable waiting area",
      "Changing rooms",
    ],
    openingHours: {
      weekdays: "9:00 AM - 9:00 PM",
      weekends: "8:00 AM - 10:00 PM",
    },
    reviews: [
      {
        id: 1,
        user: "John Smith",
        rating: 5,
        comment:
          "Excellent facilities! The bowling machine is top-notch and the video analysis helped me improve my technique.",
        date: "2023-03-15",
      },
      {
        id: 2,
        user: "Sarah Johnson",
        rating: 4,
        comment:
          "Great place to practice. Well-maintained and the staff are very helpful.",
        date: "2023-02-28",
      },
      {
        id: 3,
        user: "Mike Roberts",
        rating: 5,
        comment: "Best cricket box in the area. Worth every penny!",
        date: "2023-02-10",
      },
    ],
  };

  const displayBox = box || mockBox;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === displayBox.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? displayBox.images.length - 1 : prevIndex - 1
    );
  };

   // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3500); // 4000ms = 4 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [currentImageIndex, displayBox.images.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (

    <div className="bg-base-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-2 ">
        {/* Image Gallery */}
        <div className="relative mb-6 rounded-lg overflow-hidden shadow-md">
      <div className="relative h-64 md:h-96">
        <img
          src={displayBox.images[currentImageIndex]}
          alt={displayBox.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
          key={currentImageIndex} // force re-render for smoothness
        />

        {displayBox.images?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors duration-300"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="flex space-x-2">
                {displayBox.images?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex
                        ? "bg-white"
                        : "bg-white/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

        {/* Box Details */}
        <Card className="mb-8 bg-base-300">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            {displayBox.name}
          </h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center mr-3">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className=" font-medium ml-1">
                {averageRating}
              </span>
              <span className=" ml-1">
                ({totalReviews} reviews)
              </span>
            </div>
            <div className="flex items-center ">
              <MapPin size={16} className="mr-1" />
              <span>{displayBox.location}</span>
            </div>



          </div>

          <p className=" mb-6">
            {displayBox.description}
          </p>

          <div className="border-t  pt-6 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Facilities & Amenities
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displayBox?.features.map((features, index) => (
                <li
                  key={index}
                  className="flex items-center "
                >
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {features}
                </li>
              ))}
            </ul>
          </div>

          {/* quaters */}
          <div className="border-t  pt-6 mb-6">
  <h2 className="text-xl font-semibold text-primary mb-4">
    Available Boxes
  </h2>
  <div className="flex flex-wrap gap-2 ">
    {Array.isArray(displayBox.quarters) && displayBox.quarters.length > 0 ? (
      displayBox.quarters?.map((quarter, index) => (
        <span
          key={index}
          className="px-3 py-2 bg-primary text-primary-content   rounded-full "
        >
          {quarter.name}
        </span>
      ))
    ) : (
      <p>No quarters available</p>
    )}
  </div>
</div>


          <div className="border-t border-base  pt-6 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Opening Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div className="flex items-center">
                <Clock
                  size={18}
                  className="mr-2 text-primary"
                />
                <div>
                  <p className="font-medium">Weekdays</p>
                  <p>{displayBox.openingHours.weekdays}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar
                  size={18}
                  className="mr-2 text-primary"
                />
                <div>
                  <p className="font-medium">Weekends</p>
                  <p>{displayBox.openingHours.weekends}</p>
                </div>
              </div>
            </div>
          </div>

         <div className="border-t border-base  pt-6">
  <h2 className="text-xl font-semibold text-primary mb-4">
    Location
  </h2>

  {displayBox?.coordinates.lat ? (
    <BoxMap
      lat={displayBox.coordinates?.lat}
      lng={displayBox.coordinates?.lng}
      name={displayBox.name}
    />
  ) : (
    <div className="w-full h-64 bg-base-200 text-center text-primary flex items-center justify-center rounded-lg">
      <p className="text-primary">No map available for this box</p>
    </div>
  )}

  <p className="text-primary ">
    <span className="font-medium">Address:</span> {displayBox?.address || 'No address provided'}
  </p>
</div>

        </Card>
       

{isAuthenticated &&
<div className="mb-6">
  <Tabs
    tabs={[
      { label: "Details", value: "details" },
      { label: "Booked", value: "booked" },
      { label: "Blocked", value: "blocked" },
      { label: "Review", value: "reviews" },
    ]}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  />
</div>
}





      </div>
      
      
{activeTab === "details" && (
  <>
   
      {/* Booking Widget */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <Card className="mb-6 bg-base-300">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold text-primary">
                ₹{displayBox.hourlyRate}
                <span className="text-sm font-normal">
                  /hour
                </span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="  font-medium ml-1">
                  {averageRating}
                </span>
              </div>
            </div>

            <div className="form-control  mb-4">
              
              <label className="text-primary">
                Date
              </label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setAvailableTimes(false)
                    
                  }}
                  minDate={new Date()}
            className="input input-bordered  w-full bg-base-100 text-[16px] dark:text-white"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            </div>


  {/* Contact Number */}
        <div className="form-control mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-primary">Contact Number</span>
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Enter contact number"
            className="input input-bordered  w-full text-[16px] bg-base-100 "
            required
          />
</div>

            

          
        {/* Time Picker */}
        <div className=" mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-primary">Time</span>
          </label>
          <div className="grid grid-cols-1 gap-2  ">
            <TimePicker value={selectedTime} onChange={handleTimeChange} />
            <p className="text-sm text-primary ">Selected Time: {selectedTime || "None"}</p>
          </div>
        </div>


            <div className="mb-6">
              <label className="block text-sm- text-primary font-medium  mb-1">
                Duration (hours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
            className="input input-bordered text-[16px]  w-full bg-base-100 "
              >
                {[1, 2, 3, 4].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} hour{hours > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

<div className="mb-4">
  <label className="block text-sm font-medium mb-1 text-primary">Select your Box:</label>
  <select
    value={selectedQuarter}
    onChange={(e) => setSelectedQuarter(e.target.value)}
            className="input input-bordered text-[16px] w-full bg-base-100 "
  >
    <option className="bg-base-100" value="">-- Select a Boxes --</option>
    {displayBox.quarters?.map((quarter) => (
      <option className="bg-base-100"
        key={quarter._id}
        value={quarter._id}
        disabled={!quarter.isAvailable}
      >
        {quarter.name}-Box {quarter.isAvailable ? "" : "(Unavailable)"}
      </option>
    ))}
  </select>
</div>


            <Button
              onClick={handleCheckAvailability}
              variant="secondary"
              fullWidth
              isLoading={isCheckingAvailability}
              className="mb-4"
            >
              Check Availability
            </Button>

            {selectedTime && (
              <div className="bg-base-100 p-4 rounded-md mb-6">
                <h3 className="font-semibold text-primary  mb-2">
                  Booking Summary
                </h3>
                <div className="text-sm   space-y-1">
                  <div className="flex justify-between ">
                    <span className="">  Date:</span>
                    <span className="font-medium ">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium  ">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between ">
                    <span className="">Duration:</span>
                    <span className="font-medium  ">
                      {duration} hour{duration > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="border-t  my-2 pt-2 flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold text-red-600">
                      ${displayBox.hourlyRate * duration}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {contactNumber && availableTimes && duration && selectedDate && selectedTime && (
              <Button
                onClick={handleBooking}
                fullWidth
                isLoading={isProcessingBooking}
              >
                Book Now
              </Button>
            )}
          </Card>

          <div className="bg-base-300  p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <Info
                size={20}
                className="mr-2 mt-0.5 text-primary flex-shrink-0"
              />
              <div className="text-sm ">
                <p className="font-medium mb-1 text-primary">Booking Policy</p>
                <ul className="space-y-1 list-disc list-inside ">
                  <li>
                    Cancellation allowed up to 24 hours before booking time
                  </li>
                  <li>Payment is processed upon booking confirmation</li>
                  <li>Please arrive 15 minutes before your slot</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  </>
)}
{activeTab === "reviews" && <ReviewsSection boxId={box._id} />}
{activeTab === "booked" && (
  <BookedSlots boxId={box._id} />
)}

{activeTab === "blocked" && (
  <BlockedSlots boxId={box._id} />
)}

    </div>

   
  );
};

export default BoxDetail;
