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
      const response = await fetch('http://localhost:5001/api/owners/booking', {
       credentials:"include"
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
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
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update booking status');

      toast.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.boxName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'upcoming') return matchesSearch && new Date(booking.date) > new Date() && booking.status !== 'cancelled';
    if (filter === 'past') return matchesSearch && new Date(booking.date) < new Date() && booking.status !== 'cancelled';
    if (filter === 'cancelled') return matchesSearch && booking.status === 'cancelled';

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

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
            <Card key={booking.id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {booking.user.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {booking.boxName}
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
                    ${booking.price}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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