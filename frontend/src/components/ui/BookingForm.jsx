import React from 'react'
import { Phone, Info, CheckCircle2, ArrowRight, Trophy, ExternalLink, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button } from './Button'
import { Input } from './Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select'
import SlotPicker from './SlotPicker'
import { Label } from './Label'
import { cn } from '../../lib/utils'
import { format } from 'date-fns'

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
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)

  // Calculate pricing
  const calculatePricing = () => {
    if (!selectedDate || selectedSlots.length === 0) return { total: 0, advance: 300 }
    
    const d = new Date(selectedDate);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const duration = selectedSlots.length;
    const baseRate = isWeekend && displayBox.weekendHourlyRate ? displayBox.weekendHourlyRate : displayBox.hourlyRate;
    const customArray = isWeekend && displayBox.weekendCustomPricing?.length > 0 ? displayBox.weekendCustomPricing : displayBox.customPricing;
    const customPrice = customArray?.find(p => p.duration === duration);
    
    return {
      total: customPrice ? customPrice.price : baseRate * duration,
      advance: 300
    }
  }

  const prices = calculatePricing()

  return (
    <div className="space-y-16">
      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">Confirm Booking</h3>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg space-y-3 border border-border">
                  {/* Booking Details Summary */}
                  <div className="pb-3 border-b border-border/50 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Turf Box</span>
                        <span className="font-bold text-foreground">
                            {displayBox.quarters?.find(q => q._id === selectedQuarter)?.name || 'Selected Box'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-bold text-foreground">
                            {selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'N/A'}
                        </span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-bold text-foreground">
                             {selectedSlots.length > 0 ? `${selectedSlots[0].startTime} - ${selectedSlots[selectedSlots.length-1].endTime}` : 'N/A'}
                        </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Booking Amount</span>
                    <span className="font-bold text-foreground">₹{prices.total}</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Advance Payment Required</span>
                    <span className="font-bold text-primary text-lg">₹{prices.advance}</span>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You are paying <span className="font-bold text-foreground">₹{prices.advance}</span> now to secure your slot. The remaining balance of <span className="font-bold text-foreground">₹{prices.total - prices.advance}</span> will be payable at the venue.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    const success = await handleBooking()
                    if (success) setShowPaymentModal(false)
                  }}
                  disabled={isProcessingBooking}
                  className="w-full h-14 font-bold text-lg shadow-lg shadow-primary/25"
                >
                  {isProcessingBooking ? 'Processing Payment...' : (
                    <div className="flex items-center gap-2">
                       <span>Pay ₹{prices.advance} & Confirm</span>
                       <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Section 1: Booking Details */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Trophy className="text-primary w-5 h-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Booking <span className="text-primary">Details</span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Complete your reservation details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Box Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block ml-1">
                  Select Box <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="h-12 border-border bg-card">
                    <SelectValue placeholder="Choose a box..." />
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

              {/* Contact Number */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block ml-1">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="Enter Contact Number"
                  className="h-12 border-border bg-card"
                />
              </div>

              {/* Date Picker */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block ml-1">
                  Reservation Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    minDate={new Date()}
                    className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select date"
                    wrapperClassName="w-full"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/30">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Static Booking Button - Under Date */}
            {selectedSlots.length > 0 && selectedQuarter && contactNumber && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Button
                  onClick={() => isOwner ? handleBooking() : setShowPaymentModal(true)}
                  disabled={isProcessingBooking}
                  className="w-full h-14 font-bold text-base"
                >
                  {isProcessingBooking ? 'Processing...' : (
                    isOwner ? 'Confirm Booking' : 'Book Slots Now'
                  )}
                </Button>
              </motion.div>
            )}

            {/* Selected Hours Summary (Desktop) */}
            <AnimatePresence>
              {selectedSlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="hidden lg:block p-8 bg-card rounded-lg border border-border shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Reservation Summary</h3>
                      <p className="text-2xl font-bold text-foreground tracking-tight">
                        {selectedSlots[0].startTime} — {selectedSlots[selectedSlots.length-1].endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold text-primary tracking-tighter leading-none mb-1">
                        {selectedSlots.length}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Hours Selected</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Checkout Area - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {selectedSlots.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-primary/5 border border-primary/20 rounded-lg shadow-sm"
                >
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                      {isOwner ? "Administrative Action" : "Secured Advance"}
                    </p>
                    <div className="text-4xl font-bold text-foreground tracking-tight">
                      ₹{isOwner ? prices.total : 300}
                    </div>
                  </div>

                  {!isOwner && (
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-foreground text-lg">₹{prices.total}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Advance Payment:</span>
                        <span className="font-semibold text-primary">₹300</span>
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={() => {
                      if (!selectedQuarter) toast.error('Please select a box');
                      else if (selectedSlots.length === 0) toast.error('Please select time slots');
                      else if (!contactNumber) toast.error('Please provide a contact number');
                      else if (isOwner) handleBooking();
                      else setShowPaymentModal(true);
                    }}
                    className="w-full h-14 font-bold"
                    disabled={isProcessingBooking || !selectedQuarter || selectedSlots.length === 0 || !contactNumber}
                  >
                    {isProcessingBooking ? 'Processing...' : (
                      isOwner ? 'Confirm Booking' : 'Book Now'
                    )}
                    {!isProcessingBooking && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </motion.div>
              ) : (
                <div className="p-8 bg-muted/20 border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Info className="text-muted-foreground w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Select your slots to proceed
                  </h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Slot Picker */}
      <div className="space-y-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Clock className="text-primary w-5 h-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Select <span className="text-primary">Time Slot</span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Pick your preferred playing time</p>
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
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border rounded-xl bg-muted/5">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Select a box to view available slots</p>
            </div>
          )}
        </div>

        {/* Mobile: Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <div className="md:hidden p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Reserved</p>
              <p className="text-sm font-medium text-foreground">
                {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length-1].endTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary tracking-tight">{selectedSlots.length}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Hour{selectedSlots.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Policies & Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Phone size={14} className="text-primary" />
            Support & Assistance
          </h3>
          <p className="text-sm text-muted-foreground">
            Having trouble booking? Call us directly for assistance.
          </p>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <a href={`tel:${displayBox.mobileNumber}`}>
              {displayBox.mobileNumber || 'Contact Us'}
            </a>
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Info size={14} className="text-primary" />
            Booking Policies
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <span>Instant WhatsApp confirmation upon booking.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <span>Please arrive 15 minutes before your slot starts.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
