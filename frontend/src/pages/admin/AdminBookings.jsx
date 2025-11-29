import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, User, Search, Phone, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'
import { formatDate, formatTime, formatEndTime, convertTo12Hour } from '../../utils/formatDate'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled
  const [selectedQuarter, setSelectedQuarter] = useState('all')
  const [expandedBooking, setExpandedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  //fetch admin booking api
  const fetchBookings = async () => {
    try {
      const response = await api.get('/booking/owner-bookings')
      const data = response.data
      setBookings(data)
    } catch (error) {
      toast.error('Failed to fetch bookings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  //get unique Quaters for filter
  const uniqueQuarters = Array.from(
    new Set(
      bookings.flatMap(b =>
        b.box && Array.isArray(b.box.quarters) ? b.box.quarters.map(q => q.name) : []
      )
    )
  )

  //add filter by username, boxname ,status and quaters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.box.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'upcoming' && booking.status === 'confirmed') ||
      (filter === 'past' && booking.status === 'completed') ||
      (filter === 'cancelled' && booking.status === 'cancelled')

    const matchesQuarter = selectedQuarter === 'all' || booking.quarterName === selectedQuarter

    return matchesSearch && matchesFilter && matchesQuarter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600'
      case 'completed':
        return 'text-blue-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'confirmed':
        return '🟢'
      case 'completed':
        return '🔵'
      case 'cancelled':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
  }

  const formatTimeRange = (startTime, endTime) => {
    // Convert 12-hour format to simple display
    const start = startTime.replace(':00', '').replace(' ', '')
    const end = formatEndTime(endTime).replace(':00', '').replace(' ', '')
    return `${start}–${end}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
            Booking Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">View and manage all your turf bookings.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user or box..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted/30 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-3">
            {/* Status Filter */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-muted/30 border-primary/20">
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  <SelectValue placeholder="Filter Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Quarter Filter */}
            {uniqueQuarters.length > 0 && (
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="w-full md:w-[180px] bg-muted/30 border-primary/20">
                   <SelectValue placeholder="Filter Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  {uniqueQuarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>
                      {quarter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-0">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div
              key={booking._id}
              className="border-b border-primary/10 last:border-b-0 active:bg-muted/20 md:hover:bg-muted/10 transition-colors"
            >
              {/* Compact View */}
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Location & Box */}
                    <div className="flex items-center gap-2 text-base md:text-lg font-semibold">
                      <span>📍</span>
                      <span>{booking.box.name} — {booking.quarterName || 'Box'}</span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <span>📅</span>
                      <span>{formatBookingDate(booking.date)} •  {convertTo12Hour(booking.startTime)} - {formatTime(booking.endTime)}</span>
                    </div>

                    {/* Status & Amount */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-sm md:text-base font-medium ${getStatusColor(booking.status)}`}>
                        <span>{getStatusEmoji(booking.status)}</span>
                        <span className="capitalize">{booking.status}</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-primary">
                        ₹{booking.amountPaid}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Details Button */}
                <button
                  onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                  className="flex items-center gap-2 text-sm text-primary mt-3 active:text-primary/80 md:hover:text-primary/80 transition-colors"
                >
                  {expandedBooking === booking._id ? (
                    <>
                      <ChevronUp size={16} />
                      <span>Hide Details</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>View Details</span>
                    </>
                  )}
                </button>

                {/* Expanded Details */}
                {expandedBooking === booking._id && (
                  <div className="mt-4 pt-4 border-t border-primary/10 space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">{booking.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Contact:</span>
                        {booking.contactNumber ? (
                          <a href={`tel:${booking.contactNumber}`} className="font-medium text-primary active:text-primary/80 md:hover:text-primary/80">
                            {booking.contactNumber}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Full Date:</span>
                        <span className="font-medium">{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{booking.startTime} - {formatEndTime(booking.endTime)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Search size={48} className="mx-auto opacity-20 mb-4" />
            <p>No bookings found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookings
