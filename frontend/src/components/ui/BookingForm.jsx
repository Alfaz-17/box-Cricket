import React from 'react'
import { Phone, Info, CheckCircle2, ArrowRight, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import TimePicker from './TimePicker'

const BookingForm = ({
  displayBox,
  selectedDate,
  setSelectedDate,
  selectedTime,
  handleTimeChange,
  duration,
  setDuration,
  contactNumber,
  setContactNumber,
  selectedQuarter,
  setSelectedQuarter,
  availableTimes,
  setAvailableTimes,
  isCheckingAvailability,
  isProcessingBooking,
  handleCheckAvailability,
  handleBooking,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Bebas Neue' }}>
            Book Your Slot
        </h2>
      </div>

      {/* Offline Booking Notice */}
      <div className="p-4 bg-destructive/5 border-l-2 border-destructive rounded-r-lg">
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-destructive mb-1 text-sm uppercase tracking-wide">Book Offline</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Online booking is currently <strong>unavailable</strong>. Please call to reserve.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive h-9 text-sm"
              >
                <a href={`tel:${displayBox.mobileNumber}`} className="flex items-center gap-2">
                  <Phone size={14} />
                  +91 - {displayBox.mobileNumber || 'N/A'}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Date</label>
          <div className="relative">
            <DatePicker
                selected={selectedDate}
                onChange={date => {
                setSelectedDate(date)
                setAvailableTimes(false)
                }}
                minDate={new Date()}
                className="flex h-11 w-full rounded-none border-b border-white/20 bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                dateFormat="MMMM d, yyyy"
                placeholderText="Select a date"
            />
          </div>
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Number</label>
          <Input
            type="tel"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
            placeholder="Enter contact number"
            className="h-11 rounded-none border-0 border-b border-white/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Time</label>
          <TimePicker value={selectedTime} onChange={handleTimeChange} />
          <p className="text-xs text-primary mt-1 font-mono">
            {selectedTime ? `Selected: ${selectedTime}` : ' '}
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
          <Select value={duration.toString()} onValueChange={val => setDuration(Number(val))}>
            <SelectTrigger className="h-11 rounded-none border-0 border-b border-white/20 bg-transparent px-0 focus:ring-0 focus:border-primary">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map(hours => (
                <SelectItem key={hours} value={hours.toString()}>
                  {hours} hour{hours > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Box Selection */}
        <div className="sm:col-span-2 lg:col-span-1 space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Box</label>
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="h-11 rounded-none border-0 border-b border-white/20 bg-transparent px-0 focus:ring-0 focus:border-primary">
              <SelectValue placeholder="-- Select a Box --" />
            </SelectTrigger>
            <SelectContent>
              {displayBox.quarters?.map(quarter => (
                <SelectItem key={quarter._id} value={quarter._id}>
                  {quarter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            onClick={handleCheckAvailability}
            variant="outline"
            className="w-full h-12 border-primary/50 text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-wide"
            disabled={isCheckingAvailability}
          >
            {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {contactNumber && availableTimes && duration && selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              onClick={handleBooking}
              className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(157,255,0,0.3)]"
              disabled={isProcessingBooking}
            >
              {isProcessingBooking ? 'Booking...' : 'Book Now'}
              <Trophy className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Booking Policy */}
      <div className="pt-6 border-t border-white/5">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-muted-foreground mt-1" />
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Booking Policy</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span>Cancellation allowed up to 24 hours before booking time</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span>Payment is processed upon booking confirmation</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span>Please arrive 15 minutes before your slot</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
