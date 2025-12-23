import React from 'react'
import { Phone, Info, CheckCircle2, ArrowRight, Trophy, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
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
  boxId,
  onSlotsUpdate,
}) => {
  return (
    <div className="space-y-12">
      {/* Section 1: Booking Form */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-border/40">
          <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
            Booking Details
          </h2>
        </div>

        <div className="space-y-6 pl-4 border-l-2 border-primary">
          {/* Box, Date, Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Box <span className="text-destructive">*</span>
              </label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="h-11 rounded-lg border-border/60 bg-background hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select box" />
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
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Date <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  minDate={new Date()}
                  className="flex h-11 w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select date"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Contact Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                placeholder="10-digit mobile"
                className="h-11 rounded-lg border-border/60 bg-background hover:border-primary/50 focus-visible:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Selected Hours Summary */}
          {selectedSlots.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Selected</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length-1].endTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary font-display tracking-tight">
                    {selectedSlots.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest font-jakarta">hour{selectedSlots.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <motion.div whileHover={{ scale: selectedSlots.length > 0 ? 1.01 : 1 }} whileTap={{ scale: selectedSlots.length > 0 ? 0.99 : 1 }}>
            <Button
              onClick={() => {
                const isDisabled = isProcessingBooking || selectedSlots.length === 0 || !contactNumber || !selectedQuarter;
                
                if (isDisabled) {
                  // Show helpful message about what's missing
                  if (!selectedQuarter) {
                    toast.error('Please select a box first');
                  } else if (selectedSlots.length === 0) {
                    toast.error('Please select time slots');
                  } else if (!contactNumber) {
                    toast.error('Please enter your contact number');
                  }
                } else {
                  handleBooking();
                }
              }}
              className={`w-full h-14 bg-gradient-to-r from-primary to-secondary text-black hover:from-primary/90 hover:to-secondary/90 font-bold uppercase tracking-wide shadow-lg text-base transition-all ${
                isProcessingBooking || selectedSlots.length === 0 || !contactNumber || !selectedQuarter ? 'opacity-50 blur-[0.5px] cursor-not-allowed' : ''
              }`}
              disabled={isProcessingBooking}
            >
              {isProcessingBooking ? 'Processing...' : (isOwner ? 'Confirm Booking' : 'Pay ₹300 & Confirm')}
              <Trophy className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Section 2: Select Time Slots */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Select Time Slots
            </h2>
            {selectedSlots.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-xs font-semibold text-primary">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length-1].endTime}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Slot Picker */}
        <div className="min-h-[400px]">
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
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border/40 rounded-3xl bg-muted/5">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Select a box to view available time slots</p>
            </div>
          )}
        </div>

        {/* Mobile: Selected Slots Badge */}
        {selectedSlots.length > 0 && (
          <div className="md:hidden flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Selected</p>
              <p className="text-sm text-foreground mt-0.5">
                {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length-1].endTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary font-display tracking-tight">
                {selectedSlots.length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest font-jakarta">hour{selectedSlots.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Payment Summary */}
      {selectedSlots.length > 0 && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-border/40">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Payment Summary
            </h2>
          </div>

          {/* Price Summary */}
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20 border-l-4 border-l-primary">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isOwner ? "Total Amount" : "Advance Payment"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} • {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length-1].endTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary font-display tracking-tight text-right leading-none">
                  ₹{isOwner ? (() => {
                    const d = new Date(selectedDate);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const duration = selectedSlots.length;
                    const baseRate = isWeekend && displayBox.weekendHourlyRate ? displayBox.weekendHourlyRate : displayBox.hourlyRate;
                    const customArray = isWeekend && displayBox.weekendCustomPricing?.length > 0 ? displayBox.weekendCustomPricing : displayBox.customPricing;
                    const customPrice = customArray?.find(p => p.duration === duration);
                    return customPrice ? customPrice.price : baseRate * duration;
                  })() : 300}
                </p>
              </div>
            </div>

            {!isOwner && (
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/20">
                Balance payable at venue
              </p>
            )}
          </div>
        </div>
      )}

      {/* Section 4: Help & Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/40 mb-12 lg:mb-0">
        {/* Call Option */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Need Help?
          </h3>
          <p className="text-xs text-muted-foreground">
            Call us to book or for assistance
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <a href={`tel:${displayBox.mobileNumber}`} className="flex items-center gap-2">
              <Phone size={14} />
              {displayBox.mobileNumber || 'N/A'}
            </a>
          </Button>
        </div>

        {/* Booking Policy */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Policy
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
      
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Instant WHATSAPP Message for  confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Arrive 15 mins early</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sticky Bottom CTA - Mobile Optimized */}
      <AnimatePresence>
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-16 left-0 right-0 z-40 lg:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-secondary/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-secondary" style={{ fontFamily: 'Bebas Neue' }}>
                    ₹{isOwner ? (() => {
                      const d = new Date(selectedDate);
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      const duration = selectedSlots.length;
                      const baseRate = isWeekend && displayBox.weekendHourlyRate ? displayBox.weekendHourlyRate : displayBox.hourlyRate;
                      const customArray = isWeekend && displayBox.weekendCustomPricing?.length > 0 ? displayBox.weekendCustomPricing : displayBox.customPricing;
                      const customPrice = customArray?.find(p => p.duration === duration);
                      return customPrice ? customPrice.price : baseRate * duration;
                    })() : 300}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Total</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} • {selectedSlots[0].startTime}</p>
              </div>
              
              <Button
                onClick={handleBooking}
                disabled={isProcessingBooking || !contactNumber || !selectedQuarter}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold uppercase tracking-wider px-6 h-12 rounded-xl shadow-lg shadow-secondary/20 flex-shrink-0"
              >
                {isProcessingBooking ? '...' : (isOwner ? 'Confirm' : 'Pay & Book')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookingForm
