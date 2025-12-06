import React from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle } from 'lucide-react'

const TermsAndConditions = () => {
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
          Terms and Conditions
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Please read these terms carefully before using our services.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-8 shadow-lg space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Acceptance of Terms</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using <strong>BookMyBox</strong>, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-bold">Booking Services</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We provide a platform to book cricket boxes. We are not the owners of the venues but facilitate the booking process. Availability and pricing are subject to the venue owner's discretion.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold">User Responsibilities</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account or password.
          </p>
        </div>

        <div id="payment-terms" className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Payment & Booking Terms</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
            <li>
              <strong>Advance Payment Only:</strong> We hereby declare that we only collect a fixed advance booking fee (approx. ₹300-500) to confirm your slot.
            </li>
            <li>
              <strong>Direct Vendor Payment:</strong> The remaining balance of the booking amount is to be paid directly to the venue (turf/box) owner at the time of play.
            </li>
            <li>
              <strong>Gateway Liability:</strong> The Payment Gateway Service Provider is acting solely as a payment processor for the advance booking fee. They are not a party to the service agreement between you (the customer) and the venue owner. The Payment Gateway Service Provider is not liable for any disputes, service quality issues, cancellations, or refunds related to the final service provided by the venue. BookMyBox takes full responsibility for disputes related to the advance payment collected through the platform.
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-primary/10">
          <p className="text-sm text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default TermsAndConditions
