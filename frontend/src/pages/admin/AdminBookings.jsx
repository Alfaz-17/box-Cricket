import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Calendar, Clock, MapPin, User, Search, Phone } from "lucide-react";
import api from "../../utils/api";
import { formatDate } from "../../utils/formatDate";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled
  const [selectedQuarter, setSelectedQuarter] = useState("all");



  useEffect(() => {
    fetchBookings();
  }, []);


  //fetch admin booking api
  const fetchBookings = async () => {
    try {
      const response = await api.get("/booking/owner-bookings");
      const data = response.data;
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

//get unique Quaters for filter
  const uniqueQuarters = Array.from(
    new Set(
      bookings.flatMap((b) =>
        b.box && Array.isArray(b.box.quarters)
          ? b.box.quarters.map((q) => q.name)
          : []
      )
    )
  );

  //add filter by username, boxname ,status and quaters
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.box.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && booking.status === "confirmed") ||
      (filter === "past" && booking.status === "completed") ||
      (filter === "cancelled" && booking.status === "cancelled");

    const matchesQuarter =
      selectedQuarter === "all" || booking.quarterName === selectedQuarter;

    return matchesSearch && matchesFilter && matchesQuarter;
  });


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary w-12 h-12"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold  mb-4">Booking Management</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          {/* Search Input */}
          <div className="form-control w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Search by user or box name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered text-[16px] w-full pl-10"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-primary" />
          </div>

          {/* Status Filter */}
          <div className="form-control w-full md:w-1/4">
            <label className="label">
              <span className="label-text text-primary">Filter by Status</span>
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Quarter Filter */}
          {uniqueQuarters.length > 0 && (
            <div className="form-control w-full md:w-1/4">
              <label className="label">
                <span className="label-text text-primary">
                  Filter by Quarter
                </span>
              </label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="all">All Quarters</option>
                {uniqueQuarters.map((quarter) => (
                  <option key={quarter} value={quarter}>
                    {quarter}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Bookings list */}
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="card bg-base-200 shadow border border-base-300 p-5 rounded-2xl"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                {/* Left section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-base-content">
                    <User size={18} className=" text-primary" />
                    <span className="font-semibold">{booking.user}</span>
                  </div>
                  <div className="flex items-center gap-2 ">
                    <MapPin size={18} className="text-primary" />
                    <span>{booking.box.name}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 rounded-md  font-medium text-sm">
                    <Calendar size={18} />
                    <span>{formatDate(booking.date)}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2  rounded-md  font-medium text-sm">
                    <Clock size={18} />
                    <span>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 t">
                    <Phone size={18} className="text-success" />
                    <span>
                      {booking.contactNumber ? (
                        <a
                          href={`tel:${booking.contactNumber}`}
                          className="link link-hover"
                        >
                          {booking.contactNumber}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>

                    <div className="flex items-center gap-2 ">
                    <span>
                
                       
                          {booking.quarterName}

                    </span>
                  </div>

                </div>
                

                {/* Right section */}
                <div className="text-right space-y-1">
                  <div className="text-lg font-bold text-base-content">
                    ${booking.amountPaid}
                  </div>
                  <div>
                    <span
                      className={`badge badge-lg ${
                        booking.status === "confirmed"
                          ? "badge-success"
                          : booking.status === "completed"
                          ? "badge-warning text-warning-content"
                          : "badge-error"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="card bg-base-200 shadow p-6 rounded-2xl text-center">
              <p className="text-base-content">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
