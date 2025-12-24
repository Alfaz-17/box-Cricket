import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Ban, Clock, ArrowRight } from 'lucide-react'
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
  boxId,
  onSlotsUpdate
}) => {
  const [slots, setSlots] = useState([])
  const [activeSegment, setActiveSegment] = useState('Morning')

  const segments = {
    Morning: { range: [6, 12], label: 'Morning', sub: '6 AM - 12 PM', icon: '🌅' },
    Afternoon: { range: [12, 17], label: 'Afternoon', sub: '12 PM - 5 PM', icon: '☀️' },
    Evening: { range: [17, 21], label: 'Evening', sub: '5 PM - 9 PM', icon: '🌇' },
    Night: { range: [21, 24], label: 'Night', sub: '9 PM - 12 AM', icon: '🌙' },
    Early: { range: [0, 6], label: 'Graveyard', sub: '12 AM - 6 AM', icon: '🌒' },
  }

  useEffect(() => {
    const generatedSlots = []
    for (let i = 0; i < 24; i++) {
      const date = new Date()
      date.setHours(i, 0, 0, 0)
      const displayStart = format(date, 'hh:mm a')
      
      const endDate = new Date()
      endDate.setHours(i + 1, 0, 0, 0)
      const displayEnd = format(endDate, 'hh:mm a')

      generatedSlots.push({
        id: i,
        startTime: displayStart,
        endTime: displayEnd,
        display: `${displayStart} - ${displayEnd}`,
        shortDisplay: format(date, 'hh:mm'),
        period: format(date, 'a'),
        rawStart: i
      })
    }
    setSlots(generatedSlots)
  }, [])

  const isSlotBooked = (slot) => {
    if (!selectedDate || !selectedQuarter) return false
    const group = bookedSlots.find(g => g.quarterId === selectedQuarter)
    if (!group) return false

    const slotStart = new Date(selectedDate)
    slotStart.setHours(slot.id, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slot.id + 1, 0, 0, 0)

    return group.slots.some(booking => {
       const isPaidAndConfirmed = 
         booking.status === 'confirmed' && 
         (booking.paymentStatus === 'paid' || booking.isOffline);
       if (!isPaidAndConfirmed) return false;

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
       if (bEnd <= bStart) {
         bEnd = new Date(bEnd)
         bEnd.setDate(bEnd.getDate() + 1)
       }
       return bStart < slotEnd && bEnd > slotStart
    })
  }

  const isPastSlot = (slot) => {
    if (!selectedDate) return false
    const now = new Date()
    const slotStart = new Date(selectedDate)
    slotStart.setHours(slot.id, 0, 0, 0)
    return slotStart < now
  }

  useEffect(() => {
    if (!boxId) return
    socket.emit("join-box", `box-${boxId}`)

    const refresh = () => onSlotsUpdate && onSlotsUpdate()
    socket.on("new-booking", refresh)
    socket.on("slot-blocked", refresh)
    socket.on("slot-unblocked", refresh)

    return () => {
      socket.off("new-booking", refresh)
      socket.off("slot-blocked", refresh)
      socket.off("slot-unblocked", refresh)
      socket.emit("leave-box", `box-${boxId}`)
    }
  }, [boxId, onSlotsUpdate])

  const handleSlotClick = (slot) => {
    if (isSlotBooked(slot) || isSlotBlocked(slot) || isPastSlot(slot)) return

    if (selectedSlots.some(s => s.id === slot.id)) {
      onSlotSelect(selectedSlots.filter(s => s.id !== slot.id))
      return
    }

    if (selectedSlots.length > 0) {
      const sorted = [...selectedSlots].sort((a, b) => a.id - b.id)
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      
      if (slot.id === first.id - 1 || slot.id === last.id + 1) {
        onSlotSelect([...selectedSlots, slot].sort((a, b) => a.id - b.id))
      } else {
        onSlotSelect([slot])
      }
    } else {
      onSlotSelect([slot])
    }
  }

  const filteredSlots = slots.filter(slot => {
    const [start, end] = segments[activeSegment].range
    return slot.rawStart >= start && slot.rawStart < end
  })

  return (
    <div className="space-y-8 select-none">
      {/* Premium Segment Tabs */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide gap-3">
        {Object.entries(segments).map(([key, segment]) => (
          <button
            key={key}
            onClick={() => setActiveSegment(key)}
            className={cn(
              "flex flex-col items-start min-w-[140px] p-4 rounded-2xl border transition-all duration-500",
              activeSegment === key 
                ? "bg-secondary text-secondary-foreground border-secondary shadow-xl shadow-secondary/20 scale-105" 
                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
            )}
          >
            <span className="text-xl mb-1">{segment.icon}</span>
            <span className="text-xs font-black uppercase tracking-widest">{segment.label}</span>
            <span className="text-[10px] opacity-60 font-medium whitespace-nowrap">{segment.sub}</span>
          </button>
        ))}
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSlots.map((slot) => {
          const booked = isSlotBooked(slot)
          const blocked = isSlotBlocked(slot)
          const isPast = isPastSlot(slot)
          const isSelected = selectedSlots.some(s => s.id === slot.id)
          const disabled = booked || blocked || isPast

          return (
            <motion.button
              key={slot.id}
              whileHover={!disabled ? { y: -4, scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => handleSlotClick(slot)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 min-h-[140px]",
                isSelected 
                  ? "bg-secondary border-secondary shadow-[0_20px_40px_-10px_rgba(143,163,30,0.5)] z-10" 
                  : booked || blocked
                    ? "bg-red-500/5 border-red-500/20 opacity-80 cursor-not-allowed"
                    : isPast
                      ? "bg-muted/5 border-white/5 opacity-40 cursor-not-allowed grayscale"
                      : "bg-white/5 border-white/10 hover:border-green-500/50 hover:bg-white/10"
              )}
            >
              {/* Status Indicator */}
              <div className="absolute top-3 right-3 flex gap-1">
                {isSelected && <div className="w-2 h-2 bg-black rounded-full animate-pulse" />}
                {!disabled && !isSelected && <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full" />}
                {(booked || blocked) && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
              </div>

              {/* Time Section */}
              <div className="flex flex-col items-center gap-1">
                <span className={cn(
                  "text-5xl font-black font-display tracking-tight leading-none",
                  isSelected ? "text-secondary-foreground" : booked || blocked ? "text-red-500/50" : "text-foreground"
                )}>
                  {slot.shortDisplay}
                </span>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-[0.2em] opacity-80",
                  isSelected ? "text-secondary-foreground" : "text-muted-foreground"
                )}>
                  {slot.period} - {format(new Date().setHours(slot.id + 1), 'hh a')}
                </span>
              </div>

              {/* Status Label */}
              <div className={cn(
                "mt-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                isSelected 
                  ? "bg-black/20 text-black" 
                  : booked 
                    ? "bg-red-500/10 text-red-500" 
                    : blocked 
                      ? "bg-red-500/10 text-red-500" 
                      : isPast 
                        ? "bg-white/5 text-muted-foreground" 
                        : "bg-green-500/10 text-green-500"
              )}>
                {booked ? 'Booked' : blocked ? 'Blocked' : isPast ? 'Past' : isSelected ? 'Selected' : 'Available'}
              </div>

              {/* Selection Border */}
              {isSelected && (
                <motion.div 
                  layoutId="selection" 
                  className="absolute inset-[-2px] border-4 border-secondary/50 rounded-3xl"
                  initial={false}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10">
        {[
          { color: 'bg-green-500', label: 'Available' },
          { color: 'bg-secondary', label: 'Selected' },
          { color: 'bg-red-500', label: 'Occupied' },
          { color: 'bg-muted', label: 'Past' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", item.color)} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SlotPicker
