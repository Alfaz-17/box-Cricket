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
    <div className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-primary/20">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">
        Book Your Slot
      </h2>

      {/* Offline Booking Notice */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
        <div className="flex items-start gap-2 sm:gap-3">
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-destructive mb-1 sm:mb-2 text-sm sm:text-base">Book Offline</h3>
            <p className="text-xs sm:text-sm mb-2 sm:mb-3">
              Online booking is currently <strong>unavailable (In development)</strong>. Please
              call the number below to reserve this box.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 w-full sm:w-auto text-sm sm:text-base"
              >
                <a href={`tel:${displayBox.mobileNumber}`} className="flex items-center gap-2 justify-center">
                  <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
                  +91 - {displayBox.mobileNumber || 'N/A'}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Form - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Date Picker */}
        <div>
          <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={date => {
              setSelectedDate(date)
              setAvailableTimes(false)
            }}
            minDate={new Date()}
            className="flex h-10 sm:h-11 w-full rounded-lg border-2 border-primary/20 bg-background px-3 sm:px-4 py-2 text-xs sm:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            dateFormat="MMMM d, yyyy"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Contact Number</label>
          <Input
            type="tel"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
            placeholder="Enter contact number"
            className="border-2 border-primary/20 focus:border-primary h-10 sm:h-11 text-xs sm:text-sm"
          />
        </div>

        {/* Time Picker */}
        <div>
          <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Select Time</label>
          <TimePicker value={selectedTime} onChange={handleTimeChange} />
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
            Selected: {selectedTime || 'None'}
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Duration</label>
          <Select value={duration.toString()} onValueChange={val => setDuration(Number(val))}>
            <SelectTrigger className="border-2 border-primary/20 h-10 sm:h-11">
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
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs sm:text-sm font-bold mb-2 block text-primary">Select Box</label>
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="border-2 border-primary/20 h-10 sm:h-11">
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            onClick={handleCheckAvailability}
            variant="secondary"
            className="w-full h-11 sm:h-12 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg font-bold text-sm sm:text-base"
            disabled={isCheckingAvailability}
          >
            {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
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
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg font-bold text-sm sm:text-base"
              disabled={isProcessingBooking}
            >
              {isProcessingBooking ? 'Booking...' : 'Book Now'}
              <Trophy className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Booking Policy */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info size={18} className="sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold mb-1 sm:mb-2 text-primary text-sm sm:text-base">Booking Policy</p>
            <ul className="space-y-1 sm:space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Cancellation allowed up to 24 hours before booking time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Payment is processed upon booking confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
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
