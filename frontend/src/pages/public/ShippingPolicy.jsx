import React from 'react'
import { motion } from 'framer-motion'
import { Truck, Package, Clock } from 'lucide-react'

const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-display tracking-tight"
        >
          Shipping & Delivery Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Information regarding the delivery of our services.
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
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Digital Service Delivery</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Start Booking</strong> (BookMyBox) provides digital booking services for cricket venues. As such, there are <strong>no physical products</strong> to ship or deliver.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-bold">Instant Confirmation</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Upon successful payment and booking, you will receive an <strong>instant confirmation</strong> via email and/or SMS. This confirmation serves as your ticket/pass for the booked slot at the venue.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold">No Physical Shipping</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Since our services are entirely digital, we do not engage in the shipping of physical goods. You do not need to wait for any delivery; your booking is active immediately upon confirmation.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ShippingPolicy
