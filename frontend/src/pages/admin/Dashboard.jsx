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
  Activity,
  TrendingUp
} from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [analytics, setAnalytics] = useState(null)

  // Mock data for demonstration
  const stats = analytics
    ? [
        {
          title: 'Total Bookings',
          value: analytics.totalBookings,
          change: `${analytics.bookingChange > 0 ? '+' : ''}${analytics.bookingChange}%`,
          isIncrease: analytics.bookingChange >= 0,
          icon: <Calendar className="w-6 h-6 text-blue-500" />,
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          link: '/admin/bookings',
        },
        {
          title: 'Total Revenue',
          value: `₹${analytics.totalRevenue}`,
          change: `${analytics.revenueChange > 0 ? '+' : ''}${analytics.revenueChange}%`,
          isIncrease: analytics.revenueChange >= 0,
          icon: <DollarSign className="w-6 h-6 text-green-500" />,
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          link: '/admin/bookings',
        },
        {
          title: 'Active Boxes',
          value: analytics.totalBoxes,
          change: `${analytics.boxChange > 0 ? '+' : ''}${analytics.boxChange}`,
          isIncrease: analytics.boxChange >= 0,
          icon: <Box className="w-6 h-6 text-yellow-500" />,
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          link: '/admin/boxes',
        },
        {
          title: 'Total Users',
          value: analytics.totalUsers,
          change: `${analytics.userChange > 0 ? '+' : ''}${analytics.userChange}%`,
          isIncrease: analytics.userChange >= 0,
          icon: <Users className="w-6 h-6 text-purple-500" />,
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
                <Activity size={16} /> System Status
            </Button>
            <Button className="gap-2">
                <TrendingUp size={16} /> View Reports
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index}>
            <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border ${stat.border} bg-card/50 backdrop-blur-sm`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    {stat.icon}
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
                  <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl font-bold tracking-wide">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold text-primary">
              Recent Bookings
            </h2>
            <Link to="/admin/bookings">
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <Card className="border-primary/10 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Box</th>
                    <th className="px-6 py-4 font-bold">Date & Time</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {bookings?.length > 0 ? (
                    bookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-muted/5 transition-colors">
                        <td className="px-6 py-4 font-medium">{booking.user}</td>
                        <td className="px-6 py-4 text-muted-foreground">{booking.box.name}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{booking.date}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">₹{booking.amountPaid}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : booking.status === 'complete'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold text-primary">
            Quick Actions
          </h2>
          <Card className="border-primary/10 shadow-md">
            <CardContent className="p-6 space-y-4">
              <Link to="/admin/boxes/create">
                <Button className="w-full justify-start h-12 text-lg gap-3" variant="default">
                  <Box size={20} /> Create New Box
                </Button>
              </Link>
              <Link to="/admin/block-slot">
                <Button className="w-full justify-start h-12 text-lg gap-3" variant="secondary">
                  <Clock size={20} /> Block Time Slot
                </Button>
              </Link>
              <Link to="/admin/bookings">
                <Button className="w-full justify-start h-12 text-lg gap-3" variant="outline">
                  <Calendar size={20} /> View All Bookings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mini Stats or Info */}
          <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground border-none shadow-lg">
            <CardContent className="p-6">
                <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold mb-2">Pro Tip</h3>
                <p className="text-primary-foreground/90 text-sm leading-relaxed">
                    Keep your box availability updated to maximize bookings. Check the "Block Slot" section to manage maintenance times.
                </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
