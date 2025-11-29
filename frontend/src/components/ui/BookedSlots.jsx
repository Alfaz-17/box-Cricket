import React, { useEffect, useState, useMemo } from 'react'
import { Calendar, Clock, UserRound, CalendarX2 } from 'lucide-react'
import api from '../../utils/api'
import { convertTo12Hour, formatDate, formatEndTime, formatTime } from '../../utils/formatDate'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import socket from '../../utils/soket'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { motion } from 'framer-motion'

export default function BookedSlots({ boxId }) {
  const [bookedSlots, setBookedSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')

  const fetchSlots = async () => {
    try {
      const res = await api.get(`/slots/booked-blocked-slots/${boxId}`)
      setBookedSlots(res.data.bookedSlots || [])
      setFilteredSlots(res.data.bookedSlots || [])
    } catch (error) {
      console.error('Failed to fetch booked slots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [boxId])

  useEffect(() => {
    socket.on("new-booking", data => {
      console.log("📢 new-booking booking update received:", data)
      toast.success("New Booking created")
      fetchSlots()
    })

    return () => socket.off("new-booking")
  }, [])

  const uniqueQuarters = useMemo(() => [...new Set(bookedSlots.map(q => q.quarterName))], [bookedSlots])

  const handleQuarterChange = (value) => {
    const quarter = value === "all" ? "" : value
    setSelectedQuarter(quarter)
    applyFilters(selectedDate, quarter)
  }

  const handleDateChange = date => {
    setSelectedDate(date)
    const dateString = date ? date.toISOString().split('T')[0] : ''
    applyFilters(dateString, selectedQuarter)
  }

  const applyFilters = (date, quarter) => {
    const filtered = bookedSlots
      .filter(q => quarter === '' || q.quarterName === quarter)
      .map(q => ({
        ...q,
        slots: date ? q.slots.filter(slot => slot.date === date) : q.slots,
      }))
      .filter(q => q.slots.length > 0)

    setFilteredSlots(filtered)
  }

  // Group slots by Date -> Quarter
  const groupedSlots = useMemo(() => {
    const groups = {}
    filteredSlots.forEach(quarter => {
      quarter.slots.forEach(slot => {
        if (!groups[slot.date]) {
          groups[slot.date] = []
        }
        groups[slot.date].push({ ...slot, quarterName: quarter.quarterName })
      })
    })
    // Sort dates
    return Object.keys(groups).sort().map(date => ({
      date,
      slots: groups[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
    }))
  }, [filteredSlots])

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  if (bookedSlots.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-primary/20 rounded-2xl bg-primary/5">
        <CalendarX2 className="w-10 h-10 text-primary/50 mb-3" />
        <p className="text-lg font-medium text-primary">No upcoming bookings</p>
        <p className="text-sm text-muted-foreground">The schedule is currently empty.</p>
      </div>
    )

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 shrink-0">
        <h2 className="text-xl font-bold text-primary" style={{ fontFamily: 'Bebas Neue' }}>
          Booked Slots
        </h2>
        
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full md:w-auto">
          <div className="relative col-span-2 sm:col-span-1">
             <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              className="w-full sm:w-auto h-9 bg-transparent border-b border-white/20 text-xs focus:outline-none placeholder:text-muted-foreground"
              placeholderText="Filter by Date"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <Select value={selectedQuarter || "all"} onValueChange={handleQuarterChange}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 bg-transparent border-white/10 text-xs">
              <SelectValue placeholder="All Boxes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boxes</SelectItem>
              {uniqueQuarters.map(qtr => (
                <SelectItem key={qtr} value={qtr}>
                  {qtr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedDate || selectedQuarter) && (
             <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate('')
                  setSelectedQuarter('')
                  setFilteredSlots(bookedSlots)
                }}
                className="h-9 text-xs text-muted-foreground hover:text-primary col-span-2 sm:col-span-1"
              >
                Clear
              </Button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        {groupedSlots.length > 0 ? (
          groupedSlots.map((group) => (
            <div key={group.date} className="space-y-4">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                <h3 className="text-lg font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(group.date)}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.slots.map((slot, idx) => (
                  <motion.div
                    key={`${slot._id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {slot.quarterName}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {convertTo12Hour(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold text-xs">
                        {slot.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground text-sm truncate">
                        {slot.user}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
             <div className="text-center py-8 text-muted-foreground">
                <p>No bookings found for the selected filters.</p>
            </div>
        )}
      </div>
    </div>
  )
}
