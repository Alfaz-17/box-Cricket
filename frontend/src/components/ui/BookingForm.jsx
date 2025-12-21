import React from 'react'
import { Phone, Info, CheckCircle2, ArrowRight, Trophy, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import SlotPicker from './SlotPicker'

const BookingForm = ({
  displayBox,
  selectedDate,
  setSelectedDate,
  selectedSlots,
  onSlotSelect,
  bookedSlots,
  blockedSlots,
  contactNumber,
  setContactNumber,
  selectedQuarter,
  setSelectedQuarter,
  isProcessingBooking,
  handleBooking,
  isOwner = false,
  boxId, // Add boxId prop
  onSlotsUpdate, // Add callback for slot updates
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Bebas Neue' }}>
            Book Your Slot
        </h2>
      </div>



      {/* Booking Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-primary/10 border-l-2 border-primary py-5  rounded-r-lg">
        {/* Left Column: Date & Details */}
        <div className="space-y-6 mx-4 ">
            {/* Box Selection */}
            <div className="space-y-2 ">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Box</label>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 px-4 focus:ring-primary/50 focus:border-primary">
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

            {/* Date Picker */}
            <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Date</label>
            <div className="relative">
                <DatePicker
                    selected={selectedDate}
                    onChange={date => {
                    setSelectedDate(date)
                    }}
                    minDate={new Date()}
                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
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
                className="h-12 rounded-xl border-white/10 bg-white/5 px-4 focus-visible:ring-primary/50 focus-visible:border-primary"
            />
            </div>

            {/* Summary / Actions */}
            <div className="pt-4 space-y-4">
                 {/* Price Summary */}
                 {selectedSlots.length > 0 && (
                   <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                     <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                       <span>{isOwner ? "Booking Amount" : "Advance Payment"}</span>
                       <span className="text-primary normal-case">
                         {isOwner ? "Full Amount (Offline)" : "₹300 Advance Required"}
                       </span>
                     </div>
                     <div className="flex justify-between items-baseline">
                        <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Bebas Neue' }}>
                          ₹{isOwner ? (() => {
                            const d = new Date(selectedDate);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            const duration = selectedSlots.length;
                            const baseRate = isWeekend && displayBox.weekendHourlyRate ? displayBox.weekendHourlyRate : displayBox.hourlyRate;
                            const customArray = isWeekend && displayBox.weekendCustomPricing?.length > 0 ? displayBox.weekendCustomPricing : displayBox.customPricing;
                            
                            const customPrice = customArray?.find(p => p.duration === duration);
                            return customPrice ? customPrice.price : baseRate * duration;
                          })() : 300}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedSlots.length} Hour{selectedSlots.length > 1 ? 's' : ''} Selected
                        </div>
                     </div>
                     {!isOwner && (
                       <div className="pt-2 border-t border-white/5 space-y-2">
                         <p className="text-[10px] text-muted-foreground italic">
                           *Remaining balance to be paid at the venue based on box pricing.
                         </p>
                         <Link 
                           to={`/box/${displayBox._id}`} 
                           className="flex items-center gap-1 text-xs text-primary hover:underline group w-fit"
                         >
                           <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
                           Check Box Pricing Details
                         </Link>
                       </div>
                     )}
                   </div>
                 )}

                 {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                    {/* Only show Book Now if slots are selected */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleBooking}
                            className={`w-full h-14 bg-gradient-to-r from-primary to-secondary text-black hover:from-primary/90 hover:to-secondary/90 font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(157,255,0,0.3)] text-lg ${isProcessingBooking ? 'blur-sm' : ''}`}
                            disabled={isProcessingBooking || selectedSlots.length === 0}
                        >
                            {isProcessingBooking ? 'Booking...' : (isOwner ? 'Confirm Offline Booking' : 'Confirm & Pay ₹300 Advance')}
                            <Trophy className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>

        {/* Right Column: Slot Picker */}
        <div className="space-y-4 mx-4 ">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Slots</label>
                {selectedSlots.length > 0 && (
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {selectedSlots.length} Selected ({selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length-1].endTime})
                    </span>
                )}
            </div>
            
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedQuarter ? (
                    <SlotPicker 
                        selectedDate={selectedDate}
                        bookedSlots={bookedSlots}
                        blockedSlots={blockedSlots}
                        selectedQuarter={selectedQuarter}
                        onSlotSelect={onSlotSelect}
                        selectedSlots={selectedSlots}
                        boxId={boxId}
                        onSlotsUpdate={onSlotsUpdate}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-white/5 text-muted-foreground">
                        <Info className="w-8 h-8 mb-2 opacity-50" />
                        <p>Please select a box first</p>
                    </div>
                )}
            </div>
        </div>
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
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive h-9 text-sm "
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
