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
import socket from "../../utils/soket.js"
import AnimatedShaderBackground from '../../components/ui/AnimatedShaderBackground'

// Components
import BookingForm from '../../components/ui/BookingForm'
import BookedSlots from '../../components/ui/BookedSlots'
import BlockedSlots from '../../components/ui/BlockedSlots'
import ReviewsSection from '../../components/ui/ReviewsSection'

const BoxBooking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)

  const [box, setBox] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('booking')

  // Booking State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [availableTimes, setAvailableTimes] = useState([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
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

  const handleTimeChange = newTime => {
    setSelectedTime(newTime)
    setAvailableTimes(false)
  }

  const formattedDate = selectedDate.toISOString().split('T')[0]
  const time = selectedTime.toString()

  const handleCheckAvailability = async () => {
    if (!selectedDate || !selectedTime || !duration || !contactNumber) {
      toast.error('Please fill all details')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box')
      navigate('/login', { state: { from: `/box/${id}/booking` } })
      return
    }
    if (!selectedQuarter) {
      toast.error('Please select a quarter')
      return
    }

    setIsCheckingAvailability(true)

    try {
      const response = await api.post('/booking/check-slot', {
        boxId: id,
        date: formattedDate,
        quarterId: selectedQuarter,
        startTime: time,
        duration,
      })

      const data = response.data
      setAvailableTimes(data.available)

      if (data.message) {
        return toast.success(data.message)
      }

      toast.error(data.error || 'Slot not available')
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error(error.response?.data?.message || 'Failed to check availability')
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box')
      navigate('/login', { state: { from: `/box/${id}/booking` } })
      return
    }

    if (!selectedDate || !selectedTime || !duration || !selectedQuarter) {
      toast.error('Please select all booking details')
      return
    }

    if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
      toast.error('Enter a valid 10-digit contact number')
      return
    }

    if (!availableTimes) {
      toast.error('This time is not available')
      return
    }

    setIsProcessingBooking(true)

    try {
      await api.post('/booking/temporary-booking', {
        boxId: id,
        quarterId: selectedQuarter,
        date: formattedDate,
        startTime: time,
        amountPaid: '500',
        duration,
        contactNumber,
      })
      toast.success('🎉 Temporary booking confirmed!')
      setAvailableTimes(false)
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

  const tabs = [
    { id: 'booking', label: 'Book Slot' },
    { id: 'booked', label: 'Booked', authRequired: true },
    { id: 'blocked', label: 'Blocked', authRequired: true },
    { id: 'reviews', label: 'Reviews', authRequired: true },
  ]

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

            {/* Segmented Controller */}
            <div className="flex justify-center mb-8">
                <div className="flex bg-card/30 backdrop-blur-md p-1 rounded-full border border-primary/20 overflow-x-auto scrollbar-hide max-w-full">
                    {tabs.map((tab) => {
                        if (tab.authRequired && !isAuthenticated) return null;
                        const isActive = activeTab === tab.id;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-300 whitespace-nowrap
                                    ${isActive ? 'text-white' : 'text-muted-foreground hover:text-primary'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSegment"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'booking' && (
                        <BookingForm 
                            displayBox={box}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedTime={selectedTime}
                            handleTimeChange={handleTimeChange}
                            duration={duration}
                            setDuration={setDuration}
                            contactNumber={contactNumber}
                            setContactNumber={setContactNumber}
                            selectedQuarter={selectedQuarter}
                            setSelectedQuarter={setSelectedQuarter}
                            availableTimes={availableTimes}
                            setAvailableTimes={setAvailableTimes}
                            isCheckingAvailability={isCheckingAvailability}
                            isProcessingBooking={isProcessingBooking}
                            handleCheckAvailability={handleCheckAvailability}
                            handleBooking={handleBooking}
                        />
                    )}

                    {activeTab === 'booked' && (

                            <BookedSlots boxId={id} />
                      
                    )}

                    {activeTab === 'blocked' && (
                       
                            <BlockedSlots boxId={id} />
                       
                    )}

                    {activeTab === 'reviews' && (
                            <ReviewsSection boxId={id} />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default BoxBooking
