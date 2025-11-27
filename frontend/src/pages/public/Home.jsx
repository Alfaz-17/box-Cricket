import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, Calendar, Filter, TrendingUp, Users, Award, Star, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import api from '../../utils/api'

import TimePicker from '../../components/ui/TimePicker'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

const Home = () => {
  const [filteredBoxes, setFilteredBoxes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    date: '',
    startTime: '',
    duration: '',
  })

  const fetchFilteredBoxes = async () => {
    try {
      if (!filters.date) {
        toast.error('Please select a date.')
        return
      }
      if (!filters.startTime) {
        toast.error('Please select a start time.')
        return
      }
      if (!filters.duration) {
        toast.error('Please select a duration.')
        return
      }

      setIsLoading(true)

      const payload = {
        date: filters.date,
        startTime: filters.startTime,
        duration: filters.duration || 2,
      }

      const response = await api.post('/boxes/availableBoxes', payload)
      setFilteredBoxes(response.data)
    } catch (error) {
      console.error('Error fetching filtered boxes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBoxes = async () => {
    try {
      const response = await api.get('/boxes/public')
      setFilteredBoxes(response.data)
    } catch (error) {
      console.error('Error fetching boxes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBoxes()
  }, [])

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      date: '',
      startTime: '',
      duration: '',
    })
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen">
      {/* High-Energy Neon Sports Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden mb-12">
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="px-6 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(143,163,30,0.3)] backdrop-blur-md">
              Book. paly. win.
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black italic text-white tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl transform -skew-x-6">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">SMASH</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-secondary animate-gradient bg-300%">LIMITS</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto font-medium tracking-wide mb-10 border-l-2 border-secondary pl-6 text-left md:text-center md:border-l-0 md:pl-0">
              Experience the thrill of pro-level cricket. Book premium turfs with stadium-grade lighting and pitches.
            </p>

            {/* Search Bar - Minimalist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                <Input
                  type="text"
                  placeholder="Find your turf..."
                  className="pl-14 h-14 w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary/50 focus:border-secondary rounded-full text-lg shadow-lg transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-14 px-10 bg-secondary hover:bg-secondary/90 text-primary-foreground font-bold text-lg uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(143,163,30,0.4)] hover:shadow-[0_0_30px_rgba(143,163,30,0.6)] hover:scale-105 transition-all">
                Book Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section - Mobile Optimized */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 sm:mb-12 md:mb-16 px-4 sm:px-0"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard icon={Users} value="500+" label="Active Users" color="from-blue-500 to-cyan-500" />
          <StatCard icon={MapPin} value={filteredBoxes.length} label="Cricket Boxes" color="from-green-500 to-emerald-500" />
          <StatCard icon={Award} value="1000+" label="Bookings Made" color="from-purple-500 to-pink-500" />
          <StatCard icon={TrendingUp} value="98%" label="Satisfaction Rate" color="from-orange-500 to-red-500" />
        </div>
      </motion.section>

      {/* Boxes Section - Mobile Optimized */}
      <section className="px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Available Cricket Boxes
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Discover premium facilities near you</p>
          </div>
          <div className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full border border-primary/20">
            {filteredBoxes.length} Results
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border bg-card shadow-lg animate-pulse h-96 p-4">
                <div className="w-full h-48 bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-5/6 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredBoxes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredBoxes.map((box, index) => (
              <BoxCard key={box._id} box={box} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16 md:py-20"
          >
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🏏</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No boxes available</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your filters or check back later</p>
          </motion.div>
        )}
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Side: Heading & Visual */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-white mb-6">
                WHY <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">CHOOSE US?</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We're not just a booking platform; we're your partner in the game. Experience the difference with our premium features designed for cricketers.
              </p>
              
              <div className="relative hidden lg:block group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop" 
                  alt="Cricket Action" 
                  className="relative rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto transform rotate-3 group-hover:rotate-0 transition-all duration-500 grayscale group-hover:grayscale-0"
                />
              </div>
            </motion.div>

            {/* Right Side: Feature List */}
            <div className="lg:w-1/2 w-full space-y-8">
              <FeatureItem 
                icon={Search}
                title="Seamless Booking"
                description="Find your perfect pitch in seconds. Our smart filters let you sort by location, price, and amenities instantly."
                delay={0.2}
              />
              <FeatureItem 
                icon={Zap}
                title="Real-Time Availability"
                description="No more phone calls. See live slot availability and secure your game time with instant confirmation."
                delay={0.4}
              />
              <FeatureItem 
                icon={Award}
                title="Premium Venues"
                description="We curate only the best. Every turf is verified for quality, lighting, and facilities to ensure a pro-level experience."
                delay={0.6}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Enhanced Stat Card Component - Mobile Optimized
const StatCard = ({ icon: Icon, value, label, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative overflow-hidden rounded-lg sm:rounded-xl bg-card border border-primary/20 p-4 sm:p-6 shadow-lg"
    >
      <div className={`absolute top-0 right-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
      <Icon className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 mb-2 sm:mb-4 bg-gradient-to-br ${color} bg-clip-text text-transparent`} strokeWidth={1.5} />
      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1" style={{ fontFamily: 'Bebas Neue' }}>{value}</div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  )
}

// Professional Feature Item Component - Mobile First
const FeatureItem = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 group p-4 sm:p-6 rounded-2xl bg-white/5 sm:bg-transparent sm:hover:bg-white/5 transition-colors duration-300 border border-white/5 sm:border-transparent"
    >
      <div className="flex-shrink-0 self-start">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10 sm:group-hover:shadow-primary/30 transition-all duration-300">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
      </div>
      <div className="text-left">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{description}</p>
      </div>
    </motion.div>
  )
}

// Enhanced Box Card Component - Mobile Optimized
const BoxCard = ({ box, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="group"
    >
      <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl h-full">
        {/* Image Container with Overlay */}
        <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            src={
              box.image ||
              'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
            }
            alt={box.name}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Price Badge */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 backdrop-blur-md bg-primary/90 text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg border border-white/20 text-sm sm:text-base"
          >
            ₹{box.hourlyRate}/hr
          </motion.div>

          {/* Rating Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 backdrop-blur-md bg-white/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 border border-white/30">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-semibold text-xs sm:text-sm">4.0</span>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 md:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3 group-hover:text-secondary transition-colors line-clamp-1">
            {box.name}
          </h3>

          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPin size={14} className="mr-1 sm:mr-1.5 text-primary flex-shrink-0" />
              <span className="truncate">{box.location}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-6 text-muted-foreground leading-relaxed">
            {box.description}
          </p>

          <Link to={`/box/${box._id}`} className="block">
            <Button className="w-full h-10 sm:h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all shadow-md group-hover:shadow-lg text-sm sm:text-base">
              View Details
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Home
