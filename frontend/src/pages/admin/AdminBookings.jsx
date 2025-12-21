import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, User, Search, Phone, Filter, ChevronDown, ChevronUp, FileDown, FileSpreadsheet } from 'lucide-react'
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
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled
  const [selectedQuarter, setSelectedQuarter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [boxName, setBoxName] = useState('Cricket Box')

  useEffect(() => {
    fetchBookings()
  }, [])

  //fetch admin booking api
  const fetchBookings = async () => {
    try {
      const response = await api.get('/booking/owner-bookings')
      const data = response.data
      setBookings(data)
      // Get box name from first booking
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

  // Handle Excel export
  const handleExportExcel = () => {
    if (filteredBookings.length === 0) {
      toast.error('No bookings to export')
      return
    }
    try {
      exportToExcel(filteredBookings, boxName)
      toast.success('Excel file downloaded successfully!')
    } catch (error) {
      toast.error('Failed to export Excel file')
      console.error(error)
    }
  }

  // Handle PDF export
  const handleExportPDF = () => {
    if (filteredBookings.length === 0) {
      toast.error('No bookings to export')
      return
    }
    try {
      exportToPDF(filteredBookings, boxName)
      toast.success('PDF file downloaded successfully!')
    } catch (error) {
      toast.error('Failed to export PDF file')
      console.error(error)
    }
  }

  const cancelBooking = async id => {
    const ownerCode = prompt('Enter Owner Code to confirm cancellation:')
    if (!ownerCode) {
      toast.error('Owner code is required to cancel')
      return
    }

    if (!confirm('Are you sure you want to cancel this booking? Slot will be freed.')) return

    try {
      const response = await api.post(`/booking/cancel/${id}`, { ownerCode })
      toast.success('Booking cancelled successfully')
      fetchBookings() 
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
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

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
      completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    }
    const labels = {
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${styles[status] || 'bg-muted text-muted-foreground border-border'}`}>
        {labels[status] || status}
      </span>
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
            Booking Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">View and manage all your turf bookings.</p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wide text-xs rounded-xl shadow-lg transition-all"
            disabled={filteredBookings.length === 0}
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide text-xs rounded-xl shadow-lg transition-all"
            disabled={filteredBookings.length === 0}
          >
            <FileDown size={16} className="mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Dashboard Controls */}
      <div className="bg-card/20 backdrop-blur-md rounded-2xl p-2 mb-8 border border-primary/5">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Search Cell */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search Name, Phone or Space..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-11 pl-11 bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1">
            {/* Status Segment */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-primary/10 text-[11px] font-black uppercase tracking-wider rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter size={12} className="text-primary" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/10 rounded-xl">
                <SelectItem value="all">Every Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Quarter Segment */}
            {uniqueQuarters.length > 0 && (
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-primary/10 text-[11px] font-black uppercase tracking-wider rounded-xl">
                   <SelectValue placeholder="Space" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/10 rounded-xl">
                  <SelectItem value="all">All Spaces</SelectItem>
                  {uniqueQuarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>
                      {quarter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Precision Date Filter */}
            <div className="relative z-[100] min-w-[160px]">
              <Calendar 
                size={12} 
                className={`absolute left-4 top-3 z-[110] transition-colors ${dateFilter ? 'text-primary' : 'text-muted-foreground'}`} 
              />
              <DatePicker
                selected={dateFilter}
                onChange={date => setDateFilter(date)}
                placeholderText="FILTER DATE"
                className="w-full h-9 pl-10 pr-8 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-primary transition-all cursor-pointer"
                dateFormat="MMM d, yyyy"
                portalId="root-portal"
                popperClassName="datepicker-popper-high-z"
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter(null)}
                  className="absolute right-3 top-2.5 z-[110] text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div
              key={booking._id}
              className={`
                group relative overflow-hidden
                bg-card/30 backdrop-blur-xl rounded-2xl border transition-all duration-300
                ${booking.status === 'cancelled' ? 'border-destructive/10 opacity-60 grayscale-[0.5]' : 'border-primary/5 hover:border-primary/20 hover:bg-card/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]'}
              `}
            >
              {/* Luxury Status Ribbon */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                booking.status === 'confirmed' ? 'bg-green-500' : 
                booking.status === 'completed' ? 'bg-blue-500' : 
                'bg-destructive'
              }`} />

              <div className="px-4 py-3 md:px-6 md:py-4">
                <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-8">
                  
                  {/* Phase 1: The Schedule (Luxury Typography) */}
                  <div className="flex items-center gap-4 min-w-[200px] border-b xl:border-b-0 xl:border-r border-primary/5 pb-3 xl:pb-0">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                        <Calendar size={10} />
                        {formatBookingDate(booking.date)}
                      </div>
                      <div 
                        className="text-2xl md:text-3xl font-bold text-foreground leading-none tracking-tight"
                        style={{ fontFamily: 'Bebas Neue' }}
                      >
                        {convertTo12Hour(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <div className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mt-1">
                         {booking.duration} HOUR{booking.duration > 1 ? 'S' : ''} SESSION
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Information Cells */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-16 items-center">
                    {/* Customer Cell */}
                    <div className="flex items-center gap-4 min-w-0">
                       <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                         <User size={18} />
                       </div>
                       <div className="flex flex-col min-w-0">
                         <span className="text-sm md:text-base font-black truncate text-foreground tracking-tight leading-none">{booking.user}</span>
                         <a 
                           href={`tel:${booking.contactNumber}`} 
                           className="text-xs text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5 font-bold mt-1.5 tracking-tight"
                         >
                           <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0">
                             <Phone size={8} /> 
                           </div>
                           {booking.contactNumber}
                         </a>
                       </div>
                    </div>

                    {/* Facility Cell */}
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground border border-border/50 shrink-0">
                         <MapPin size={18} />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.15em] mb-1">FACILITY SPACE</span>
                         <div className="flex items-center gap-2">
                           <span className="text-xs md:text-sm font-black text-foreground uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-xl border border-primary/10 shadow-sm leading-none">
                             {booking.quarterName || 'MAIN BOX'}
                           </span>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Phase 3: Financials & Intelligence */}
                  <div className="flex items-center justify-between xl:justify-end gap-6 xl:gap-12 pt-4 xl:pt-0 border-t xl:border-t-0 border-primary/5">
                    {/* Financial Cell */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-tighter self-start mt-1">₹</span>
                          <span className="text-3xl font-bold text-primary leading-none" style={{ fontFamily: 'Bebas Neue' }}>
                            {booking.amountPaid}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">NET PAID</span>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        {getStatusBadge(booking.status)}
                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
                          {booking.isOffline ? 'OFFLINE' : 'ONLINE'}
                        </span>
                      </div>
                    </div>

                    {/* Elite Action Bar */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-10 w-10 md:h-11 md:w-11 rounded-2xl hover:bg-green-500/10 text-green-500 transition-all active:scale-95"
                        title="Instant WhatsApp"
                      >
                        <a 
                          href={`https://wa.me/91${booking.contactNumber}?text=Hi ${booking.user}, greetings from ${booking.box.name}. Regarding your booking on ${formatBookingDate(booking.date)}...`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                           <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                           </svg>
                        </a>
                      </Button>

                      {booking.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => cancelBooking(booking._id)}
                          className="h-10 w-10 md:h-11 md:w-11 rounded-2xl hover:bg-destructive/10 text-destructive transition-all active:scale-95"
                          title="Revoke Booking"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card/20 backdrop-blur-sm rounded-3xl border border-dashed border-primary/20 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-primary/20" />
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">No Bookings Found</h3>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-2 leading-relaxed">
              We couldn't find any bookings matching your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookings
