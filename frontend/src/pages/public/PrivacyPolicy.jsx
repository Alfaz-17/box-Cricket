import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye } from 'lucide-react'

const PrivacyPolicy = () => {
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
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We value your trust and are committed to protecting your personal information.
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
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Data Collection</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            At <strong>Student Build Start Booking</strong>, we collect only the necessary information required to facilitate your bookings. This includes your name, contact details, and booking preferences. We do not sell or share your personal data with third parties for marketing purposes.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your data. Your payment information is processed securely through our payment partners and is not stored on our servers.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold">Usage of Information</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Your information is used solely for:
            <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
              <li>Processing your cricket box bookings</li>
              <li>Communicating booking confirmations and updates</li>
              <li>Improving our services and user experience</li>
              <li>Legal compliance as required</li>
            </ul>
          </p>
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

export default PrivacyPolicy
