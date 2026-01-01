import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  ChevronLeft,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import 'react-datepicker/dist/react-datepicker.css'

import AuthContext from '../../context/AuthContext'
import { Button } from '@/components/ui/Button'
import api from '../../utils/api.js'
import socket from "../../utils/soket.js";
import AnimatedShaderBackground from '../../components/ui/AnimatedShaderBackground'
import PaymentGateway from '../../components/PaymentGateway'

// Components
import BookingForm from '../../components/ui/BookingForm'


const BoxBooking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)

  const [box, setBox] = useState(null)
  const [loading, setLoading] = useState(true)
  


  // Booking State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState([]) // New state for slots
  const [bookedSlots, setBookedSlots] = useState([]) // New state for fetched booked slots
  const [blockedSlots, setBlockedSlots] = useState([]) // New state for fetched blocked slots
  
  const [isProcessingBooking, setIsProcessingBooking] = useState(false)
  const [contactNumber, setContactNumber] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [paymentData, setPaymentData] = useState(null) // Add payment data state

  // Get retry ID from URL if any
  const [searchParams] = useSearchParams();
  const retryId = searchParams.get('retry');

  // Load retry booking details
  
  useEffect(() => {
    if (retryId) {
      const fetchRetryBooking = async () => {
        try {
          const response = await api.get(`/booking/report/${retryId}`);
          const b = response.data;
          // Set form state from existing booking
          setSelectedDate(new Date(b.date));
          setContactNumber(b.contactNumber);
          setSelectedQuarter(b.quarterId || '');
          // Note: Slots might need to be re-selected by user to ensure availability
          toast.success('Retrying payment for previous booking');
        } catch (error) {
          console.error('Error fetching retry booking:', error);
        }
      };
      fetchRetryBooking();
    }
  }, [retryId]);

  // Socket connection
  useEffect(() => {
    socket.emit("join-box", `box-${id}`);
    return () => socket.emit("leave-box", `box-${id}`);
  }, [id]);


  

  // Fetch Box Details
  useEffect(() => {
    const fetchBoxDetails = async () => {
      try {
        const response = await api.get(`/boxes/public/${id}`)
        setBox(response.data)
      } catch (error) {
        console.error('Error fetching box details:', error)
        toast.error('Failed to load cricket box details')
      } finally {
        setLoading(false)
      }
    }
    fetchBoxDetails()
  }, [id]);

  // Fetch Booked/Blocked Slots
  const fetchSlots = async () => {
    try {
      const res = await api.get(`/slots/booked-blocked-slots/${id}`)
      setBookedSlots(res.data.bookedSlots || [])
      setBlockedSlots(res.data.blockedSlots || [])
    } catch (error) {
      console.error('Failed to fetch slots:', error)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [id])

  // Listen for real-time updates to refresh slots
  useEffect(() => {
    socket.on("new-booking", data => {
      toast.success("New Booking created");
      fetchSlots()
    })

    socket.on("slot-blocked", data => {
      toast.success("Slot blocked by admin");
      fetchSlots()
    })

    socket.on("slot-unblocked", data => {
      toast.success("Slot unblocked by admin");
      fetchSlots()
    })

    return () => {
      socket.off("new-booking")
      socket.off("slot-blocked")
      socket.off("slot-unblocked")
    }
  }, [])


  const formattedDate = selectedDate.toISOString().split('T')[0]
  
  // Derived values from selectedSlots
  const startTime = selectedSlots.length > 0 ? selectedSlots[0].startTime : ''
  const duration = selectedSlots.length

  // Debug isOwner check
  const isOwnerCheck = isAuthenticated && user?.role === 'owner' && box?.owner === user?._id;
  useEffect(() => {
    if (box && user) {
        console.log('🔍 isOwner Debug:', {
            isAuthenticated,
            userRole: user?.role,
            boxOwner: box?.owner,
            userId: user?._id,
            isOwner: isOwnerCheck
        });
    }
  }, [box, user, isAuthenticated]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box')
      navigate('/login', { state: { from: `/box/${id}/booking` } })
      return false
    }

    if (!selectedDate || !startTime || !duration || !selectedQuarter) {
      toast.error('Please select all booking details')
      return false
    }

    if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
      toast.error('Enter a valid 10-digit contact number')
      return false
    }

    setIsProcessingBooking(true)

    try {
      console.log('🔵 Step 1: Creating booking...')
      // Step 1: Create booking
      const bookingResponse = await api.post('/booking/temporary-booking', {
        boxId: id,
        quarterId: selectedQuarter,
        date: formattedDate,
        startTime: startTime,
        duration,
        contactNumber,
      })

      console.log('✅ Booking response:', bookingResponse.data)
      const { bookingId, isOffline } = bookingResponse.data
      console.log('📝 Booking ID:', bookingId)

      if (!bookingId) {
        throw new Error('No booking ID received from server')
      }

      // 🚨 ADMIN OFFLINE FLOW: Skip payment initiate if isOffline is true
      if (isOffline) {
        toast.success('Offline booking confirmed successfully!')
        setSelectedSlots([]) // Clear selection
        setIsProcessingBooking(false)
        fetchSlots() // Refresh locked slots
        return true // Success
      }

      console.log('🔵 Step 2: Initiating payment...')
      // Step 2: Initiate payment
      const paymentResponse = await api.post('/payment/initiate', {
        bookingId
      })

      console.log('✅ Payment response:', paymentResponse.data)

      if (!paymentResponse.data.spURL || !paymentResponse.data.encData) {
        throw new Error('Invalid payment data received')
      }

      console.log('🔵 Step 3: Setting payment data for redirect...')
      // Step 3: Set payment data to trigger redirect
      setPaymentData(paymentResponse.data)

      toast.success('Redirecting to payment gateway...')
      setSelectedSlots([]) // Clear selection
      return true // Success

    } catch (error) {
      console.error('❌ Booking/Payment Error:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || error.message || 'Failed to create booking or initiate payment')
      setIsProcessingBooking(false)
      return false // Failure
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!box) return <div>Box not found</div>

  // If payment data is available, show payment gateway
  if (paymentData) {
    return <PaymentGateway paymentData={paymentData} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Full-Width Header Section */}
      <div className="w-full border-b border-border/40">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(`/box/${id}`)}
              className="hover:bg-primary/5 group transition-all duration-200 -ml-2"
            >
              <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </Button>
          </motion.div>

          {/* Page Header - Single Line */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            {/* Box Name */}
            <h1 
              className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-none font-display"
            >
              {box.name}
            </h1>

            {/* Pricing */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary leading-none" style={{ fontFamily: 'Bebas Neue' }}>
                ₹{box.hourlyRate}
              </span>
              <span className="text-sm text-muted-foreground">/hr</span>
              {box.weekendHourlyRate && box.weekendHourlyRate !== box.hourlyRate && (
                <span className="text-xs text-muted-foreground ml-2">
                  (₹{box.weekendHourlyRate}/hr weekends)
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full-Width Booking Form */}
      <div className="w-full">
        <div className="max-w-[1600px] mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <BookingForm
                displayBox={box}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedSlots={selectedSlots}
                onSlotSelect={setSelectedSlots}
                bookedSlots={bookedSlots}
                blockedSlots={blockedSlots}
                contactNumber={contactNumber}
                setContactNumber={setContactNumber}
                selectedQuarter={selectedQuarter}
                setSelectedQuarter={setSelectedQuarter}
                isProcessingBooking={isProcessingBooking}
                handleBooking={handleBooking}
                isOwner={isAuthenticated && user?.role === 'owner' && box?.owner === user?._id}
                boxId={id}
                onSlotsUpdate={fetchSlots}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default BoxBooking
