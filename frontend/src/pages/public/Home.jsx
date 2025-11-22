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
      {/* Immersive Hero Section - Mobile First */}
      <section className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden mb-8 sm:mb-12 md:mb-16">
        {/* Dynamic Background */}
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden">
            {/* Hero Image */}
            <img 
                src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop" 
                alt="Cricket Turf" 
                className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Overlays */}
            <div className="absolute inset-0 bg-black/60 z-10" /> {/* Darken the image */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-primary/20 to-background/90 z-10" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-10 mix-blend-overlay" />
            
            {/* Animated Abstract Shapes */}
            <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-primary/20 blur-[100px] z-10"
            />
            <motion.div 
                animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[10%] left-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-secondary/10 blur-[120px] z-10"
            />
        </div>

        <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-5xl mx-auto"
            >
                {/* Hero Content */}
                <div className="mb-8 sm:mb-10 md:mb-12 space-y-4 sm:space-y-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block mb-3 sm:mb-4"
                    >
                        <span className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg">
                            The Ultimate Cricket Experience
                        </span>
                    </motion.div>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic text-white tracking-tighter leading-[0.9] drop-shadow-2xl px-2 transform -skew-x-6">
                        BOOK. <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-secondary animate-gradient bg-300%">PLAY.</span> WIN.
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium tracking-wide leading-relaxed px-4 mt-6 border-l-4 border-secondary pl-6">
                        Discover and book premium cricket turfs in seconds. <br className="hidden sm:block" /> Elevate your game with world-class facilities.
                    </p>
                </div>

                {/* Floating Search Bar - Mobile Optimized */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Search Input */}
                            <div className="relative group">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/80 sm:text-white/60 sm:group-hover:text-white transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Search turfs, locations..."
                                    className="pl-10 sm:pl-12 h-12 sm:h-14 bg-black/20 border-white/10 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-secondary/50 rounded-lg sm:rounded-xl text-base sm:text-lg transition-all"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {/* Buttons - Stack on mobile */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Filter Button Temporarily Disabled
                                <Button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-12 sm:h-14 px-6 sm:px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg sm:rounded-xl transition-all w-full sm:w-auto"
                                >
                                    <Filter className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Filters
                                </Button>
                                */}

                                <Button className="h-12 sm:h-14 px-8 sm:px-10 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-bold text-base sm:text-lg tracking-wide uppercase rounded-lg sm:rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105 w-full sm:flex-1">
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* Expanded Filters - Mobile Optimized (Temporarily Disabled) */}
                        {/* 
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-1 gap-3 sm:gap-4 text-left"
                            >
                                <div>
                                    <Label className="text-white/80 mb-2 block text-sm sm:text-base">Date</Label>
                                    <Input 
                                        type="date" 
                                        value={filters.date}
                                        onChange={handleFilterChange}
                                        name="date"
                                        className="bg-black/20 border-white/10 text-white h-11 sm:h-12 w-full" 
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80 mb-2 block text-sm sm:text-base">Time</Label>
                                    <TimePicker 
                                        value={filters.startTime}
                                        onChange={value => setFilters(prev => ({ ...prev, startTime: value }))}
                                        className="bg-black/20 border-white/10 text-white h-11 sm:h-12"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80 mb-2 block text-sm sm:text-base">Duration</Label>
                                    <select
                                        value={filters.duration}
                                        onChange={e => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full h-11 sm:h-12 bg-black/20 border border-white/10 rounded-md text-white px-3 focus:outline-none focus:border-secondary/50 text-base"
                                    >
                                        <option value="" className="bg-gray-900">Select Duration</option>
                                        {[1, 2, 3, 4].map(h => (
                                            <option key={h} value={h} className="bg-gray-900">{h} Hour{h > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}
                        */}
                    </div>
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

      {/* Features Section - Mobile Optimized */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-12 sm:mt-16 md:mt-24 mb-8 sm:mb-12 md:mb-16 px-4 sm:px-0"
      >
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Why Choose Us?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Experience the best cricket box booking platform with premium features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon={Search}
            title="Easy Booking"
            description="Find and book cricket boxes with just a few clicks. Filter by location, price, and availability."
            delay={0.1}
          />
          <FeatureCard
            icon={Calendar}
            title="Real-time Availability"
            description="Check real-time availability and secure your preferred time slots instantly."
            delay={0.2}
          />
          <FeatureCard
            icon={MapPin}
            title="Quality Locations"
            description="Access to premium cricket boxes and facilities in convenient locations."
            delay={0.3}
          />
        </div>
      </motion.section>
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

// Enhanced Feature Card Component - Mobile Optimized
const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10, rotateY: 5 }}
      className="group relative"
    >
      <Card className="h-full border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="pt-6 sm:pt-8 pb-5 sm:pb-6 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-primary to-secondary rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center text-primary sm:text-foreground sm:group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
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
