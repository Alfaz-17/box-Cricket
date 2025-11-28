import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Phone,
  ArrowRight,
  ChevronLeft
} from 'lucide-react'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import AuthContext from '../../context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import TimePicker from '../../components/ui/TimePicker'
import ReviewsSection from '../../components/ui/ReviewsSection'
import api from '../../utils/api.js'
import BookedSlots from '../../components/ui/BookedSlots.jsx'
import BlockedSlots from '../../components/ui/BlockedSlots.jsx'
import socket from "../../utils/soket.js"
import AnimatedShaderBackground from '../../components/ui/AnimatedShaderBackground'

const BoxBooking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)

  const [box, setBox] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [availableTimes, setAvailableTimes] = useState([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isProcessingBooking, setIsProcessingBooking] = useState(false)
  const [contactNumber, setContactNumber] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [activeTab, setActiveTab] = useState('booking')

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

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <AnimatedShaderBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <Button 
            variant="ghost" 
            onClick={() => navigate(`/box/${id}`)}
            className="mb-6 hover:bg-primary/20"
        >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Box Details
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary mb-2">
                Book {box.name}
            </h1>
            <p className="text-muted-foreground mb-8">Select your preferred slot and options below.</p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex lg:grid lg:grid-cols-4 bg-muted/50 p-1 rounded-xl mb-6 gap-1 overflow-x-auto scrollbar-hide">
              <TabsTrigger
                value="booking"
                className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
              >
                Book Slot
              </TabsTrigger>
              {isAuthenticated && (
                <>
                  <TabsTrigger
                    value="booked"
                    className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
                  >
                    Booked
                  </TabsTrigger>
                  <TabsTrigger
                    value="blocked"
                    className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
                  >
                    Blocked
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
                  >
                    Reviews
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="booking" id="booking-section">
              <div className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-primary/20">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">
                  Book Your Slot
                </h2>

                {/* Offline Booking Notice */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-destructive flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-destructive mb-1 sm:mb-2 text-sm sm:text-base">
                        Book Offline
                      </h3>
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                        Online booking is currently <strong>unavailable (In development)</strong>.
                        Please call the number below to reserve this box.
                      </p>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 w-full sm:w-auto text-sm sm:text-base"
                        >
                          <a
                            href={`tel:${box.mobileNumber}`}
                            className="flex items-center gap-2 justify-center"
                          >
                            <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
                            +91 - {box.mobileNumber || 'N/A'}
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Booking Form - Mobile First */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Date Picker */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">
                      Select Date
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => {
                        setSelectedDate(date)
                        setAvailableTimes(false)
                      }}
                      minDate={new Date()}
                      className="flex h-10 sm:h-11 w-full rounded-lg border-2 border-primary/20 bg-background px-3 sm:px-4 py-2 text-xs sm:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      dateFormat="MMMM d, yyyy"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">
                      Contact Number
                    </label>
                    <Input
                      type="tel"
                      value={contactNumber}
                      onChange={e => setContactNumber(e.target.value)}
                      placeholder="Enter contact number"
                      className="border-2 border-primary/20 focus:border-primary h-10 sm:h-11 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Time Picker */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">
                      Select Time
                    </label>
                    <TimePicker value={selectedTime} onChange={handleTimeChange} />
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                      Selected: {selectedTime || 'None'}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">
                      Duration
                    </label>
                    <Select
                      value={duration.toString()}
                      onValueChange={val => setDuration(Number(val))}
                    >
                      <SelectTrigger className="border-2 border-primary/20 h-10 sm:h-11">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(hours => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} hour{hours > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Box Selection */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">
                      Select Box
                    </label>
                    <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                      <SelectTrigger className="border-2 border-primary/20 h-10 sm:h-11">
                        <SelectValue placeholder="-- Select a Box --" />
                      </SelectTrigger>
                      <SelectContent>
                        {box.quarters?.map(quarter => (
                          <SelectItem key={quarter._id} value={quarter._id}>
                            {quarter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleCheckAvailability}
                      variant="secondary"
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg font-bold text-sm sm:text-base"
                      disabled={isCheckingAvailability}
                    >
                      {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </motion.div>

                  {contactNumber && availableTimes && duration && selectedDate && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={handleBooking}
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg font-bold text-sm sm:text-base"
                        disabled={isProcessingBooking}
                      >
                        {isProcessingBooking ? 'Processing...' : 'Confirm Booking'}
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </TabsContent>

            {isAuthenticated && (
              <>
                <TabsContent value="booked">
                  <BookedSlots boxId={id} />
                </TabsContent>

                <TabsContent value="blocked">
                  <BlockedSlots boxId={id} />
                </TabsContent>

                <TabsContent value="reviews">
                  <ReviewsSection boxId={id} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default BoxBooking
