import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming you have a cn utility, if not I'll use template literals
import { format } from 'date-fns'

const SlotPicker = ({
  selectedDate,
  bookedSlots = [],
  blockedSlots = [],
  selectedQuarter,
  onSlotSelect,
  selectedSlots = []
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
       const bStart = new Date(block.startDateTime)
       const bEnd = new Date(block.endDateTime)
       return bStart < slotEnd && bEnd > slotStart
    })
  }

  const handleSlotClick = (slot) => {
    if (isSlotBooked(slot) || isSlotBlocked(slot)) return

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
        const selected = selectedSlots.some(s => s.id === slot.id)
        const disabled = booked || blocked

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
                {booked ? 'Booked' : 'Blocked'}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default SlotPicker
