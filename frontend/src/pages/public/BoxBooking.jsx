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
    <div className="min-h-screen relative">
      {/* Background */}
      <AnimatedShaderBackground />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header / Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/box/${id}`)}
            className="hover:bg-primary/20 group"
          >
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Box Details
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary mb-2">
            Book {box.name}
          </h1>
          <p className="text-muted-foreground mb-8">Select your preferred slot and options below.</p>

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
