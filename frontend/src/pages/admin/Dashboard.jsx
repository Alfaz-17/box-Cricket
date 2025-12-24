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
  ChevronUp,
  LayoutDashboard,
  Activity,
  History,
  Zap,
  Plus
} from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { formatTime, formatEndTime, convertTo12Hour, formatBookingDate } from '../../utils/formatDate'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)

  const stats = analytics
    ? [
        {
          title: 'Total Bookings',
          value: analytics.totalBookings,
          change: `${analytics.bookingChange > 0 ? '+' : ''}${analytics.bookingChange}%`,
          isIncrease: analytics.bookingChange >= 0,
          link: '/admin/bookings',
          icon: Calendar,
        },
        {
          title: 'Total Revenue',
          value: `₹${analytics.totalRevenue}`,
          change: `${analytics.revenueChange > 0 ? '+' : ''}${analytics.revenueChange}%`,
          isIncrease: analytics.revenueChange >= 0,
          link: '/admin/bookings',
          icon: DollarSign,
        },
        {
          title: 'Active Boxes',
          value: analytics.totalBoxes,
          change: `${analytics.boxChange > 0 ? '+' : ''}${analytics.boxChange}`,
          isIncrease: analytics.boxChange >= 0,
          link: '/admin/boxes',
          icon: Box,
        },
        {
          title: 'Total Users',
          value: analytics.totalUsers,
          change: `${analytics.userChange > 0 ? '+' : ''}${analytics.userChange}%`,
          isIncrease: analytics.userChange >= 0,
          link: '/admin/users',
          icon: Users,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <LayoutDashboard className="text-primary w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Owner  <span className="text-primary">Dashboard</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Booking reposrts</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/boxes/create">
              <Button size="sm" className="text-[10px] font-bold uppercase tracking-widest h-11 border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                <Plus size={14} className="mr-2" /> ADD new Box
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link} className="group">
              <div className="p-6 bg-card border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
                    <stat.icon size={18} className="text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                    stat.isIncrease ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Recent Bookings List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-1 bg-primary rounded-full"></div>
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Bookings</h2>
              </div>
              <Link to="/admin/bookings" className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                SEE All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden divide-y divide-border">
              {bookings?.length > 0 ? (
                bookings.map(booking => (
                  <div key={booking._id} className="p-6 hover:bg-muted/30 transition-colors group">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border shrink-0 mt-1">
                          <History size={18} className="text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-foreground leading-none">{booking.box.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{booking.user}</p>
                          <div className="flex items-center gap-4 pt-2 text-[10px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {formatBookingDate(booking.date)}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {convertTo12Hour(booking.startTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:items-end flex-row sm:flex-col justify-between sm:justify-center gap-4 sm:gap-2">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue</p>
                          <p className="text-xl font-bold text-primary">₹{booking.amountPaid}</p>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                          booking.status === 'confirmed' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                          booking.status === 'completed' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <Activity size={32} className="text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">No active telemetry found</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-4 w-1 bg-primary rounded-full"></div>
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Operations</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Link to="/admin/block-slot">
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
                      <Zap size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Block Slots</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">Prevent unit scheduling</p>
                    </div>
                  </div>
                </Link>
                <Link to="/admin/boxes">
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
                      <Box size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Box Management</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">Manage all boxes</p>
                    </div>
                  </div>
                </Link>
                {/* <Link to="/admin/users">
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
                      <Users size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Client Registry</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">Network user directory</p>
                    </div>
                  </div>
                </Link> */}
              </div>
            </div>

            {/* Performance Tip */}
            <div className="p-5 bg-primary/5 border border-primary/10 rounded-lg space-y-3">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Network Notice</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unit performance is calculated based on confirmed booking liquidity. Monitor low-yield boxes in the Audit panel.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
