import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, User, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/owners/bookings', {
       credentials:"include"
      });
      const data = await response.json();
  
      
      setBookings(data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/booking/status/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          
        },
        credentials:"include",
        body: JSON.stringify({ paymentStatus: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update booking status');

      toast.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
  const matchesSearch =
    booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.box.name.toLowerCase().includes(searchTerm.toLowerCase());

  if (filter === 'all') return matchesSearch;


  if (filter === 'upcoming') {
    return (
      matchesSearch &&
      booking.status === 'confirmed' 
    );
  }

  if (filter === 'past') {
    return matchesSearch && booking.status === 'completed';
  }

  if (filter === 'cancelled') {
    return matchesSearch && booking.status === 'cancelled';
  }

  return matchesSearch;
});

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">
          Booking Management
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search by user or box name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'primary' : 'secondary'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'past' ? 'primary' : 'secondary'}
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'primary' : 'secondary'}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {booking.user}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {booking.box.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(booking.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    ${booking.amountPaid}
                  </div>
                  <div className="flex space-x-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                  booking.status === 'complete' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredBookings.length === 0 && (
            <Card>
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;