import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  Box,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { formatTime, formatEndTime, convertTo12Hour, formatBookingDate } from '../../utils/formatDate'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)

  // Stats with emojis
  const stats = analytics
    ? [
        {
          title: 'Total Bookings',
          value: analytics.totalBookings,
          change: `${analytics.bookingChange > 0 ? '+' : ''}${analytics.bookingChange}%`,
          isIncrease: analytics.bookingChange >= 0,
          emoji: '📅',
          link: '/admin/bookings',
        },
        {
          title: 'Total Revenue',
          value: `₹${analytics.totalRevenue}`,
          change: `${analytics.revenueChange > 0 ? '+' : ''}${analytics.revenueChange}%`,
          isIncrease: analytics.revenueChange >= 0,
          emoji: '💰',
          link: '/admin/bookings',
        },
        {
          title: 'Active Boxes',
          value: analytics.totalBoxes,
          change: `${analytics.boxChange > 0 ? '+' : ''}${analytics.boxChange}`,
          isIncrease: analytics.boxChange >= 0,
          emoji: '🏏',
          link: '/admin/boxes',
        },
        {
          title: 'Total Users',
          value: analytics.totalUsers,
          change: `${analytics.userChange > 0 ? '+' : ''}${analytics.userChange}%`,
          isIncrease: analytics.userChange >= 0,
          emoji: '👥',
          link: '/admin/users',
        },
      ]
    : []

  useEffect(() => {
    recentBooking()
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/owner')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const recentBooking = async () => {
    setLoading(true)
    try {
      const response = await api.get('/booking/owner-recent-bookings')
      setBookings(response.data)
    } catch (error) {
      toast.error('Failed to fetch bookings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Removed local formatBookingDate

  const formatTimeRange = (startTime, endTime) => {
    const start = startTime.replace(':00', '').replace(' ', '')
    const end = formatEndTime(endTime).replace(':00', '').replace(' ', '')
    return `${start}–${end}`
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'confirmed':
        return '🟢'
      case 'completed':
        return '🔵'
      case 'cancelled':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600'
      case 'completed':
        return 'text-blue-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-display tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index}>
            <div className="p-6 bg-card/30 backdrop-blur-sm rounded-xl border-b sm:border-0 active:bg-muted/50 md:hover:bg-muted/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">
                  {stat.emoji}
                </div>
                <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                  stat.isIncrease ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {stat.isIncrease ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold tracking-tight font-display">
                  {stat.value}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary font-display tracking-tight">
            Recent Bookings
          </h2>
          <Link to="/admin/bookings">
            <Button variant="ghost" size="sm" className="gap-2 text-primary active:text-primary/80 md:hover:text-primary/80">
              View All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden">
          {bookings?.length > 0 ? (
            <div className="divide-y divide-primary/10">
              {bookings.map(booking => (
                <div
                  key={booking._id}
                  className="p-4 md:p-6 active:bg-muted/20 md:hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Location & Box */}
                      <div className="flex items-center gap-2 text-base md:text-lg font-semibold">
                        <span>📍</span>
                        <span>{booking.box.name}</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                        <span>📅</span>
                        <span>{formatBookingDate(booking.date)} • {convertTo12Hour(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>

                      {/* Status & Amount */}
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 text-sm md:text-base font-medium ${getStatusColor(booking.status)}`}>
                          <span>{getStatusEmoji(booking.status)}</span>
                          <span className="capitalize">{booking.status}</span>
                        </div>
                        <div className="text-lg md:text-xl font-bold text-primary">
                          ₹{booking.amountPaid}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Details Button */}
                  <button
                    onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                    className="flex items-center gap-2 text-sm text-primary mt-3 active:text-primary/80 md:hover:text-primary/80 transition-colors"
                  >
                    {expandedBooking === booking._id ? (
                      <>
                        <ChevronUp size={16} />
                        <span>Hide Details</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        <span>View Details</span>
                      </>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {expandedBooking === booking._id && (
                    <div className="mt-4 pt-4 border-t border-primary/10 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">{booking.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{booking.startTime} - {formatTime(booking.endTime)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No recent bookings found
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl md:text-3xl font-bold text-primary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Link to="/admin/boxes/create">
            <Button className="w-full justify-start h-12 text-base md:text-lg gap-3" variant="default">
              <Box size={20} /> Create New Box
            </Button>
          </Link>
          <Link to="/admin/block-slot">
            <Button className="w-full justify-start h-12 text-base md:text-lg gap-3" variant="secondary">
              <Clock size={20} /> Block Time Slot
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button className="w-full justify-start h-12 text-base md:text-lg gap-3" variant="outline">
              <Calendar size={20} /> View All Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
