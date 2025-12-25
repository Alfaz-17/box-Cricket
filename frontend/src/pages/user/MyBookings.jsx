import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, CheckCircle, Download, Eye } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import api from '../../utils/api'
import { jsPDF } from 'jspdf'
import { downloadReceipt } from '../../utils/downloadReceipt'
import { motion } from 'framer-motion'
import { formatTime, formatEndTime, formatBookingDate } from '../../utils/formatDate'
import BookingCard from '../../components/BookingCard'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/booking/my-bookings')
        setBookings(response.data || [])
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast.error('Failed to load your bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Users can no longer cancel bookings

  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.trim().split(' ')
    let [hours, minutes] = time.split(':')

    hours = parseInt(hours, 10)

    if (modifier === 'PM' && hours !== 12) {
      hours += 12
    }

    if (modifier === 'AM' && hours === 12) {
      hours = 0
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }
 const filteredBookings = bookings.filter(booking => {
    const fixedTime = convertTo24Hour(booking.startTime)
    const bookingDate = new Date(`${booking.date}T${fixedTime}`)
    const now = new Date()

    if (activeTab === 'upcoming') {
      return bookingDate > now
    } else {
      return bookingDate < now
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-display tracking-tight">
          My Bookings
        </h1>
        
        <div className="bg-muted/30 p-1 rounded-xl flex gap-1 w-full sm:w-auto overflow-x-auto">
          {['upcoming', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-muted/10">
          <div className="py-8 sm:py-12 text-center px-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Calendar size={24} className="sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-medium mb-2 font-display tracking-tight">
              No {activeTab} bookings found
            </h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming bookings."
                : activeTab === 'past'
                  ? "You don't have any past bookings."
                  : "You don't have any cancelled bookings."}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/">
                <Button size="lg" className="shadow-lg">Browse Cricket Boxes</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BookingCard
                booking={booking}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* BookingCard removed */

export default MyBookings
