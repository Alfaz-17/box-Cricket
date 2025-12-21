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

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot) => {
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
            className={`
              relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 w-full group
              ${selected 
                ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(157,255,0,0.3)]' 
                : disabled
                  ? 'bg-muted/20 border-white/5 opacity-60 cursor-not-allowed pointer-events-none'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                ${selected 
                  ? 'bg-primary border-primary text-black' 
                  : disabled
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/30 group-hover:border-primary/50'
                }
              `}>
                {selected && <Check size={14} strokeWidth={3} />}
                {booked && <Lock size={12} className="text-white/30" />}
                {blocked && <Ban size={12} className="text-destructive/50" />}
                {isPast && !booked && !blocked && <Clock size={12} className="text-white/20" />}
              </div>
              
              <span className={`
                font-medium text-lg tracking-wide
                ${selected ? 'text-primary' : disabled ? 'text-muted-foreground line-through' : 'text-foreground'}
              `} style={{ fontFamily: 'Bebas Neue' }}>
                {slot.display}
              </span>
            </div>

            {disabled && (
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50 px-2 py-1 rounded bg-black/20">
                {booked ? 'Booked' : blocked ? 'Blocked' : 'Past'}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default SlotPicker
