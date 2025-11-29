import React, { useEffect, useState, useMemo } from 'react'
import { Calendar, Clock, Ban, CalendarX2 } from 'lucide-react'
import api from '../../utils/api'
import { formatDate, formatTime } from '../../utils/formatDate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { List, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function BlockedSlots({ boxId }) {
  const [blockedSlots, setBlockedSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')

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

  const applyFilters = (date, quarter) => {
    const filtered = blockedSlots
      .filter(q => quarter === '' || q.quarterName === quarter)
      .map(q => ({
        ...q,
        slots: date ? q.slots.filter(slot => slot.date === date) : q.slots,
      }))
      .filter(q => q.slots.length > 0)

    setFilteredSlots(filtered)
  }

  const handleDateChange = date => {
    setSelectedDate(date)
    const dateString = date ? date.toISOString().split('T')[0] : ''
    applyFilters(dateString, selectedQuarter)
  }

  const handleQuarterChange = (value) => {
    const quarter = value === "all" ? "" : value
    setSelectedQuarter(quarter)
    applyFilters(selectedDate, quarter)
  }

  // Flatten the list for virtualization
  const flattenedItems = useMemo(() => {
    const items = []
    filteredSlots.forEach(quarter => {
      items.push({ type: 'header', content: quarter.quarterName })
      quarter.slots.forEach(slot => {
        items.push({ type: 'slot', content: slot })
      })
    })
    return items
  }, [filteredSlots])

  const rowRenderer = ({ index, key, style }) => {
    const item = flattenedItems[index]

    if (item.type === 'header') {
      return (
        <div key={key} style={style} className="flex items-end pb-2">
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/5 pb-1 inline-block">
            {item.content}
          </h3>
        </div>
      )
    }

    const slot = item.content
    return (
      <div key={key} style={{ ...style, height: style.height - 12 }} className="pr-2">
        <div className="group relative flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-r-xl transition-all duration-300 overflow-hidden h-full">
            {/* Accent Bar - Destructive for Blocked */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" />

            <div className="flex flex-col gap-1 pl-3">
                {/* Reason / Title */}
                <div className="flex items-center gap-2">
                    <Ban className="w-3 h-3 text-destructive/70" />
                    <span className="font-bold text-foreground text-sm tracking-wide">
                        {slot.reason || 'Blocked'}
                    </span>
                </div>
                
                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(slot.date)}</span>
                </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <Clock className="w-3 h-3 text-destructive" />
                <span className="text-xs font-mono font-medium text-destructive">
                    {slot.startTime} - {slot.endTime}
                </span>
            </div>
        </div>
      </div>
    )
  }

  const getRowHeight = ({ index }) => {
    return flattenedItems[index].type === 'header' ? 40 : 80
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-destructive"></div>
      </div>
    )

  if (blockedSlots.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-destructive/20 rounded-2xl bg-destructive/5">
        <CalendarX2 className="w-10 h-10 text-destructive/50 mb-3" />
        <p className="text-lg font-medium text-destructive">No blocked slots</p>
        <p className="text-sm text-muted-foreground">All slots are currently open.</p>
      </div>
    )

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 shrink-0">
        <h2 className="text-xl font-bold text-destructive" style={{ fontFamily: 'Bebas Neue' }}>
          Blocked Slots
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
              {[...new Set(blockedSlots.map(q => q.quarterName))].map(name => (
                <SelectItem key={name} value={name}>
                  {name}
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
                  setFilteredSlots(blockedSlots)
                }}
                className="h-9 text-xs text-muted-foreground hover:text-destructive col-span-2 sm:col-span-1"
              >
                Clear
              </Button>
          )}
        </div>
      </div>

      {/* Virtualized List */}
      <div className="flex-1 min-h-[500px]" style={{ height: 500 }}>
        {flattenedItems.length > 0 ? (
            <AutoSizer>
            {({ height, width }) => (
                <List
                width={width}
                height={height}
                rowCount={flattenedItems.length}
                rowHeight={getRowHeight}
                rowRenderer={rowRenderer}
                />
            )}
            </AutoSizer>
        ) : (
            <div className="text-center py-8 text-muted-foreground">
                <p>No blocked slots found for the selected filters.</p>
            </div>
        )}
      </div>
    </div>
  )
}
