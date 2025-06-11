import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock,
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Box, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Menu
} from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEffect } from 'react';
import api from '../../utils/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
  
  const  [bookings,setBookings]=useState([])
  const [analytics, setAnalytics] = useState(null);
  // Mock data for demonstration
const stats = analytics
  ? [
      {
        title: 'Total Bookings',
        value: analytics.totalBookings,
        change: `${analytics.bookingChange > 0 ? '+' : ''}${analytics.bookingChange}%`,
        isIncrease: analytics.bookingChange >= 0,
        icon: <Calendar className="text-blue-500" />,
        color: 'bg-blue-100 dark:bg-blue-900/30',
        link: '/admin/bookings'
      },
      {
        title: 'Revenue',
        value: `${analytics.totalRevenue} Rs`,
        change: `${analytics.revenueChange > 0 ? '+' : ''}${analytics.revenueChange}%`,
        isIncrease: analytics.revenueChange >= 0,
        icon: <DollarSign className="text-green-500" />,
        color: 'bg-green-100 dark:bg-green-900/30',
        link: '/admin/bookings'
      },
      {
        title: 'Cricket Boxes',
        value: analytics.totalBoxes,
        change: `${analytics.boxChange > 0 ? '+' : ''}${analytics.boxChange}`,
        isIncrease: analytics.boxChange >= 0,
        icon: <Box className="text-yellow-500" />,
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        link: '/admin/boxes'
      },
      {
        title: 'Users',
        value: analytics.totalUsers,
        change: `${analytics.userChange > 0 ? '+' : ''}${analytics.userChange}%`,
        isIncrease: analytics.userChange >= 0,
        icon: <Users className="text-purple-500" />,
        color: 'bg-purple-100 dark:bg-purple-900/30',
        link: '/admin/users'
      }
    ]
  : [];



    useEffect(() => {
      recentBooking();
        fetchAnalytics();
 
    }, []);


    const fetchAnalytics = async () => {
  try {
    const response = await api.get('/analytics/owner');
    setAnalytics(response.data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};
    
  

  
const recentBooking = async () => {
  setLoading(true);
  try {
    const response = await api.get('/booking/owner-recent-bookings');
    setBookings(response.data);
  } catch (error) {
    toast.error('Failed to fetch bookings');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
 
  

  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="lg:flex">
        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, Admin
              </span>
            </div>
          </div>
          
          <div className="py-6 px-4 sm:px-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`${stat.color} rounded-lg p-5 transition-transform duration-300 hover:transform hover:scale-105`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className={`flex items-center text-sm ${
                      stat.isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.isIncrease ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                      {stat.change}
                    </span>
                    <Link to={stat.link} className="ml-auto flex items-center text-sm text-yellow-600 dark:text-yellow-400 hover:underline">
                      View <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Bookings */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                      Recent Bookings
                    </h2>
                    <Link to="/admin/bookings">
                      <Button variant="link" size="sm" className="flex items-center">
                        View All <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Box
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date & Time
                          </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                           Boxes
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {bookings?bookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                              {booking.user}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {booking.box.name}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              <div>{booking.date}</div>
                              <div className="text-xs">{booking.startTime} to {booking.endTime}  </div>
                            </td>
                             <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {booking.quarterName}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {booking.amountPaid} rs
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                  booking.status === 'complete' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        )):null}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              
              {/* Popular Boxes */}
              <div className="lg:col-span-1">
           
                
                {/* Quick Actions Card */}
                <Card className="mt-6">
                  <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Link to="/admin/boxes/create">
                      <Button variant="secondary" fullWidth className="flex items-center justify-center">
                        <Box size={16} className="mr-2" />
                        Create New Box
                      </Button>
                    </Link>
                    <Link to="/admin/block-slot">
                      <Button variant="secondary" fullWidth className="flex items-center justify-center">
                        <Clock size={16} className="mr-2" />
                        Block Time Slot
                      </Button>
                    </Link>
                    <Link to="/admin/bookings">
                      <Button variant="secondary" fullWidth className="flex items-center justify-center">
                        <Calendar size={16} className="mr-2" />
                        View All Bookings
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;