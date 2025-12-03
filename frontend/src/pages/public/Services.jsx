import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

const Services = () => {
  const services = [
    {
      icon: Calendar,
      title: 'Online Booking',
      description: 'Seamlessly book your preferred cricket box slots online without the hassle of phone calls.',
    },
    {
      icon: MapPin,
      title: 'Venue Discovery',
      description: 'Find the best cricket turfs in your area with detailed information and amenities.',
    },
    {
      icon: Trophy,
      title: 'Tournament Hosting',
      description: 'Organize and manage cricket tournaments with our comprehensive booking tools.',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Coordinate with your team and manage practice sessions efficiently.',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12">
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
          Our Services
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore the premium services offered by Start Booking to elevate your cricketing experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <service.icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <Link to="/">
          <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
            Book a Slot Now
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

export default Services
