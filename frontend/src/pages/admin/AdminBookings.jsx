import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, User, Search, Phone, Filter, ChevronDown } from 'lucide-react'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled
  const [selectedQuarter, setSelectedQuarter] = useState('all')

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary tracking-wide">
            Booking Management
          </h1>
          <p className="text-muted-foreground">View and manage all your turf bookings.</p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user or box..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/30 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 font-bold">User Details</th>
                  <th className="px-6 py-4 font-bold">Booking Info</th>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{booking.user}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone size={10} /> 
                              {booking.contactNumber ? (
                                <a href={`tel:${booking.contactNumber}`} className="hover:text-primary transition-colors">
                                  {booking.contactNumber}
                                </a>
                              ) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground flex items-center gap-2">
                           <MapPin size={14} className="text-primary" /> {booking.box.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 pl-6">
                          {booking.quarterName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar size={14} className="text-muted-foreground" />
                          {formatDate(booking.date)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock size={14} />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg text-primary">₹{booking.amountPaid}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            booking.status === 'confirmed' ? 'default' : 
                            booking.status === 'completed' ? 'secondary' : 'destructive'
                          }
                          className={`uppercase tracking-wider font-bold ${
                            booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' : 
                            booking.status === 'completed' ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20' : 
                            'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20'
                          }`}
                        >
                          {booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={32} className="opacity-20" />
                        <p>No bookings found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminBookings
