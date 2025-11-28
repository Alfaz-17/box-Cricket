import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Calendar, Clock, MapPin, Phone, ArrowRight, Star, CheckCircle2, Award, Target } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from '../../components/ui/TimePicker';
import BookedSlots from '../../components/ui/BookedSlots.jsx';
import BlockedSlots from '../../components/ui/BlockedSlots.jsx';
import ReviewsSection from '../../components/ui/ReviewsSection';
import api from '../../utils/api.js';
import socket from '../../utils/soket.js';
import AuthContext from '../../context/AuthContext';

/**
 * BookingTabs component – extracted from BoxDetail.
 * It handles all tab UI (booking, booked slots, blocked slots, reviews) and related logic.
 * Props:
 *   boxId: the id of the box to operate on.
 */
const BookingTabs = ({ boxId }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('booking');

  // Booking form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [availableTimes, setAvailableTimes] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');

  const formattedDate = selectedDate.toISOString().split('T')[0];
  const time = selectedTime.toString();

  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    setAvailableTimes(false);
  };

  const handleCheckAvailability = async () => {
    if (!selectedDate || !selectedTime || !duration || !contactNumber) {
      toast.error('Please fill all details');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box');
      navigate('/login', { state: { from: `/box/${boxId}` } });
      return;
    }
    if (!selectedQuarter) {
      toast.error('Please select a quarter');
      return;
    }
    setIsCheckingAvailability(true);
    try {
      const response = await api.post('/booking/check-slot', {
        boxId,
        date: formattedDate,
        quarterId: selectedQuarter,
        startTime: time,
        duration,
      });
      const data = response.data;
      setAvailableTimes(data.available);
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Slot not available');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error(error.response?.data?.message || 'Failed to check availability');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box');
      navigate('/login', { state: { from: `/box/${boxId}` } });
      return;
    }
    if (!selectedDate || !selectedTime || !duration || !selectedQuarter) {
      toast.error('Please select all booking details');
      return;
    }
    if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
      toast.error('Enter a valid 10-digit contact number');
      return;
    }
    if (!availableTimes) {
      toast.error('This time is not available');
      return;
    }
    setIsProcessingBooking(true);
    try {
      await api.post('/booking/temporary-booking', {
        boxId,
        quarterId: selectedQuarter,
        date: formattedDate,
        startTime: time,
        amountPaid: '500',
        duration,
        contactNumber,
      });
      toast.success('🎉 Temporary booking confirmed!');
      setAvailableTimes(false);
    } catch (error) {
      console.error('Error booking :', error);
      toast.error(error.response?.data?.message || 'Failed to create a booking');
    } finally {
      setIsProcessingBooking(false);
    }
  };

  // Render tabs UI – identical to original implementation (trimmed for brevity)
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full flex lg:grid lg:grid-cols-4 bg-muted/50 p-1 rounded-xl mb-6 gap-1 overflow-x-auto scrollbar-hide">
        <TabsTrigger value="booking" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
          Book Slot
        </TabsTrigger>
        {isAuthenticated && (
          <>
            <TabsTrigger value="booked" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              Booked
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              Blocked
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              Reviews
            </TabsTrigger>
          </>
        )}
      </TabsList>

      {/* Booking Form */}
      <TabsContent value="booking" id="booking-section">
       
      </TabsContent>

      <TabsContent value="booked">
        <BookedSlots boxId={boxId} />
      </TabsContent>
      <TabsContent value="blocked">
        <BlockedSlots boxId={boxId} />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewsSection boxId={boxId} />
      </TabsContent>
    </Tabs>
  );
};

export default BookingTabs;
