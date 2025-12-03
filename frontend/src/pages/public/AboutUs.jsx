import React from 'react'
import { motion } from 'framer-motion'
import { Info, Users, Target } from 'lucide-react'

const AboutUs = () => {
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
          About Us
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover who we are and our mission to simplify cricket box bookings.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Who We Are</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
             " Build Start Booking", dedicated to bringing efficiency and ease to the sports community. Our platform is designed to connect cricket enthusiasts with the best local box cricket venues.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is to provide a seamless booking experience, allowing you to focus on the game rather than the logistics. We believe in the power of sports to bring people together.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10 rounded-xl p-8 text-center"
      >
        <Info className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Start Booking</h3>
        <p className="text-muted-foreground">
          Proudly developed by individuals for the cricket box booking.
        </p>
      </motion.div>
    </div>
  )
}

export default AboutUs
