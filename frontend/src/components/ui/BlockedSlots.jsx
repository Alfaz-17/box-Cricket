import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Ban, Square, Filter, CalendarX2 } from 'lucide-react'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

export default function BlockedSlots({ boxId }) {
  const [blockedSlots, setBlockedSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')

  // fetch block slots
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await api.get(`/slots/booked-blocked-slots/${boxId}`)
        setBlockedSlots(res.data.blockedSlots || [])
        setFilteredSlots(res.data.blockedSlots || [])
      } catch (error) {
        console.error('Failed to fetch blocked slots:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [boxId])

  //add filter for BlockSlots (date,quater)
  const filterSlots = (date, quarter) => {
    let filtered = blockedSlots

    if (quarter !== '' && quarter !== 'all') {
      filtered = filtered.filter(q => q.quarterName === quarter)
    }

    filtered = filtered.map(q => ({
      ...q,
      slots: date === '' ? q.slots : q.slots.filter(slot => slot.date === date),
    }))

    setFilteredSlots(filtered)
  }

  const handleDateChange = e => {
    const date = e.target.value
    setSelectedDate(date)
    filterSlots(date, selectedQuarter)
  }

  const handleQuarterChange = (value) => {
    const quarter = value === "all" ? "" : value
    setSelectedQuarter(quarter)
    filterSlots(selectedDate, quarter)
  }

  // Extract unique quarters from blocked slots
  const noFilteredResults = filteredSlots.every(q => q.slots.length === 0)

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )

  if (blockedSlots.length === 0)
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="flex justify-center mb-2">
            <CalendarX2 className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-lg font-medium">No blocked slots found</p>
          <p className="text-sm text-muted-foreground">You're all clear! No time blocks are currently scheduled.</p>
        </CardContent>
      </Card>
    )

  return (
    <Card className="bg-card shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          ⛔ Blocked Slots by Boxes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-center gap-4">
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
              {[...new Set(blockedSlots.map(q => q.quarterName))].map(name => (
                <SelectItem key={name} value={name}>
                  {name}-(box)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDate('')
              setSelectedQuarter('')
              setFilteredSlots(blockedSlots)
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
                  <Square className="w-5 h-5 text-destructive" />
                  <h3 className="text-lg font-semibold text-primary">
                    Boxes: {quarter.quarterName}-(box)
                  </h3>
                </div>

                <div className="space-y-3">
                  {quarter.slots.map(slot => (
                    <div
                      key={slot._id}
                      className="border border-border rounded-lg p-3 bg-card hover:bg-muted/50 shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1  ">
                        <Calendar className="w-4 h-4 text-destructive" />
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(slot.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1 ">
                        <Clock className="w-4 h-4 text-destructive" />
                        <span className="font-medium">Time:</span>
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2  ">
                        <Ban className="w-4 h-4 text-destructive" />
                        <span className="font-medium">Reason:</span>
                        <span>{slot.reason || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {noFilteredResults && (
          <div className="text-center bg-muted/30 p-4 rounded-md shadow mt-4">
            <p className="text-lg font-semibold">No blocked slots found for selected date.</p>
            <p className="text-sm text-muted-foreground">Try choosing a different date or clear the filter.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
