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
      {/* Hero Section with Gradient */}
      <section className="relative mb-16 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 animate-gradient" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 rounded-2xl overflow-hidden backdrop-blur-sm bg-muted/80 border border-primary/20 shadow-2xl"
        >
          <div className="p-8 md:p-12 lg:p-16">
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-4 mb-6"
            >
              <img
                className="h-20 w-20 md:h-24 md:w-24 drop-shadow-lg"
                src={BookMyBoxLogo}
                alt="BookMyBox Logo"
              />
              <div>
                <h1
                  style={{ fontFamily: 'Bebas Neue' }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                >
                  Book. Play. Win.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-1">
                  Your Gateway to Premium Cricket Facilities
                </p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ fontFamily: 'Bebas Neue' }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground"
            >
              Find and Book Cricket Boxes
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl opacity-90 mb-8 max-w-3xl leading-relaxed"
            >
              Reserve top-quality cricket boxes for both practice sessions and matches. Experience
              the best facilities to elevate your game with real-time booking and instant confirmation.
            </motion.p>

            {/* Enhanced Search & Filter Container with Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="backdrop-blur-md bg-card/90 p-6 rounded-xl shadow-xl max-w-4xl border border-primary/30"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow relative group">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, location, or description..."
                    className="pl-10 h-12 text-base border-primary/20 focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="h-12 px-6 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <Filter size={18} className="mr-2" />
                  Check Availability
                </Button>

                <Button className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg">
                  <Search size={18} className="mr-2" />
                  Search
                </Button>
              </div>

              {/* Enhanced Filter Section */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-primary/20"
                >
                  <div>
                    <Label htmlFor="date" className="mb-2 block text-base font-semibold">
                      <Calendar className="inline mr-2 h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      className="h-11 border-primary/20"
                      value={filters.date}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-base font-semibold">
                      <Clock className="inline mr-2 h-4 w-4" />
                      Time
                    </Label>
                    <TimePicker
                      value={filters.startTime}
                      onChange={value =>
                        setFilters(prev => ({
                          ...prev,
                          startTime: value,
                        }))
                      }
                    />
                    {filters.startTime && (
                      <p className="text-sm text-primary mt-2 font-medium">
                        Selected: {filters.startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2 block text-base font-semibold">
                      <Zap className="inline mr-2 h-4 w-4" />
                      Duration
                    </Label>
                    <select
                      value={filters.duration}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="flex h-11 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <option value="">Select duration</option>
                      {[1, 2, 3, 4].map(hours => (
                        <option key={hours} value={hours}>
                          {hours} hour{hours > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={clearFilters} className="px-6">
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFilters(false)
                        fetchFilteredBoxes()
                      }}
                      className="px-6 bg-gradient-to-r from-primary to-secondary"
                    >
                      Apply Filters
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
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
