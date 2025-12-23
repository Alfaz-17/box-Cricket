import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, User, Search, Phone, Filter, FileDown, FileSpreadsheet } from 'lucide-react'
import api from '../../utils/api'
import { formatDate, formatTime, formatEndTime, convertTo12Hour, formatBookingDate } from '../../utils/formatDate'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { X } from 'lucide-react'
import { exportToExcel, exportToPDF } from '../../utils/exportBookings'

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedQuarter, setSelectedQuarter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [boxName, setBoxName] = useState('Cricket Box')
  const [expandedBooking, setExpandedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/booking/owner-bookings')
      const data = response.data
      setBookings(data)
      if (data.length > 0 && data[0].box) {
        setBoxName(data[0].box.name)
      }
    } catch (error) {
      toast.error('Failed to fetch bookings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (filteredBookings.length === 0) {
      toast.error('No bookings to export')
      return
    }
    try {
      exportToExcel(filteredBookings, boxName)
      toast.success('Excel file downloaded!')
    } catch (error) {
      toast.error('Failed to export Excel')
      console.error(error)
    }
  }

  const handleExportPDF = () => {
    if (filteredBookings.length === 0) {
      toast.error('No bookings to export')
      return
    }
    try {
      exportToPDF(filteredBookings, boxName)
      toast.success('PDF file downloaded!')
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    }
  }

  const cancelBooking = async id => {
    const ownerCode = prompt('Enter Owner Code to confirm cancellation:')
    if (!ownerCode) {
      toast.error('Owner code is required')
      return
    }

    if (!confirm('Cancel this booking? Slot will be freed.')) return

    try {
      await api.post(`/booking/cancel/${id}`, { ownerCode })
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel')
    }
  }

  const uniqueQuarters = Array.from(
    new Set(
      bookings.flatMap(b =>
        b.box && Array.isArray(b.box.quarters) ? b.box.quarters.map(q => q.name) : []
      )
    )
  )

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactNumber.includes(searchTerm) ||
      (booking.quarterName && booking.quarterName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filter === 'all' ||
      (filter === 'upcoming' && booking.status === 'confirmed') ||
      (filter === 'past' && booking.status === 'completed') ||
      (filter === 'cancelled' && booking.status === 'cancelled')

    const matchesQuarter = selectedQuarter === 'all' || booking.quarterName === selectedQuarter

    const matchesDate = !dateFilter ||
      new Date(booking.date).toDateString() === dateFilter.toDateString()

    return matchesSearch && matchesFilter && matchesQuarter && matchesDate
  })

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'confirmed': return '🟢'
      case 'completed': return '🔵'
      case 'cancelled': return '🔴'
      default: return '⚪'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600'
      case 'completed': return 'text-blue-600'
      case 'cancelled': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusBadge = (status) => {
    const labels = {
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    
    return (
      <div className={`flex items-center gap-1.5 text-sm font-semibold capitalize ${getStatusColor(status)}`}>
        <span>{getStatusEmoji(status)}</span>
        <span>{labels[status] || status}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full py-4 min-h-screen">
      {/* Header */}
      <div className="px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-0.5 font-display tracking-tight">
            Bookings
          </h1>
          <p className="text-xs text-muted-foreground">Manage all your bookings</p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
            disabled={filteredBookings.length === 0}
          >
            <FileSpreadsheet size={14} className="mr-1.5" />
            Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
            disabled={filteredBookings.length === 0}
          >
            <FileDown size={14} className="mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-4 bg-muted/30 rounded-lg p-3 mb-4 border border-border/40">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or space..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full lg:w-[130px] h-9 text-sm">
              <SelectValue placeholder="Status" />
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
              <SelectTrigger className="w-full lg:w-[120px] h-9 text-sm">
                <SelectValue placeholder="Space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Spaces</SelectItem>
                {uniqueQuarters.map(quarter => (
                  <SelectItem key={quarter} value={quarter}>
                    {quarter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Filter */}
          <div className="relative w-full lg:w-[150px]">
            <Calendar size={12} className="absolute left-3 top-2.5 text-muted-foreground z-10" />
            <DatePicker
              selected={dateFilter}
              onChange={date => setDateFilter(date)}
              placeholderText="Filter by date"
              className="w-full h-9 pl-9 pr-8 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              dateFormat="MMM d, yyyy"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter(null)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="w-full border-t-2 border-primary/30">
        {filteredBookings.length > 0 ? (
          <div className="divide-y-2 divide-primary/30">
            {filteredBookings.map(booking => (
              <div
                key={booking._id}
                className={`p-4 md:p-5 transition-colors ${
                  booking.status === 'cancelled' ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-muted/10'
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Phase 1: Header - Box Name & Amount */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2 text-base md:text-lg font-bold text-foreground">
                     <span>👤</span>
                      <span className="truncate">{booking.user}</span>
                      {booking.quarterName && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          {booking.quarterName}
                        </span>
                      )}
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-primary font-display tracking-tight">
                      ₹{booking.amountPaid}
                    </div>
                  </div>

                  {/* Phase 2: Time & Date */}
                  <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground font-medium">
                
                    <span>
                      {formatBookingDate(booking.date)} • {convertTo12Hour(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
                  </div>

                  {/* Phase 3: Status & Primary Actions */}
                  <div className="flex items-center justify-between mt-1">
                    {getStatusBadge(booking.status)}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 rounded-lg hover:bg-green-500/10 text-green-500"
                        title="WhatsApp"
                      >
                        <a
                          href={`https://wa.me/91${booking.contactNumber}?text=Hi ${booking.user}, regarding your booking on ${formatBookingDate(booking.date)}...`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      </Button>

                      {booking.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => cancelBooking(booking._id)}
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive"
                          title="Cancel"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Phase 4: Toggle Details */}
             
                       <a href={`tel:${booking.contactNumber}`} className="font-bold text-foreground hover:text-primary transition-colors">
                           📞{booking.contactNumber}
                        </a>

                  
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Bookings Found</h3>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookings
