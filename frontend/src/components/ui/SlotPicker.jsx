import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Ban, Clock, ArrowRight, Sunrise, Sun, Sunset, Moon, CloudMoon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { format } from 'date-fns'
import socket from '../../utils/soket.js'
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef(null)

  const segments = {
    Morning: { range: [6, 12], label: 'Morning', sub: '6 AM - 12 PM', Icon: Sunrise },
    Afternoon: { range: [12, 17], label: 'Afternoon', sub: '12 PM - 5 PM', Icon: Sun },
    Evening: { range: [17, 21], label: 'Evening', sub: '5 PM - 9 PM', Icon: Sunset },
    Night: { range: [21, 24], label: 'Night', sub: '9 PM - 12 AM', Icon: Moon },
    Early: { range: [0, 6], label: 'Late Night', sub: '12 AM - 6 AM', Icon: CloudMoon },
  }

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      )
    }
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 200
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScroll()
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

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
    <div className="space-y-10 select-none">
      {/* Professional Segment Tabs with Scroll Indicators */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} className="text-foreground" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} className="text-foreground" />
          </button>
        )}

        {/* Left Fade Gradient */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
        )}

        {/* Right Fade Gradient */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
        )}

        {/* Scrollable Tabs Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Object.entries(segments).map(([key, segment]) => {
            const IconComponent = segment.Icon
            return (
              <button
                key={key}
                onClick={() => setActiveSegment(key)}
                className={cn(
                  "flex items-center gap-3 min-w-[140px] px-5 py-3 rounded-lg border transition-all duration-200 flex-shrink-0",
                  activeSegment === key 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20"
                )}
              >
                <IconComponent size={18} className="flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold uppercase tracking-wider">{segment.label}</span>
                  <span className="text-[10px] opacity-60 font-medium whitespace-nowrap">{segment.sub}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSlots.map((slot) => {
          const booked = isSlotBooked(slot)
          const blocked = isSlotBlocked(slot)
          const isPast = isPastSlot(slot)
          const isSelected = selectedSlots.some(s => s.id === slot.id)
          const disabled = booked || blocked || isPast

          return (
            <motion.button
              key={slot.id}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => handleSlotClick(slot)}
              disabled={disabled}
              className={cn(
                "group relative flex flex-col items-center justify-center p-6 rounded-lg border transition-all h-32",
                isSelected 
                  ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                  : booked || blocked
                    ? "bg-muted/50 border-border opacity-50 cursor-not-allowed grayscale"
                    : isPast
                      ? "bg-muted/20 border-border opacity-30 cursor-not-allowed"
                      : "bg-card border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                )}
            >
              {/* Status Signal Indicator - Top Right */}
              <div className="absolute top-2 right-2">
                {booked || blocked ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  </div>
                ) : isPast ? (
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                ) : isSelected ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-white/50" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  </div>
                )}
              </div>

              {/* Time Section */}
              <div className="flex flex-col items-center gap-1">
                <span className={cn(
                  "text-2xl font-bold tracking-tight",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}>
                  {slot.shortDisplay} - {slot.endTime.split(' ')[0]}
                </span>
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest",
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {slot.period} (1 Hour Slot)
                </span>
              </div>
 
              {/* Status Label */}
              <div className={cn(
                "mt-4 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider border",
                isSelected 
                  ? "bg-white/10 border-white/20 text-white" 
                  : booked || blocked
                    ? "bg-red-500/10 text-red-500 border-red-500/20" 
                    : isPast 
                      ? "bg-muted/10 text-muted-foreground border-transparent" 
                      : "bg-green-500/10 text-green-500 border-green-500/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-colors"
              )}>
                {booked ? 'Booked' : blocked ? 'Unavailable' : isPast ? 'Passed' : isSelected ? 'Selected' : 'Available'}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-border">
        {[
          { color: 'bg-primary', label: 'Available - Tap to book' },
          { color: 'bg-secondary', label: 'Selected - Your slots' },
          { color: 'bg-destructive', label: 'Booked - Already taken' },
          { color: 'bg-muted', label: 'Passed - Time expired' },
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
