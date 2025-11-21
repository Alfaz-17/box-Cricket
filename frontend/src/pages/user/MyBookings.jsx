import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import api from '../../utils/api'
import { jsPDF } from 'jspdf'
import { formatDate } from '../../utils/formatDate'

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

  const cancelBooking = async id => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await api.post(`/booking/cancel/${id}`)

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to cancel booking')
      }

      // Axios treats non-2xx as errors, so if we’re here, it’s OK
      setBookings(prev =>
        prev.map(booking => (booking._id === id ? { ...booking, status: 'cancelled' } : booking))
      )

      toast.success('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel booking')
    }
  }

  // this funtion is used to conver time this "01:00 PM" to this "13" means 24 houre because
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

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const fixedTime = convertTo24Hour(booking.startTime) // "03:30"
    const bookingDate = new Date(`${booking.date}T${fixedTime}`) // ✅ valid Date

    const now = new Date()

    if (activeTab === 'upcoming') {
      return bookingDate > now && booking.status !== 'cancelled'
    } else if (activeTab === 'past') {
      return bookingDate < now && booking.status !== 'cancelled'
    } else {
      return booking.status === 'cancelled'
    }
  })

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-  mb-6">My Bookings</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'upcoming'
                  ? 'text-primary  border-b-2 border-'
                  : ' dark:text-gray-400 hover:text-primary'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'past'
                  ? 'text-primary  border-b-2 border-'
                  : ' dark:text-gray-400 hover:text-primary'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'cancelled'
                  ? 'text-primary  border-b-2 border-'
                  : ' dark:text-gray-400 hover:text-primary'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <div className="mx-auto w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="" />
            </div>
            <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-lg font-medium   mb-1">
              No {activeTab} bookings found
            </h3>
            <p className=" mb-6">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming bookings."
                : activeTab === 'past'
                  ? "You don't have any past bookings."
                  : "You don't have any cancelled bookings."}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/">
                <Button variant="primary">Browse Cricket Boxes</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={() => cancelBooking(booking._id)}
              showCancelButton={activeTab === 'upcoming'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const BookingCard = ({ booking, onCancel, showCancelButton }) => {
  const getStatusBadge = status => {
    if (status === 'confirmed') {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Confirmed</span>
        </div>
      )
    } else if (status === 'completed') {
      return (
        <div className="flex items-center ">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      )
    } else if (status === 'pending') {
      return (
        <div className="flex items-center ">
          <AlertCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Pending</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400">
          <XCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Cancelled</span>
        </div>
      )
    }
  }

  // funtion for download recipt
  const handleDownloadReceipt = async bookingId => {
    try {
      const response = await api.get(`/booking/report/${bookingId}`)
      const data = response.data

      const doc = new jsPDF()

      // Set title
      doc.setFontSize(18)
      doc.text('Booking Receipt', 20, 20)

      // Add details
      doc.setFontSize(12)
      const details = [
        `Booking ID: ${data.bookingId}`,
        `Box Name: ${data.boxName}`,
        `Date: ${data.date}`,
        `Start Time: ${data.startTime}`,
        `End Time: ${data.endTime}`,
        `Duration: ${data.duration} hours`,
        `Amount Paid: ₹${data.amountPaid}`,
        `Payment Status: ${data.paymentStatus}`,
        `Contact Number: ${data.contactNumber}`,
        `Quarter Name: ${data.quarterName}`,
      ]

      let y = 40
      details.forEach(line => {
        doc.text(line, 20, y)
        y += 10
      })

      // Save PDF
      doc.save(`booking_receipt_${data.bookingId}.pdf`)
    } catch (error) {
      console.error('Download failed', error)
      console.log('booking', error)
    }
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 w-full h-32 sm:h-auto">
          <img
            src={booking.box.image}
            alt={booking.box.name}
            className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
          />
        </div>
        <div className="sm:w-2/3 p-4">
          <div className="flex justify-between items-start">
            <h3
              style={{ fontFamily: 'Bebas Neue' }}
              className="text-lg font-semibold text-primary "
            >
              {booking.box.name}
            </h3>
            {getStatusBadge(booking.status)}
          </div>

          <div className="mt-3 space-y-2  ">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-primary" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-primary " />
              <span>
                {booking.startTime} - {booking.endTime} ({booking.duration} hour
                {booking.duration > 1 ? 's' : ''})
              </span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-primary" />
              <span>{booking.box.location}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="font-semibold text-red-500 dark:text-gray-200">
              Paid: ₹{booking.amountPaid}
            </div>
            <div className="flex space-x-2">
              <Link to={`/box/${booking.box._id}`}>
                <Button variant="secondary" size="sm">
                  View Box
                </Button>
              </Link>
              {/* Download Receipt Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownloadReceipt(booking._id)}
              >
                Download Receipt
              </Button>

              {showCancelButton && booking.status === 'confirmed' && (
                <Button variant="danger" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MyBookings
