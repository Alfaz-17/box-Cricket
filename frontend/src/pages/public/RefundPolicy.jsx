import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, HelpCircle, FileText } from 'lucide-react'

const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1
          style={{ fontFamily: 'Bebas Neue' }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
        >
          Refund Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Please read our refund policy carefully before making a booking.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-8 shadow-lg space-y-8"
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-2">No Refund Policy</h2>
            <p className="text-muted-foreground font-medium">
              We strictly follow a <span className="text-foreground font-bold">"No Refund via Us"</span> policy. Once a booking is confirmed and payment is made, we do not process refunds through our platform.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Booking Cancellations</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Cancellations are subject to the specific terms and conditions of the venue you have booked. Since we act as a booking facilitator, any potential refunds or adjustments must be discussed directly with the venue management. <strong>Student Build Start Booking</strong> is not responsible for processing refunds.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-bold">Disputes</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            If you encounter any issues with your booking or the venue, please contact our support team. While we cannot issue refunds directly, we will do our best to assist you in resolving the matter with the venue owner.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default RefundPolicy
