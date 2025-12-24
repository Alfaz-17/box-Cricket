import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, Calendar, Filter, TrendingUp, Users, Award, Star, ArrowRight, Zap, Smartphone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

import api from '../../utils/api'

import TimePicker from '../../components/ui/TimePicker'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { BoxCardSkeleton } from '../../components/ui/SkeletonLoader'

const Home = () => {
  const [allBoxes, setAllBoxes] = useState([])
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
      setIsLoading(true)
      const response = await api.get('/boxes/public')
      console.log('Fetched boxes:', response.data)
      setAllBoxes(response.data)
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

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      setFilteredBoxes(allBoxes)
      return
    }

    const filtered = allBoxes.filter(box => {
      const nameMatch = box.name?.toLowerCase().includes(query)
      const locationMatch = box.location?.toLowerCase().includes(query)
      const addressMatch = box.address?.toLowerCase().includes(query)
      return nameMatch || locationMatch || addressMatch
    })
    setFilteredBoxes(filtered)
  }, [searchQuery, allBoxes])

  const handleSearch = () => {
    // Only used for scrolling now
    const resultsPanel = document.getElementById('available-boxes')
    if (resultsPanel) {
      resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* High-Energy Neon Sports Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden mb-12 py-20">
      {/* Hero Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] opacity-20" />
      </div>
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Removed High-Energy Badge */}

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight mb-6">
              Book Cricket Boxes in <br className="hidden md:block"/> 
              <span className="text-primary">Bhavnagar</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Find and book cricket boxes instantly. Check availability, compare prices, and reserve your slot in seconds.
            </p>

            {/* Professional Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card border border-border rounded-lg shadow-sm">
                <div className="flex-1 flex items-center px-4 py-2 bg-muted/30 rounded-md">
                  <Search className="h-5 w-5 text-muted-foreground mr-3" />
                  <input
                    type="text"
                    placeholder="Search by location or box name..."
                    className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:ring-0 text-sm sm:text-base outline-none"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-muted rounded-full">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-12 px-8 font-semibold"
                >
                  Search
                </Button>
              </div>
            </motion.div>

            {/* Download App CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex justify-center items-center gap-2"
            >
              <a 
                href="/bookmybox.apk" 
                download 
                className="flex items-center gap-2 text-white/80 hover:text-secondary transition-colors group px-6 py-2 rounded-full border border-white/10 hover:border-secondary/50 bg-white/5"
              >
                <Smartphone size={18} className="group-hover:animate-bounce" />
                <span className="font-semibold text-sm">Download Android App</span>
              </a>
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
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard icon={Users} value="500+" label="Active Users" color="from-blue-500 to-cyan-500" />
          <StatCard icon={MapPin} value={filteredBoxes.length} label="Cricket Boxes" color="from-green-500 to-emerald-500" />
          <StatCard icon={Award} value="1000+" label="Bookings Made" color="from-purple-500 to-pink-500" />
          <StatCard icon={TrendingUp} value="98%" label="Satisfaction Rate" color="from-orange-500 to-red-500" />
        </div> */}
      </motion.section>

      {/* Boxes Section - Mobile Optimized */}
      <section id="available-boxes" className="container mx-auto px-4 py-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <BoxCardSkeleton key={i} />
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
      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1 font-display tracking-tight">{value}</div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  )
}

// Professional Feature Item Component - Mobile First
const FeatureItem = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group p-8 rounded-xl bg-card border border-border hover:border-primary/40 transition-all shadow-sm"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}

const BoxCard = ({ box, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="overflow-hidden border-border bg-card hover:border-primary/40 hover:shadow-md transition-all h-full rounded-xl">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={
              box.image ||
              'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
            }
            alt={box.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Price Overlay */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-md shadow-sm">
            <span className="text-lg font-bold text-primary">₹{box.hourlyRate}</span>
            <span className="text-[10px] text-muted-foreground ml-1 font-medium">/ slot</span>
          </div>

          {/* Rating Overlay */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border border-border px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-foreground">4.9</span>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {box.name}
            </h3>
            
            <div className="flex items-center text-muted-foreground text-xs font-medium">
              <MapPin size={14} className="mr-2 text-primary" />
              <span className="truncate">{box.location}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
            {box.description}
          </p>

          <Link to={`/box/${box._id}`}>
            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary/50">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home
