import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  ChevronLeft,
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

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box')
      navigate('/login', { state: { from: `/box/${id}/booking` } })
      return
    }

    if (!selectedDate || !startTime || !duration || !selectedQuarter) {
      toast.error('Please select all booking details')
      return
    }

    if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
      toast.error('Enter a valid 10-digit contact number')
      return
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
        // Optionally navigate to dashboard or stay here
        return
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

    } catch (error) {
      console.error('❌ Booking/Payment Error:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || error.message || 'Failed to create booking or initiate payment')
      setIsProcessingBooking(false)
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
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/box/${id}`)}
            className="hover:bg-primary/10 group transition-all duration-300"
          >
            <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Box Details</span>
          </Button>
        </motion.div>

        {/* Enhanced Header Card with Box Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Box Name and Location */}
            <div className="flex-1">
              <h1 
                style={{ fontFamily: 'Bebas Neue' }} 
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
              >
                Book {box.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{box.location}, Bhavnagar</span>
                </div>
              </div>
            </div>

            {/* Right: Pricing Info */}
            <div className="bg-card/50 backdrop-blur-md rounded-xl px-6 py-4 shadow-md">
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Starting From</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-primary" style={{ fontFamily: 'Bebas Neue' }}>
                    ₹{box.hourlyRate}
                  </span>
                  <span className="text-muted-foreground">/hour</span>
                </div>
                {box.weekendHourlyRate && box.weekendHourlyRate !== box.hourlyRate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Weekend: ₹{box.weekendHourlyRate}/hr
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-muted-foreground text-center md:text-left">
              Select your preferred date, time slot, and box to complete your booking
            </p>
          </div>
        </motion.div>

        {/* Booking Form Section - Borderless */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg"
        >
          <div className="mb-6">
            <h2 
              style={{ fontFamily: 'Bebas Neue' }} 
              className="text-2xl md:text-3xl font-bold text-primary mb-2"
            >
              Booking Details
            </h2>
            <p className="text-muted-foreground text-sm">
              Fill in the details below to reserve your slot
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3 }}
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
        </motion.div>
      </div>
    </div>
  )
}

export default BoxBooking
