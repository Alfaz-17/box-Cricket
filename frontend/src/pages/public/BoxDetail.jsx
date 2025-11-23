import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { MapPin, Clock, Calendar, ChevronRight, ChevronLeft, Star, Info, Phone, CheckCircle2, Users, Zap, Shield, Trophy, Target, Award, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import AuthContext from '../../context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import TimePicker from '../../components/ui/TimePicker'
import ReviewsSection from '../../components/ui/ReviewsSection'
import api from '../../utils/api.js'
import BookedSlots from '../../components/ui/BookedSlots.jsx'
import BlockedSlots from '../../components/ui/BlockedSlots.jsx'
import BoxMap from '../../components/ui/BoxMap.jsx'

const BoxDetail = () => {
  const { id } = useParams()
  const [box, setBox] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [availableTimes, setAvailableTimes] = useState([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isProcessingBooking, setIsProcessingBooking] = useState(false)
  const [contactNumber, setContactNumber] = useState('')
  const [activeTab, setActiveTab] = useState('booking')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [averageRating, setAverageRating] = useState('')
  const [totalReviews, setTotalReviews] = useState('')

  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

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
  }, [id])

  const fetchReviews = async () => {
    setLoading(true)

    try {
      const res = await api.get(`/reviews/${id}`)
      setAverageRating(res.data.averageRating)
      setTotalReviews(res.data.reviewCount)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]) // Refetch when box ID changes

  const handleTimeChange = newTime => {
    setSelectedTime(newTime)
    setAvailableTimes(false)
  }

  //format date for api
  const formattedDate = selectedDate.toISOString().split('T')[0]
  const time = selectedTime.toString()

  const handleCheckAvailability = async () => {
    if (!selectedDate || !selectedTime || !duration || !contactNumber) {
      toast.error('Please fill all details')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please log in to book a cricket box')
      navigate('/login', { state: { from: `/box/${id}` } })
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
      console.log(formattedDate, time)

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
      navigate('/login', { state: { from: `/box/${id}` } })
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
      console.error('Temp Booking error:', error)
      toast.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setIsProcessingBooking(false)
    }
  }

  // Mock data for demonstration
  const mockBox = {
    id: id,
    name: 'Premium Cricket Box',
    description:
      'High-quality cricket practice box with advanced bowling machine and analytics. Perfect for players of all skill levels, from beginners to professionals. Features include adjustable bowling speed and pitch, video analysis, and comfortable waiting area.',
    location: 'Central Sports Complex, New York',
    address: '123 Sports Avenue, NY 10001',
    hourlyRate: 45,
    image:
      'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    images: [
      'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    rating: 4.8,
    reviewCount: 24,
    features: [
      'Advanced bowling machine',
      'Video analysis',
      'Batting and bowling analytics',
      'Adjustable pitch conditions',
      'Comfortable waiting area',
      'Changing rooms',
    ],
    openingHours: {
      weekdays: '9:00 AM - 9:00 PM',
      weekends: '8:00 AM - 10:00 PM',
    },
    reviews: [
      {
        id: 1,
        user: 'John Smith',
        rating: 5,
        comment:
          'Excellent facilities! The bowling machine is top-notch and the video analysis helped me improve my technique.',
        date: '2023-03-15',
      },
      {
        id: 2,
        user: 'Sarah Johnson',
        rating: 4,
        comment: 'Great place to practice. Well-maintained and the staff are very helpful.',
        date: '2023-02-28',
      },
      {
        id: 3,
        user: 'Mike Roberts',
        rating: 5,
        comment: 'Best cricket box in the area. Worth every penny!',
        date: '2023-02-10',
      },
    ],
  }

  const displayBox = box || mockBox

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = React.useCallback(() => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === displayBox.images.length - 1 ? 0 : prevIndex + 1
    )
  }, [displayBox.images.length])

  const prevImage = React.useCallback(() => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === 0 ? displayBox.images.length - 1 : prevIndex - 1
    )
  }, [displayBox.images.length])

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage()
    }, 3500) // 4000ms = 4 seconds

    return () => clearInterval(interval) // cleanup on unmount
  }, [nextImage])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Banner/Slideshow Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl group mb-8"
        >
          <div className="relative h-80 md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={displayBox.images[currentImageIndex]}
                alt={displayBox.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Navigation Buttons */}
            {displayBox.images?.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 border border-white/30"
                >
                  <ChevronLeft size={24} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 border border-white/30"
                >
                  <ChevronRight size={24} />
                </motion.button>

                {/* Image Indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                  {displayBox.images?.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.3 }}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Two-Column Header: Title/Rating/Location + Book Now Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-8 border-b border-primary/20"
        >
          {/* Left: Title, Rating, Location */}
          <div className="flex-1 w-full lg:w-auto">
            <h1
              style={{ fontFamily: 'Bebas Neue' }}
              className="text-4xl md:text-5xl font-bold text-primary mb-4"
            >
              {displayBox.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-3">
              {/* Rating */}
              <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-bold text-lg">{averageRating}</span>
                <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{displayBox.location}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {displayBox.description}
            </p>
          </div>

          {/* Right: Book Now CTA */}
          <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
            <div className="text-left lg:text-right">
              <div className="text-4xl font-bold text-primary" style={{ fontFamily: 'Bebas Neue' }}>
                ₹{displayBox.hourlyRate}
                <span className="text-lg font-normal text-muted-foreground">/hour</span>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full lg:w-auto">
              <Button
                onClick={() => {
                  const bookingSection = document.getElementById('booking-section')
                  bookingSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full lg:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg font-bold shadow-lg"
              >
                Book Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Key Details Grid Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold text-primary mb-6"
          >
            Key Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <KeyDetailItem
              icon={Trophy}
              label="Price/Hour"
              value={`₹${displayBox.hourlyRate}`}
            />
            <KeyDetailItem
              icon={Clock}
              label="Weekdays"
              value={displayBox.openingHours.weekdays}
            />
            <KeyDetailItem
              icon={Calendar}
              label="Weekends"
              value={displayBox.openingHours.weekends}
            />
            <KeyDetailItem
              icon={Users}
              label="Capacity"
              value="10+ Players"
            />
          </div>
        </motion.section>

        {/* Available Boxes Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold text-primary mb-6 flex items-center gap-2"
          >
            <Target className="w-8 h-8" />
            Available Boxes
          </h2>
          <div className="flex flex-wrap gap-3">
            {Array.isArray(displayBox.quarters) && displayBox.quarters.length > 0 ? (
              displayBox.quarters?.map((quarter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ fontFamily: 'Bebas Neue' }}
                >
                  {quarter.name}
                </motion.span>
              ))
            ) : (
              <p className="text-muted-foreground">No quarters available</p>
            )}
          </div>
        </motion.section>

        {/* Custom Pricing */}
        {Array.isArray(displayBox.customPricing) && displayBox.customPricing.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2
              style={{ fontFamily: 'Bebas Neue' }}
              className="text-3xl font-bold text-primary mb-6"
            >
              Custom Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayBox.customPricing.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'Bebas Neue' }}>
                        {item.duration} Hour{item.duration > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent" style={{ fontFamily: 'Bebas Neue' }}>
                        ₹{item.price}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}


        {/* Facilities Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <h2
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold text-primary mb-6 flex items-center gap-2"
          >
            <Award className="w-8 h-8" />
            Facilities & Amenities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayBox?.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-300 border border-primary/10"
              >
                <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-full flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Location Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-8"
        >
          <h2
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold text-primary mb-6 flex items-center gap-2"
          >
            <MapPin className="w-8 h-8" />
            Location
          </h2>

          {displayBox?.coordinates?.lat ? (
            <div className="rounded-xl overflow-hidden shadow-lg mb-4">
              <BoxMap
                lat={displayBox.coordinates?.lat}
                lng={displayBox.coordinates?.lng}
                name={displayBox.name}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-muted text-center flex items-center justify-center rounded-xl border border-primary/20 mb-4">
              <p className="text-muted-foreground">No map available for this box</p>
            </div>
          )}

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <p className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <span>
                <span className="font-bold">Address:</span>{' '}
                {displayBox?.address || 'No address provided'}
              </span>
            </p>
          </div>
        </motion.section>

        {/* Tabs for All Users */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex lg:grid lg:grid-cols-4 bg-muted/50 p-1 rounded-xl mb-6 gap-1 overflow-x-auto scrollbar-hide">
              <TabsTrigger value="booking" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">Book Slot</TabsTrigger>
              {isAuthenticated && (
                <>
                  <TabsTrigger value="booked" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">Booked</TabsTrigger>
                  <TabsTrigger value="blocked" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">Blocked</TabsTrigger>
                  <TabsTrigger value="reviews" className="flex-shrink-0 min-w-[120px] sm:min-w-0 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">Reviews</TabsTrigger>
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
                      <h3 className="font-bold text-destructive mb-1 sm:mb-2 text-sm sm:text-base">Book Offline</h3>
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                        Online booking is currently <strong>unavailable (In development)</strong>. Please
                        call the number below to reserve this box.
                      </p>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 w-full sm:w-auto text-sm sm:text-base"
                        >
                          <a href={`tel:${displayBox.mobileNumber}`} className="flex items-center gap-2 justify-center">
                            <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
                            +91 - {displayBox.mobileNumber || 'N/A'}
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
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Select Date</label>
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
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Contact Number</label>
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
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Select Time</label>
                    <TimePicker value={selectedTime} onChange={handleTimeChange} />
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                      Selected: {selectedTime || 'None'}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Duration</label>
                    <Select value={duration.toString()} onValueChange={val => setDuration(Number(val))}>
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
                    <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Select Box</label>
                    <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                      <SelectTrigger className="border-2 border-primary/20 h-10 sm:h-11">
                        <SelectValue placeholder="-- Select a Box --" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayBox.quarters?.map(quarter => (
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
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
                        {isProcessingBooking ? 'Booking...' : 'Book Now'}
                        <Trophy className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Booking Policy */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Info size={18} className="sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="text-xs sm:text-sm">
                      <p className="font-bold mb-1 sm:mb-2 text-primary text-sm sm:text-base">Booking Policy</p>
                      <ul className="space-y-1 sm:space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Cancellation allowed up to 24 hours before booking time</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Payment is processed upon booking confirmation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Please arrive 15 minutes before your slot</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {isAuthenticated && (
              <>
                <TabsContent value="booked">
                  <BookedSlots boxId={box._id} />
                </TabsContent>
                <TabsContent value="blocked">
                  <BlockedSlots boxId={box._id} />
                </TabsContent>
                <TabsContent value="reviews">
                  <ReviewsSection boxId={box._id} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.section>
      </div>
    </div>
  )
}

// Key Detail Item Component
const KeyDetailItem = ({ icon: Icon, label, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl"
    >
      <div className="flex flex-col items-center text-center">
        <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-full mb-3">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-xl font-bold text-primary mb-1" style={{ fontFamily: 'Bebas Neue' }}>
          {value}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  )
}

export default BoxDetail
