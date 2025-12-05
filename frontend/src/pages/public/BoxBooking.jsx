import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

// Components
import BookingForm from '../../components/ui/BookingForm'


const BoxBooking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)

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

  // Listen for new bookings to refresh slots
  useEffect(() => {
    socket.on("new-booking", data => {
      toast.success("New Booking created");
      fetchSlots()
    })
    return () => socket.off("new-booking")
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
      await api.post('/booking/temporary-booking', {
        boxId: id,
        quarterId: selectedQuarter,
        date: formattedDate,
        startTime: startTime,
        amountPaid: '500',
        duration,
        contactNumber,
      })
      toast.success('🎉 Temporary booking confirmed!')
      setSelectedSlots([]) // Clear selection
      fetchSlots() // Refresh slots
    } catch (error) {
      console.error('Error booking :', error)
      toast.error(error.response?.data?.message || 'Failed to create a booking')
    } finally {
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



  return (
    <div className="min-h-screen relative ">
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

            {/* Content Area */}
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
                        // Pass new slot props
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
                    />
                </motion.div>
            </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default BoxBooking
