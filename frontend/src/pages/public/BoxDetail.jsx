import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import {
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Star,
  Users,
  Trophy,
  Target,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import AuthContext from '../../context/AuthContext'
import { Button } from '@/components/ui/Button'
import api from '../../utils/api.js'
import BoxMap from '../../components/ui/BoxMap.jsx'

const BoxDetail = () => {
  const { id } = useParams()
  const [box, setBox] = useState('')
  const [seo, setSeo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState('')
  const [totalReviews, setTotalReviews] = useState('')

  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate();

 

  useEffect(() => {
    const fetchBoxDetails = async () => {
      try {
        const response = await api.get(`/boxes/public/${id}`)
        const data = response.data
        setBox(data)
        setSeo(data.seo) // Set SEO data
      } catch (error) {
        console.error('Error fetching box details:', error)
        toast.error('Failed to load cricket box details')
      } finally {
        setLoading(false)
      }
    }

    fetchBoxDetails()
  }, [id]);

  const fetchReviews = async () => {
    setLoading(true)

    try {
      const res = await api.get(`/reviews/${id}`)
      setAverageRating(res.data.averageRating)
      setTotalReviews(res.data.reviewCount)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]) // Refetch when box ID changes

  // Mock data for demonstration
  const mockBox = {
    id: id,
    name: 'Premium Cricket Box',
    description:
      'High-quality cricket practice box with advanced bowling machine and analytics. Perfect for players of all skill levels, from beginners to professionals. Features include adjustable bowling speed and pitch, video analysis, and comfortable waiting area.',
    location: 'Central Sports Complex, New York',
    address: '123 Sports Avenue, NY 10001',
    hourlyRate: 45,
    image:
      'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    images: [
      'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    rating: 4.8,
    reviewCount: 24,
    features: [
      'Advanced bowling machine',
      'Video analysis',
      'Batting and bowling analytics',
      'Adjustable pitch conditions',
      'Comfortable waiting area',
      'Changing rooms',
    ],
    openingHours: {
      weekdays: '9:00 AM - 9:00 PM',
      weekends: '8:00 AM - 10:00 PM',
    },
    reviews: [
      {
        id: 1,
        user: 'John Smith',
        rating: 5,
        comment:
          'Excellent facilities! The bowling machine is top-notch and the video analysis helped me improve my technique.',
        date: '2023-03-15',
      },
      {
        id: 2,
        user: 'Sarah Johnson',
        rating: 4,
        comment: 'Great place to practice. Well-maintained and the staff are very helpful.',
        date: '2023-02-28',
      },
      {
        id: 3,
        user: 'Mike Roberts',
        rating: 5,
        comment: 'Best cricket box in the area. Worth every penny!',
        date: '2023-02-10',
      },
    ],
  }

  const displayBox = box || mockBox

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = React.useCallback(() => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === displayBox.images.length - 1 ? 0 : prevIndex + 1
    )
  }, [displayBox.images.length])

  const prevImage = React.useCallback(() => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === 0 ? displayBox.images.length - 1 : prevIndex - 1
    )
  }, [displayBox.images.length])

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage()
    }, 3500) // 4000ms = 4 seconds

    return () => clearInterval(interval) // cleanup on unmount
  }, [nextImage])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{seo?.seo?.metaTitle || `${displayBox.name} | Cricket Box Booking`}</title>
        <meta name="description" content={seo?.seo?.metaDescription || displayBox.description} />
        <meta name="keywords" content={seo?.seo?.keywords?.join(', ') || 'cricket box, bhavnagar, cricket turf'} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seo?.seo?.metaTitle || displayBox.name} />
        <meta property="og:description" content={seo?.seo?.metaDescription || displayBox.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={displayBox.images?.[0] || displayBox.image} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": displayBox.name,
            "description": seo?.seo?.metaDescription || displayBox.description,
            "image": displayBox.images || [],
            "address": {
              "@type": "PostalAddress",
              "streetAddress": displayBox.address,
              "addressLocality": "Bhavnagar",
              "addressRegion": "Gujarat",
              "addressCountry": "IN"
            },
            "priceRange": "₹₹",
            "openingHours": "Mo-Su 06:00-23:00"
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Banner/Slideshow Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl group mb-8"
        >
          <div className="relative h-80 md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={displayBox.images[currentImageIndex]}
                alt={displayBox.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Navigation Buttons */}
            {displayBox.images?.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 border border-white/30"
                >
                  <ChevronLeft size={24} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 border border-white/30"
                >
                  <ChevronRight size={24} />
                </motion.button>

                {/* Image Indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                  {displayBox.images?.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.3 }}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Two-Column Header: Title/Rating/Location + Book Now Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-8 border-b border-primary/20"
        >
          {/* Left: Title, Rating, Location */}
          <div className="flex-1 w-full lg:w-auto">
            <h1
              className="text-4xl md:text-5xl font-bold text-primary mb-4 font-display tracking-tight"
            >
              {displayBox.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-3">
              {/* Rating */}
              <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-bold text-lg">{averageRating}</span>
                <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{displayBox.location}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {displayBox.description}
            </p>
          </div>

          {/* Right: Book Now CTA */}
          <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
            <div className="text-left lg:text-right">
              <div className="text-4xl font-bold text-primary font-display tracking-tight">
                ₹{displayBox.hourlyRate}
                <span className="text-base font-medium text-muted-foreground font-jakarta ml-1">/hour</span>
              </div>
              {displayBox.weekendHourlyRate && (
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-[-5px]">
                  Weekend: ₹{displayBox.weekendHourlyRate}/hr
                </div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full lg:w-auto"
            >
              <Button
                onClick={() => navigate(`/box/${id}/booking`)}
                className="w-full lg:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg font-bold shadow-lg"
              >
                Book Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

       

        {/* Available Boxes Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2
            className="text-3xl font-bold text-primary mb-6 flex items-center gap-2 font-display tracking-tight"
          >
            <Target className="w-8 h-8" />
            Available Boxes
          </h2>
          <div className="flex flex-wrap gap-3">
            {Array.isArray(displayBox.quarters) && displayBox.quarters.length > 0 ? (
              displayBox.quarters?.map((quarter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 font-display tracking-wide"
                >
                  {quarter.name}
                </motion.span>
              ))
            ) : (
              <p className="text-muted-foreground">No quarters available</p>
            )}
          </div>
        </motion.section>




        {/* Custom Pricing */}
        {((Array.isArray(displayBox.customPricing) && displayBox.customPricing.length > 0) || (Array.isArray(displayBox.weekendCustomPricing) && displayBox.weekendCustomPricing.length > 0)) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2
              className="text-3xl font-bold text-primary mb-6 font-display tracking-tight"
            >
              Special Pricing Bundles
            </h2>
            
            <div className="space-y-8">
              {/* Weekday Bundles */}
              {Array.isArray(displayBox.customPricing) && displayBox.customPricing.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider mb-4 border-l-4 border-primary pl-3">Weekday Deals <span className="text-xs font-normal normal-case">(Mon-Fri)</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayBox.customPricing.map((item, index) => (
                      <PricingCard key={index} item={item} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Weekend Bundles */}
              {Array.isArray(displayBox.weekendCustomPricing) && displayBox.weekendCustomPricing.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider mb-4 border-l-4 border-secondary pl-3">Weekend Specials <span className="text-xs font-normal normal-case">(Sat-Sun)</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayBox.weekendCustomPricing.map((item, index) => (
                      <PricingCard key={index} item={item} index={index} variant="weekend" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

 {/* Key Details Grid Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl font-bold text-primary mb-6">
            Key Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <KeyDetailItem icon={Trophy} label="Weekday Rate" value={`₹${displayBox.hourlyRate}/hr`} />
            <KeyDetailItem icon={Award} label="Weekend Rate" value={displayBox.weekendHourlyRate ? `₹${displayBox.weekendHourlyRate}/hr` : `₹${displayBox.hourlyRate}/hr`} />
            <KeyDetailItem icon={Clock} label="Weekdays" value={displayBox.openingHours.weekdays} />
            <KeyDetailItem
              icon={Calendar}
              label="Weekends"
              value={displayBox.openingHours.weekends}
            />
            <KeyDetailItem icon={Users} label="Capacity" value="10+ Players" />
          </div>
        </motion.section>


        {/* Facilities Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <h2
            className="text-3xl font-bold text-primary mb-6 flex items-center gap-2 font-display tracking-tight"
          >
            <Award className="w-8 h-8" />
            Facilities & Amenities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayBox?.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-300 border border-primary/10"
              >
                <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-full flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Location Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-8"
        >
          <h2
            className="text-3xl font-bold text-primary mb-6 flex items-center gap-2 font-display tracking-tight"
          >
            <MapPin className="w-8 h-8" />
            Location
          </h2>

          {displayBox?.coordinates?.lat ? (
            <div className="rounded-xl overflow-hidden shadow-lg mb-4">
              <BoxMap
                lat={displayBox.coordinates?.lat}
                lng={displayBox.coordinates?.lng}
                name={displayBox.name}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-muted text-center flex items-center justify-center rounded-xl border border-primary/20 mb-4">
              <p className="text-muted-foreground">No map available for this box</p>
            </div>
          )}

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <p className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <span>
                <span className="font-bold">Address:</span>{' '}
                {displayBox?.address || 'No address provided'}
              </span>
            </p>
          </div>
        </motion.section>

        {/* SEO Content Section */}
        {seo?.seo?.seoParagraphs && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            <h2
              className="text-3xl font-bold text-primary mb-6 font-display tracking-tight"
            >
              About {displayBox.name}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {seo.seo.seoParagraphs.map((para, idx) => (
                <p key={idx} className="text-lg">
                  {para}
                </p>
              ))}
            </div>
          </motion.section>
        )}

        {/* FAQ Section */}
        {seo?.seo?.faq && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-8"
          >
            <h2
              className="text-3xl font-bold text-primary mb-6 font-display tracking-tight"
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {seo.seo.faq.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-card rounded-xl border border-border hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}

const KeyDetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
    <div className="bg-primary/10 p-3 rounded-full mb-3">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <span className="text-sm text-muted-foreground mb-1">{label}</span>
    <span className="font-bold text-lg text-foreground text-center">{value}</span>
  </div>
)

const PricingCard = ({ item, index, variant = 'weekday' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`p-6 bg-gradient-to-br ${variant === 'weekday' ? 'from-primary/10 to-transparent' : 'from-secondary/10 to-transparent'} rounded-xl border border-white/5 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl`}
  >
    <div className="flex justify-between items-center">
      <div>
        <div
          className={`text-3xl font-bold ${variant === 'weekday' ? 'text-primary' : 'text-secondary'} font-display tracking-tight`}
        >
          {item.duration} Hour{item.duration > 1 ? 's' : ''}
        </div>
        <div className="text-sm text-muted-foreground uppercase tracking-tighter font-semibold">Duration</div>
      </div>
      <div className="text-right">
        <div
          className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent"
          style={{ fontFamily: 'Bebas Neue' }}
        >
          ₹{item.price}
        </div>
        <div className="text-sm text-muted-foreground uppercase tracking-tighter font-semibold">Total Price</div>
      </div>
    </div>
  </motion.div>
)

export default BoxDetail
