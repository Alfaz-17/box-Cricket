import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, User, Search ,Phone} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import api from '../../utils/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/booking/owner-bookings');
      const data = response.data;
      setBookings(data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueQuarters = Array.from(
    new Set(
      bookings.flatMap(b =>
        b.box && Array.isArray(b.box.quarters)
          ? b.box.quarters.map(q => q.name)
          : []
      )
    )
  );

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.box.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'upcoming' && booking.status === 'confirmed') ||
      (filter === 'past' && booking.status === 'completed') ||
      (filter === 'cancelled' && booking.status === 'cancelled');

    const matchesQuarter =
      selectedQuarter === 'all' ||
      booking.quarterName === selectedQuarter;

    return matchesSearch && matchesFilter && matchesQuarter;
  });

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">
          Booking Management
        </h1>
<div className="flex flex-col md:flex-row items-center gap-4 mb-6">
  <div className="relative w-full md:w-1/3">
    <Input
      placeholder="Search by user or box name"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
    />
    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
  </div>

  <div className="flex flex-wrap gap-2">
    {[
      { label: 'All', value: 'all' },
      { label: 'Upcoming', value: 'upcoming' },
      { label: 'Past', value: 'past' },
      { label: 'Cancelled', value: 'cancelled' },
    ].map((item) => (
      <button
        key={item.value}
        className={`px-4 py-2 rounded-md text-sm font-medium transition 
          border ${
            filter === item.value
              ? 'bg-green-600 text-white border-green-600 shadow'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-700'
          }`}
        onClick={() => setFilter(item.value)}
      >
        {item.label}
      </button>
    ))}
  </div>

  {uniqueQuarters.length > 0 && (
    <div className="flex flex-wrap gap-2">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition 
          border ${
            selectedQuarter === 'all'
              ? 'bg-green-600 text-white border-green-600 shadow'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-700'
          }`}
        onClick={() => setSelectedQuarter('all')}
      >
        All Quarters
      </button>
      {uniqueQuarters.map((quarter) => (
        <button
          key={quarter}
          className={`px-4 py-2 rounded-md text-sm font-medium transition 
            border ${
              selectedQuarter === quarter
                ? 'bg-green-600 text-white border-green-600 shadow'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-700'
            }`}
          onClick={() => setSelectedQuarter(quarter)}
        >
          {quarter}
        </button>
      ))}
    </div>
  )}
</div>




        {/* Bookings list */}
<div className="space-y-3">
  {filteredBookings.map((booking) => (
    <Card
      key={booking._id}
      className="p-5 rounded-2xl shadow hover:shadow-md transition duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Left section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <User size={18} className="text-yellow-500" />
            <span className="font-semibold">{booking.user}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin size={18} className="text-yellow-500" />
            <span>{booking.box.name}</span>
          </div>

          {/* Highlighted Date */}
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900 rounded-md text-yellow-700 dark:text-yellow-300 font-medium text-sm">
            <Calendar size={18} />
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>

          {/* Highlighted Time */}
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900 rounded-md text-yellow-700 dark:text-yellow-300 font-medium text-sm">
            <Clock size={18} />
            <span>
              {booking.startTime} - {booking.endTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone size={18} className="text-green-500" />
            <span>
              {booking.contactNumber ? (
                <a href={`tel:${booking.contactNumber}`} className="hover:underline">
                  {booking.contactNumber}
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
        </div>

        {/* Right section */}
        <div className="space-y-1 text-right">
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
            ${booking.amountPaid}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block
              ${
                booking.status === 'confirmed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : booking.status === 'completed'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>
    </Card>
  ))}

  {filteredBookings.length === 0 && (
    <Card className="p-6 rounded-2xl text-center bg-white dark:bg-gray-800">
      <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
    </Card>
  )}
</div>


      </div>
    </div>
  );
};

export default AdminBookings;
