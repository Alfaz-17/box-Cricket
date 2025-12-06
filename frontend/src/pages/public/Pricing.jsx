import React from 'react'
import { motion } from 'framer-motion'
import { Tag, Clock, CalendarCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

const Pricing = () => {
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
          Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Transparent pricing for your cricket box bookings.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-8 shadow-lg space-y-8"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Venue-Based Pricing</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Pricing is determined by individual venue owners and may vary based on the specific cricket box, location, and facilities provided. We ensure that the prices listed on our platform are up-to-date and competitive.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-bold">Hourly Rates</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Most venues charge on an hourly basis. Rates may differ for:
            <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
              <li>Peak hours (evenings and weekends)</li>
              <li>Off-peak hours (mornings and weekdays)</li>
              <li>Special holidays or events</li>
            </ul>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold">No Hidden Fees</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <strong>BookMyBox</strong> believes in transparency. The price you see at checkout is the price you pay. There are no hidden booking fees charged by us.
          </p>
        </div>

        <div className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">
            Check specific venue pages for detailed pricing.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
              Browse Venues
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Pricing
