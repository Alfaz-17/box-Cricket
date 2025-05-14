import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, Download, Share2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { bookingId, boxName } = location.state || {};
  
  // If no booking data in state, redirect to bookings page
  useEffect(() => {
    if (!bookingId) {
      navigate('/my-bookings');
    }
  }, [bookingId, navigate]);
  
  // Mock booking data for demonstration
  const booking = {
    id: bookingId || '123',
    boxName: boxName || 'Premium Cricket Box',
    location: 'Central Sports Complex, New York',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '12:00',
    duration: 2,
    confirmationNumber: 'CB' + (bookingId || '123') + Date.now().toString().substr(-4),
    bookingDate: new Date().toISOString()
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Cricket Box Booking',
        text: `I've booked ${booking.boxName} for ${formatDate(booking.date)} at ${booking.startTime}.`,
        url: window.location.href
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      alert('Sharing is not supported in your browser');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your cricket box has been successfully booked. Check your email for confirmation details.
        </p>
      </div>
      
      <Card className="mb-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Booking Reference
          </h2>
          <div className="text-2xl font-mono font-bold text-yellow-900 dark:text-yellow-300">
            {booking.confirmationNumber}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Booked on {new Date(booking.bookingDate).toLocaleString()}
          </div>
        </div>
        
        <div className="text-left mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
            Booking Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Calendar size={18} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(booking.date)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Date
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Clock size={18} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {booking.startTime} - {booking.endTime} ({booking.duration} hour{booking.duration > 1 ? 's' : ''})
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Time
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <MapPin size={18} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {booking.boxName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {booking.location}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="secondary" 
            className="flex items-center justify-center"
            onClick={shareBooking}
          >
            <Share2 size={18} className="mr-2" />
            Share
          </Button>
          <Button 
            variant="secondary" 
            className="flex items-center justify-center"
          >
            <Download size={18} className="mr-2" />
            Download
          </Button>
        </div>
      </Card>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/my-bookings" className="flex-1">
          <Button fullWidth>
            View My Bookings
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button variant="secondary" fullWidth>
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Need help with your booking? 
          <a href="#" className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300 ml-1">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default BookingSuccess;