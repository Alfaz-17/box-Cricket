import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, CheckCircle, Download, Eye } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import api from '../../utils/api'
import { jsPDF } from 'jspdf'
import { motion } from 'framer-motion'
import { formatTime, formatEndTime, formatBookingDate } from '../../utils/formatDate'

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
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
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
            <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-xl sm:text-2xl font-medium mb-2">
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

const BookingCard = ({ booking }) => {
  const getStatusBadge = status => {
    if (status === 'confirmed') {
      return (
        <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
          <CheckCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
        </div>
      )
    } else if (status === 'completed') {
      return (
        <div className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
          <CheckCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
        </div>
      )
    } else if (status === 'pending') {
      return (
        <div className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
          <AlertCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
          <XCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Cancelled</span>
        </div>
      )
    }
  }

  const handleDownloadReceipt = async bookingId => {
    try {
      const response = await api.get(`/booking/report/${bookingId}`)
      const data = response.data
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      
      // Brand colors matching logo (Olive Green & Lime Yellow)
      const primaryGreen = [77, 99, 46]      // Olive Green
      const limeYellow = [139, 156, 54]      // Lime Yellow
      const lightBg = [236, 240, 241]
      const white = [255, 255, 255]
      const successGreen = [46, 204, 113]
      const darkText = [44, 62, 80]
      
      // Professional header with logo
      doc.setFillColor(...primaryGreen)
      doc.rect(0, 0, pageWidth, 45, 'F')
      
      // Add logo image
      const logoImg = new Image()
      logoImg.src = '/logo.png'
      try {
        doc.addImage(logoImg, 'PNG', 10, 5, 35, 35)
      } catch (e) {
        // Fallback to text if image fails
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...white)
        doc.text('BMB', 15, 16)
      }
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...white)
      doc.text('BOOKING RECEIPT', pageWidth / 2, 16, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(data.boxName, pageWidth / 2, 26, { align: 'center' })
      
      // Booking ID
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      const bookingIdShort = String(data.bookingId).substring(0, 8).toUpperCase()
      doc.text('ID: ' + bookingIdShort, pageWidth / 2, 36, { align: 'center' })
      
      // Reset colors
      doc.setTextColor(...darkText)
      
      let yPos = 55
      
      // Details section with professional styling
      doc.setFillColor(...lightBg)
      doc.rect(15, yPos, pageWidth - 30, 85, 'F')
      
      doc.setFillColor(...white)
      doc.rect(17, yPos + 2, pageWidth - 34, 81, 'F')
      
      yPos += 10
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryGreen)
      doc.text('BOOKING DETAILS', 20, yPos)
      yPos += 10
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...darkText)
      
      // Left column
      const leftCol = 20
      const rightCol = pageWidth / 2 + 10
      
      doc.setFont('helvetica', 'bold')
      doc.text('Date:', leftCol, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(data.date, leftCol + 28, yPos)
      
      doc.setFont('helvetica', 'bold')
      doc.text('Quarter:', rightCol, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(data.quarterName, rightCol + 28, yPos)
      yPos += 8
      
      doc.setFont('helvetica', 'bold')
      doc.text('Start Time:', leftCol, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(data.startTime, leftCol + 28, yPos)
      
      doc.setFont('helvetica', 'bold')
      doc.text('End Time:', rightCol, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(data.endTime, rightCol + 28, yPos)
      yPos += 8
      
      doc.setFont('helvetica', 'bold')
      doc.text('Duration:', leftCol, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(data.duration + ' hours', leftCol + 28, yPos)
      
      doc.setFont('helvetica', 'bold')
      doc.text('Contact:', rightCol, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(data.contactNumber, rightCol + 28, yPos)
      yPos += 8
      
      doc.setFont('helvetica', 'bold')
      doc.text('Payment:', leftCol, yPos)
      doc.setFont('helvetica', 'normal')
      
      // Color code payment status
      if (data.paymentStatus === 'paid') {
        doc.setTextColor(...successGreen)
      } else {
        doc.setTextColor(230, 126, 34)
      }
      doc.text(data.paymentStatus.toUpperCase(), leftCol + 28, yPos)
      doc.setTextColor(...darkText)
      
      yPos += 15
      
      // Amount section with professional styling
      doc.setFillColor(...primaryGreen)
      doc.rect(15, yPos, pageWidth - 30, 22, 'F')
      
      doc.setFillColor(...white)
      doc.rect(17, yPos + 2, pageWidth - 34, 18, 'F')
      
      yPos += 13
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryGreen)
      const amountText = 'TOTAL AMOUNT: Rs.' + data.amountPaid
      doc.text(amountText, pageWidth / 2, yPos, { align: 'center' })
      doc.setTextColor(...darkText)
      
      yPos += 20
      
      // Footer note
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(127, 140, 141)
      doc.text('Thank you for booking with us!', pageWidth / 2, yPos, { align: 'center' })
      doc.text('Please show this receipt at the venue.', pageWidth / 2, yPos + 5, { align: 'center' })
      
      // Page footer
      doc.setFontSize(7)
      doc.setTextColor(149, 165, 166)
      doc.text(
        'Generated on ' + new Date().toLocaleString('en-IN'),
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
      
      doc.save('booking_receipt_' + bookingIdShort + '.pdf')
    } catch (error) {
      console.error('Download failed', error)
    }
  }

  return (
    <Card className="overflow-hidden hover:border-primary/40 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 lg:w-1/4 h-48 md:h-auto relative overflow-hidden">
          <img
            src={booking.box.image}
            alt={booking.box.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
          <div className="absolute bottom-3 left-3 md:hidden">
             {getStatusBadge(booking.status)}
          </div>
        </div>
        
        <div className="md:w-2/3 lg:w-3/4 p-4 sm:p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h3
                  style={{ fontFamily: 'Bebas Neue' }}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                >
                  {booking.box.name}
                </h3>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{booking.box.location}</span>
                </div>
              </div>
              <div className="hidden md:block ml-4">
                {getStatusBadge(booking.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center p-2.5 sm:p-3 bg-muted/30 rounded-lg border border-primary/5">
                <Calendar size={16} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Date</p>
                    <p className="font-medium text-sm sm:text-base truncate">{formatBookingDate(booking.date)}</p>
                </div>
              </div>
              <div className="flex items-center p-2.5 sm:p-3 bg-muted/30 rounded-lg border border-primary/5">
                <Clock size={16} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Time</p>
                    <p className="font-medium text-sm sm:text-base truncate">
                        {booking.startTime} - {formatEndTime(booking.endTime)}
                    </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-primary/10">
            <div className="font-bold text-base sm:text-lg">
              <span className="text-muted-foreground text-xs sm:text-sm font-normal mr-2">Total Paid:</span>
              <span className="text-primary">₹{booking.amountPaid}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link to={`/box/${booking.box._id}`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> View Box
                </Button>
              </Link>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadReceipt(booking._id)}
                className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MyBookings
