import React, { useEffect, useState } from 'react'
import { Calendar, Clock, UserRound, CalendarX2, Square, Filter } from 'lucide-react'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import socket from '../../utils/soket'
import toast from 'react-hot-toast'
export default function BookedSlots({ boxId }) {
  const [bookedSlots, setBookedSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')





   const fetchSlots =async () =>{
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
  //fetch Booked solts api
  useEffect(() => {
  
    fetchSlots();
  }, [boxId]);



  useEffect(() => {
  socket.on("new-booking", data => {
    console.log("📢 new-booking booking update received:", data);
    toast.success("New Booking created");
    fetchSlots() ; // refresh booked slots list
  })

  return () => socket.off("new-booking")
}, []);


  // Extract unique quarters from booked slots
  const uniqueQuarters = [...new Set(bookedSlots.map(q => q.quarterName))]

  // add filter
  const handleQuarterChange = (value) => {
    const quarter = value === "all" ? "" : value
    setSelectedQuarter(quarter)

    const filtered = bookedSlots
      .filter(q => quarter === '' || q.quarterName === quarter)
      .map(q => ({
        ...q,
        slots: selectedDate ? q.slots.filter(slot => slot.date === selectedDate) : q.slots,
      }))

    setFilteredSlots(filtered)
  }

  const handleDateChange = e => {
    const date = e.target.value
    setSelectedDate(date)

    const filtered = bookedSlots
      .filter(q => selectedQuarter === '' || q.quarterName === selectedQuarter)
      .map(q => ({
        ...q,
        slots: date ? q.slots.filter(slot => slot.date === date) : q.slots,
      }))

    setFilteredSlots(filtered)
  }

  // Filter out quarters with no slots after applying date filter
  const noFilteredResults = filteredSlots.every(q => q.slots.length === 0)

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )

  if (bookedSlots.length === 0)
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="flex justify-center mb-2">
            <CalendarX2 className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium">No upcoming booked slots</p>
          <p className="text-sm text-muted-foreground">There are currently no bookings scheduled for this box.</p>
        </CardContent>
      </Card>
    )

  return (
    <Card className="bg-card shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          📅 Booked Slots by Boxes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-auto"
            />
          </div>

          <Select value={selectedQuarter || "all"} onValueChange={handleQuarterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Boxes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boxes</SelectItem>
              {uniqueQuarters.map(qtr => (
                <SelectItem key={qtr} value={qtr}>
                  {qtr}-box
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDate('')
              setSelectedQuarter('')
              setFilteredSlots(bookedSlots)
            }}
            className="ml-auto text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            Clear Filter
          </Button>
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {filteredSlots.map(quarter =>
            quarter.slots.length === 0 ? null : (
              <div
                key={quarter.quarterName}
                className="border border-border rounded-lg p-4 bg-background/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Square className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">
                    Boxes:{quarter.quarterName}-(box)
                  </h3>
                </div>

                <div className="space-y-3">
                  {quarter.slots.map(slot => (
                    <div
                      key={slot._id}
                      className="border border-border rounded-lg p-3 bg-card hover:bg-muted/50 shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UserRound className="w-4 h-4 text-primary" />
                        <span className="font-medium">User:</span>
                        <span>{slot.user}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(slot.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">Time:</span>
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        {noFilteredResults && (
          <div className="text-center text-primary bg-muted/30 p-4 rounded-md shadow mt-4">
            <p className="font-medium">No booked slots found for selected filter(s).</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
