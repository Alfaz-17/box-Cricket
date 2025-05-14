import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/booking/my-booking', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch bookings');
        }
        
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load your bookings');
        
        // Mock data for demo
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const response = await fetch(`/api/booking/cancel/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }
      
      // Update booking status
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        )
      );
      
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
      
      // For demo, update anyway
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        )
      );
    }
  };
  
  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date + 'T' + booking.startTime);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return bookingDate > now && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return bookingDate < now && booking.status !== 'cancelled';
    } else {
      return booking.status === 'cancelled';
    }
  });
  
  // Mock data for demonstration
  const mockBookings = [
    {
      id: '1',
      boxId: '1',
      boxName: 'Premium Cricket Box',
      location: 'Central Sports Complex',
      date: '2025-06-15',
      startTime: '10:00',
      endTime: '12:00',
      duration: 2,
      price: 90,
      status: 'confirmed',
      boxImage: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: '2',
      boxId: '2',
      boxName: 'Standard Cricket Net',
      location: 'Community Park',
      date: '2025-06-05',
      startTime: '14:00',
      endTime: '15:00',
      duration: 1,
      price: 25,
      status: 'completed',
      boxImage: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: '3',
      boxId: '3',
      boxName: 'Professional Training Box',
      location: 'Sports Academy',
      date: '2025-05-20',
      startTime: '16:00',
      endTime: '18:00',
      duration: 2,
      price: 120,
      status: 'cancelled',
      boxImage: 'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];
  
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-300 mb-6">
        My Bookings
      </h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'upcoming'
                  ? 'text-yellow-600 dark:text-yellow-300 border-b-2 border-yellow-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'past'
                  ? 'text-yellow-600 dark:text-yellow-300 border-b-2 border-yellow-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'cancelled'
                  ? 'text-yellow-600 dark:text-yellow-300 border-b-2 border-yellow-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No {activeTab} bookings found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming bookings." 
                : activeTab === 'past' 
                  ? "You don't have any past bookings." 
                  : "You don't have any cancelled bookings."}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/">
                <Button variant="primary">
                  Browse Cricket Boxes
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map(booking => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCancel={() => cancelBooking(booking.id)} 
              showCancelButton={activeTab === 'upcoming'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, onCancel, showCancelButton }) => {
  const getStatusBadge = (status) => {
    if (status === 'confirmed') {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Confirmed</span>
        </div>
      );
    } else if (status === 'completed') {
      return (
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (status === 'pending') {
      return (
        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
          <AlertCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Pending</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400">
          <XCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Cancelled</span>
        </div>
      );
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <Card>
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 w-full h-32 sm:h-auto">
          <img 
            src={booking.boxImage} 
            alt={booking.boxName} 
            className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
          />
        </div>
        <div className="sm:w-2/3 p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
              {booking.boxName}
            </h3>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
              <span>{booking.startTime} - {booking.endTime} ({booking.duration} hour{booking.duration > 1 ? 's' : ''})</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
              <span>{booking.location}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              ${booking.price}
            </div>
            <div className="flex space-x-2">
              <Link to={`/box/${booking.boxId}`}>
                <Button variant="secondary" size="sm">
                  View Box
                </Button>
              </Link>
              
              {showCancelButton && booking.status === 'confirmed' && (
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MyBookings;