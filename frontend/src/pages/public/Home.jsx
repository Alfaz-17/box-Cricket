import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, Calendar, Filter, TrendingUp, Users, Award, Star, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import api from '../../utils/api'
import BookMyBoxLogo from '../../assets/cri.png'
import TimePicker from '../../components/ui/TimePicker'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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
      {/* Immersive Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden mb-16">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-primary">
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary/90 to-black/80 z-10" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0 mix-blend-overlay" />
            
            {/* Animated Abstract Shapes */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full border-[100px] border-white/5 blur-3xl z-0"
            />
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full border-[80px] border-secondary/20 blur-3xl z-0"
            />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-5xl mx-auto"
            >
                {/* Hero Content */}
                <div className="mb-12 space-y-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block mb-4"
                    >
                        <span className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-bold tracking-widest uppercase shadow-lg">
                            The Ultimate Cricket Experience
                        </span>
                    </motion.div>

                    <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-7xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight leading-none drop-shadow-2xl">
                        BOOK. <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">PLAY.</span> WIN.
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover and book premium cricket turfs in seconds. Elevate your game with world-class facilities.
                    </p>
                </div>

                {/* Floating Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-grow relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Search turfs, locations..."
                                    className="pl-12 h-14 bg-black/20 border-white/10 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-secondary/50 rounded-xl text-lg transition-all"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <Button 
                                onClick={() => setShowFilters(!showFilters)}
                                className="h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
                            >
                                <Filter className="mr-2 h-5 w-5" /> Filters
                            </Button>

                            <Button className="h-14 px-10 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-bold text-lg tracking-wide uppercase rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105">
                                Search
                            </Button>
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
                            >
                                <div>
                                    <Label className="text-white/80 mb-2 block">Date</Label>
                                    <Input 
                                        type="date" 
                                        value={filters.date}
                                        onChange={handleFilterChange}
                                        name="date"
                                        className="bg-black/20 border-white/10 text-white h-11" 
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80 mb-2 block">Time</Label>
                                    <TimePicker 
                                        value={filters.startTime}
                                        onChange={value => setFilters(prev => ({ ...prev, startTime: value }))}
                                        className="bg-black/20 border-white/10 text-white h-11"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80 mb-2 block">Duration</Label>
                                    <select
                                        value={filters.duration}
                                        onChange={e => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full h-11 bg-black/20 border border-white/10 rounded-md text-white px-3 focus:outline-none focus:border-secondary/50"
                                    >
                                        <option value="" className="bg-gray-900">Select Duration</option>
                                        {[1, 2, 3, 4].map(h => (
                                            <option key={h} value={h} className="bg-gray-900">{h} Hour{h > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Users} value="500+" label="Active Users" color="from-blue-500 to-cyan-500" />
          <StatCard icon={MapPin} value={filteredBoxes.length} label="Cricket Boxes" color="from-green-500 to-emerald-500" />
          <StatCard icon={Award} value="1000+" label="Bookings Made" color="from-purple-500 to-pink-500" />
          <StatCard icon={TrendingUp} value="98%" label="Satisfaction Rate" color="from-orange-500 to-red-500" />
        </div>
      </motion.section>

      {/* Boxes Section */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl md:text-4xl font-bold text-foreground">
              Available Cricket Boxes
            </h2>
            <p className="text-muted-foreground mt-1">Discover premium facilities near you</p>
          </div>
          <div className="text-sm font-semibold px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            {filteredBoxes.length} Results
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBoxes.map((box, index) => (
              <BoxCard key={box._id} box={box} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🏏</div>
            <h3 className="text-xl font-semibold mb-2">No boxes available</h3>
            <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
          </motion.div>
        )}
      </section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-24 mb-16"
      >
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best cricket box booking platform with premium features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

// Enhanced Stat Card Component
const StatCard = ({ icon: Icon, value, label, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative overflow-hidden rounded-xl bg-card border border-primary/20 p-6 shadow-lg"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
      <Icon className={`h-10 w-10 mb-4 bg-gradient-to-br ${color} bg-clip-text text-transparent`} strokeWidth={1.5} />
      <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue' }}>{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  )
}

// Enhanced Feature Card Component
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="pt-8 pb-6 relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
            <Icon className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-center group-hover:text-primary transition-colors" style={{ fontFamily: 'Bebas Neue' }}>
            {title}
          </h3>
          <p className="text-muted-foreground text-center leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Enhanced Box Card Component
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
        <div className="relative h-56 overflow-hidden">
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
            className="absolute top-4 right-4 backdrop-blur-md bg-primary/90 text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg border border-white/20"
          >
            ₹{box.hourlyRate}/hr
          </motion.div>

          {/* Rating Badge */}
          <div className="absolute top-4 left-4 backdrop-blur-md bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/30">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-semibold text-sm">4.0</span>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
            {box.name}
          </h3>

          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPin size={16} className="mr-1.5 text-primary" />
              <span className="truncate">{box.location}</span>
            </div>
          </div>

          <p className="text-sm line-clamp-2 mb-6 text-muted-foreground leading-relaxed">
            {box.description}
          </p>

          <Link to={`/box/${box._id}`} className="block">
            <Button className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all shadow-md group-hover:shadow-lg">
              View Details
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Home
