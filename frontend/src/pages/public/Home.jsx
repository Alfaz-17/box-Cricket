import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Clock, Calendar, Filter } from "lucide-react";

import api from "../../utils/api";
import BookMyBoxLogo from '../../assets/cri.png';
import TimePicker from "../../components/ui/TimePicker";

const Home = () => {
  const [boxes, setBoxes] = useState([]);
  const [filteredBoxes, setFilteredBoxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState({

  date: "",
  startTime: "",
  duration: "",
});






  const fetchFilteredBoxes = async () => {
  try {
    setIsLoading(true);
    const payload = {
      date: filters.date,
      startTime: filters.startTime , // default if needed
      duration: filters.duration || 2,
    };
    console.log(filters.startTime)
    const response = await api.post("/boxes/availableBoxes", payload); 
    setFilteredBoxes(response.data);
    console.log(response.data)

  } catch (error) {
    console.error("Error fetching filtered boxes:", error);
  } finally {
    setIsLoading(false);
  }
};

    const fetchBoxes = async () => {
      try {
        const response = await api.get("/boxes/public");
        const data = response.data;
        console.log(data)

        setBoxes(data);
        setFilteredBoxes(data);
      } catch (error) {
        console.error("Error fetching boxes:", error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {


    fetchBoxes();
  }, []);



  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
    
      date: "",
      startTime:"",
      duration:""
    });
    setSearchQuery("");
  };

  return (
    <div>
      <section className="relative mb-12">
     <div className="bg-base-300 rounded-xl shadow-xl overflow-hidden">
  <div className="relative  z-10 p-8 md:p-12 lg:p-16">
       <h1 style={{ fontFamily: "Bebas Neue" }} className=" flex text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
  <img
          className="h-30 mt-[-40px] mx-[-30px] w-30  "
          src={BookMyBoxLogo}
          alt="BookMyBox Logo"
        />   Book.. play.. win..</h1>
    <h1 style={{ fontFamily: "Bebas Neue" }} className=" mt-[-20px] text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
      Find and Book Cricket Boxes
    </h1>
     
    <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
      Reserve top-quality cricket boxes for both practice sessions and matches. Experience the best facilities to elevate your game.
    </p>

    {/* Search & Filter Container */}
    <div className="bg-base-100 dark:bg-base-300 p-4 rounded-box shadow-md max-w-3xl">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-grow">
          <label className="input input-bordered text-base flex items-center gap-2 w-full">
            <Search className="w-5 h-5 text-base-content" />
            <input
              id="search"
              type="text"
              placeholder="Search by name, location, or description"
              className="grow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Toggle Filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline btn-secondary flex items-center justify-center"
        >
          <Filter size={18} className="mr-2" />
          Filters
        </button>

        {/* Search Button */}
        <button className="btn btn-primary">Search</button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          

          {/* Date Filter */}
<div>
  <label className="label text-sm font-medium text-base-content">
    Date
  </label>
  <input
    type="date"
    id="date"
    name="date"
    value={filters.date}
    onChange={handleFilterChange}
    className="input input-bordered w-full text-base"
  />
</div>

{/* Start Time Filter */}
 <div className=" mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-primary">Time</span>
          </label>
          <div className="grid grid-cols-1 gap-2  ">
<TimePicker
  value={filters.startTime}
  onChange={(value) =>
    setFilters((prev) => ({
      ...prev,
      startTime: value,
    }))
  }
/>
            <p className="text-sm text-primary ">Selected Time: {filters.startTime }</p>
          </div>
        </div>

{/* Duration Filter */}
<div>
  <label className="label text-sm font-medium text-base-content">
    Duration (hours)
  </label>
  <input
    type="number"
    id="duration"
    name="duration"
    min="1"
    placeholder="2"
    value={filters.duration}
    onChange={handleFilterChange}
    className="input input-bordered w-full text-base"
  />
</div>


     

          {/* Filter Actions */}
          <div className="md:col-span-3 flex justify-end gap-2">
            <button
              className="btn btn-outline btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
 <button
  className="btn btn-primary"
  onClick={() => {
    setShowFilters(false);
    fetchFilteredBoxes();
  }}
>
  Apply Filters
</button>

          </div>
        </div>
      )}
    </div>
  </div>
</div>

      </section>

      {/* Boxes Section */}
      {/* Boxes Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontFamily: "Bebas Neue" }} className="text-2xl font-bold ">Available Cricket Boxes</h2>
          <div className="text-sm text-base-content/70">
            Showing {filteredBoxes.length} results
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card bg-base-100 shadow-md animate-pulse h-80"
              >
                <div className="w-full h-40 bg-base-200 rounded-md mb-4" />
                <div className="h-6 bg-base-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-base-200 rounded w-1/2 mb-4" />
                <div className="h-4 bg-base-200 rounded w-5/6 mb-2" />
                <div className="h-4 bg-base-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredBoxes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoxes.map((box) => (
              <BoxCard key={box._id} box={box} />
            ))}
          </div>
        ) : (
          <div className="text-center text-base-content/70 py-10">
            No boxes available at the moment.
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="mt-20 ">
        <h2 className="text-2xl font-bold text-center  mb-10">
          Why Choose Our Cricket Box Booking Platform?
        </h2>

        <div className=" grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-base-300 shadow-md p-6 text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 mx-auto bg-primary-content  rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary ">
              Easy Booking
            </h3>
            <p className="text-base-content/70">

              Find and book cricket boxes with just a few clicks. Filter by
              location, price, and availability.
            </p>
          </div>

          <div className="card bg-base-300 shadow-md p-6 text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 mx-auto bg-primary-content  rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary " />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary ">
              Real-time Availability
            </h3>
            <p className="text-base-content/70">
              Check real-time availability and secure your preferred time slots
              instantly.
            </p>
          </div>

          <div className="card bg-base-300 shadow-md p-6 text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 mx-auto bg-primary-content  rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary ">
              Quality Locations
            </h3>
            <p className="text-base-content/70">
              Access to premium cricket boxes and facilities in convenient
              locations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Box Card Component
const BoxCard = ({ box }) => {
  return (
    <div className="card bg-base-300  shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
      <figure className="relative h-48 overflow-hidden">
        <img
          src={
            box.image
              ? box.image
              : "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          }
          alt={box.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2">
          <div className="badge bg-red-500  text-white font-bold text-sm">
            ₹{box.hourlyRate}/hr
          </div>
        </div>
      </figure>

      <div className="card-body p-4">
        <h3 style={{ fontFamily: "Bebas Neue" }} className="card-title text-primary  text-lg">{box.name}</h3>

        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm   ml-1">{4}</span>
          </div>
          <span className="text-xs not-first-of-type:">
            (1 reviews)
          </span>
        </div>

        <div className="flex items-center text-sm  dark:text-gray-400 mb-3">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{box.location}</span>
        </div>

        <p className="text-sm line-clamp-2 mb-4">{box.description}</p>

        <Link to={`/box/${box._id}`}>
          <button className="btn btn-primary btn-block">View Details</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
