import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Ban, Clock } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming you have a cn utility, if not I'll use template literals
import { format } from 'date-fns'
import socket from '@/utils/soket.js'
import { toast } from 'react-hot-toast'

const SlotPicker = ({
  selectedDate,
  bookedSlots = [],
  blockedSlots = [],
  selectedQuarter,
  onSlotSelect,
  selectedSlots = [],
  boxId, // Add boxId prop for WebSocket room
  onSlotsUpdate // Add callback to refresh slots from parent
}) => {
  const [slots, setSlots] = useState([])

  // Generate 24 1-hour slots for the day
  useEffect(() => {
    const generatedSlots = []
    for (let i = 0; i < 24; i++) {
      // Create date objects for formatting
      const date = new Date()
      date.setHours(i, 0, 0, 0)
      const displayStart = format(date, 'hh:mm a') // "12:00 PM"
      
      const endDate = new Date()
      endDate.setHours(i + 1, 0, 0, 0)
      const displayEnd = format(endDate, 'hh:mm a') // "01:00 PM"

      generatedSlots.push({
        id: i,
        startTime: displayStart, // "12:00 PM" - Matches backend parseDateTime
        endTime: displayEnd,     // "01:00 PM"
        display: `${displayStart} - ${displayEnd}`,
        rawStart: i
      })
    }
    setSlots(generatedSlots)
  }, [])

  const isSlotBooked = (slot) => {
    if (!selectedDate || !selectedQuarter) return false
    
    // Find the group for the selected quarter
    // Backend now returns quarterId in the group
    const group = bookedSlots.find(g => g.quarterId === selectedQuarter)
    if (!group) return false

    // Define slot time range
    const slotStart = new Date(selectedDate)
    slotStart.setHours(slot.id, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slot.id + 1, 0, 0, 0)

    return group.slots.some(booking => {
       // Only count as booked if paid and confirmed
       const isPaidAndConfirmed = 
         booking.status === 'confirmed' && 
         (booking.paymentStatus === 'paid' || booking.isOffline);
         
       if (!isPaidAndConfirmed) return false;

       // Use startDateTime/endDateTime for robust overlap check
       const bStart = new Date(booking.startDateTime)
       const bEnd = new Date(booking.endDateTime)
       return bStart < slotEnd && bEnd > slotStart
    })
  }

  const isSlotBlocked = (slot) => {
    if (!selectedDate || !selectedQuarter) return false
    
    const group = blockedSlots.find(g => g.quarterId === selectedQuarter)
    if (!group) return false

    const slotStart = new Date(selectedDate)
    slotStart.setHours(slot.id, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slot.id + 1, 0, 0, 0)

    return group.slots.some(block => {
       let bStart = new Date(block.startDateTime)
       let bEnd = new Date(block.endDateTime)
       
       // 🔥 Handle overnight blocking (e.g. 11PM → 2AM)
       // If end is before or equal to start, it spans to next day
       if (bEnd <= bStart) {
         bEnd = new Date(bEnd)
         bEnd.setDate(bEnd.getDate() + 1)
       }
       
       return bStart < slotEnd && bEnd > slotStart
    })
  }

  // Check if slot is in the past
  const isPastSlot = (slot) => {
    if (!selectedDate) return false
    
    const now = new Date() // Current time: 2025-12-21T11:26:25+05:30
    const slotStart = new Date(selectedDate)
    slotStart.setHours(slot.id, 0, 0, 0)
    
    return slotStart < now
  }

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!boxId) return

    // Join the box room
    socket.emit("join-box", `box-${boxId}`)

    // Listen for new bookings
    const handleNewBooking = (data) => {
      console.log('🔔 New booking received:', data)
      if (onSlotsUpdate) {
        onSlotsUpdate() // Refresh slots from parent
      }
    }

    // Listen for blocked slots
    const handleSlotBlocked = (data) => {
      console.log('🔔 Slot blocked:', data)
      if (onSlotsUpdate) {
        onSlotsUpdate()
      }
    }

    // Listen for unblocked slots
    const handleSlotUnblocked = (data) => {
      console.log('🔔 Slot unblocked:', data)
      if (onSlotsUpdate) {
        onSlotsUpdate()
      }
    }

    socket.on("new-booking", handleNewBooking)
    socket.on("slot-blocked", handleSlotBlocked)
    socket.on("slot-unblocked", handleSlotUnblocked)

    // Cleanup
    return () => {
      socket.off("new-booking", handleNewBooking)
      socket.off("slot-blocked", handleSlotBlocked)
      socket.off("slot-unblocked", handleSlotUnblocked)
      socket.emit("leave-box", `box-${boxId}`)
    }
  }, [boxId, onSlotsUpdate])

  const handleSlotClick = (slot) => {
    // Prevent clicking on booked, blocked, or past slots
    if (isSlotBooked(slot) || isSlotBlocked(slot) || isPastSlot(slot)) return

    // Toggle selection logic
    // If slot is already selected, deselect it
    if (selectedSlots.some(s => s.id === slot.id)) {
      const newSlots = selectedSlots.filter(s => s.id !== slot.id)
      onSlotSelect(newSlots)
      return
    }

    // If adding a new slot, ensure it's contiguous
    if (selectedSlots.length > 0) {
      const sorted = [...selectedSlots].sort((a, b) => a.id - b.id)
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      
      // Allow extending from start or end
      if (slot.id === first.id - 1 || slot.id === last.id + 1) {
        const newSlots = [...selectedSlots, slot].sort((a, b) => a.id - b.id)
        onSlotSelect(newSlots)
      } else {
        // If not contiguous, reset and select only the new one (or show error)
        // For better UX, let's just select the new one and clear others
        onSlotSelect([slot])
      }
    } else {
      onSlotSelect([slot])
    }
  }

  const [activeSegment, setActiveSegment] = useState('Morning')

  const segments = {
    Morning: { range: [6, 12], label: '6am - 12pm' },
    Afternoon: { range: [12, 17], label: '12pm - 5pm' },
    Evening: { range: [17, 21], label: '5pm - 9pm' },
    Night: { range: [21, 24], label: '9pm - 12am' },
    Early: { range: [0, 6], label: '12am - 6am' },
  }

  const filteredSlots = slots.filter(slot => {
    const [start, end] = segments[activeSegment].range
    return slot.rawStart >= start && slot.rawStart < end
  })

  return (
    <div className="space-y-6">
      {/* Segment Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide gap-2">
        {Object.keys(segments).map((segment) => (
          <button
            key={segment}
            onClick={() => setActiveSegment(segment)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
              activeSegment === segment 
                ? "bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/20" 
                : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/20"
            )}
          >
            {segment}
            <span className="block text-[8px] opacity-60 font-medium mt-0.5">{segments[segment].label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredSlots.map((slot) => {
          const booked = isSlotBooked(slot)
          const blocked = isSlotBlocked(slot)
          const isPast = isPastSlot(slot)
          const selected = selectedSlots.some(s => s.id === slot.id)
          const disabled = booked || blocked || isPast

          return (
            <motion.button
              key={slot.id}
              whileHover={!disabled ? { scale: 1.01, x: 2 } : {}}
              whileTap={!disabled ? { scale: 0.99 } : {}}
              onClick={() => handleSlotClick(slot)}
              disabled={disabled}
              className={cn(
                "relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 w-full group overflow-hidden",
                selected 
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_0_20px_rgba(143,163,30,0.3)]" 
                  : disabled
                    ? "bg-muted/5 border-border/10 opacity-60 cursor-not-allowed grayscale"
                    : "bg-background/40 hover:bg-background/60 border-border/40 hover:border-secondary/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  selected ? "bg-white/20" : "bg-muted/10 group-hover:bg-secondary/10"
                )}>
                  {selected && <Check size={20} strokeWidth={3} />}
                  {booked && <Lock size={16} className="text-muted-foreground" />}
                  {blocked && <Ban size={16} className="text-destructive/50" />}
                  {!disabled && !selected && <Clock size={18} className="text-secondary/60" />}
                </div>
                
                <div className="text-left">
                  <span className={cn(
                    "block font-bold text-lg leading-tight font-display tracking-tight",
                    selected ? "text-secondary-foreground" : disabled ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {slot.display}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">
                    {booked ? 'Occupied' : blocked ? 'Maintenance' : isPast ? 'Expired' : 'Available'}
                  </span>
                </div>
              </div>

              {!disabled && !selected && (
                <div className="w-8 h-8 rounded-full bg-secondary/0 group-hover:bg-secondary/10 flex items-center justify-center transition-all">
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-secondary" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default SlotPicker
