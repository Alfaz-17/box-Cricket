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
import api from '../../utils/api'
const Dashboard = () => {
    const [loading, setLoading] = useState(false);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const  [bookings,setBookings]=useState([])
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Bookings',
      value: '142',
      change: '+12%',
      isIncrease: true,
      icon: <Calendar className="text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      link: '/admin/bookings'
    },
    {
      title: 'Revenue',
      value: '$5,240',
      change: '+8%',
      isIncrease: true,
      icon: <DollarSign className="text-green-500" />,
      color: 'bg-green-100 dark:bg-green-900/30',
      link: '/admin/bookings'
    },
    {
      title: 'Cricket Boxes',
      value: '8',
      change: '+2',
      isIncrease: true,
      icon: <Box className="text-yellow-500" />,
      color: 'bg-yellow-100 dark:bg-yellow-900/30',
      link: '/admin/boxes'
    },
    {
      title: 'Users',
      value: '186',
      change: '+24%',
      isIncrease: true,
      icon: <Users className="text-purple-500" />,
      color: 'bg-purple-100 dark:bg-purple-900/30',
      link: '/admin/users'
    }
  ];

    useEffect(() => {
      recentBooking();
 
    }, []);
  

  
const recentBooking = async () => {
  setLoading(true);
  try {
    const response = await api.get('/owners/recent-bookings');
    setBookings(response.data);
  } catch (error) {
    toast.error('Failed to fetch bookings');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  const recentBookings = [
    {
      id: '1',
      user: 'John Smith',
      boxName: 'Premium Cricket Box',
      date: '2025-06-15',
      time: '10:00 - 12:00',
      amount: '$90',
      status: 'confirmed'
    },
    {
      id: '2',
      user: 'Emily Johnson',
      boxName: 'Standard Cricket Net',
      date: '2025-06-14',
      time: '14:00 - 15:00',
      amount: '$25',
      status: 'confirmed'
    },
    {
      id: '3',
      user: 'Michael Wilson',
      boxName: 'Professional Training Box',
      date: '2025-06-13',
      time: '16:00 - 18:00',
      amount: '$120',
      status: 'pending'
    },
    {
      id: '4',
      user: 'Sarah Davis',
      boxName: 'Premium Cricket Box',
      date: '2025-06-12',
      time: '09:00 - 11:00',
      amount: '$90',
      status: 'confirmed'
    },
    {
      id: '5',
      user: 'Robert Brown',
      boxName: 'Standard Cricket Net',
      date: '2025-06-11',
      time: '13:00 - 14:00',
      amount: '$25',
      status: 'cancelled'
    }
  ];
  
  const popularBoxes = [
    {
      id: '1',
      name: 'Premium Cricket Box',
      bookings: 48,
      revenue: '$4,320',
      utilization: '78%'
    },
    {
      id: '2',
      name: 'Standard Cricket Net',
      bookings: 64,
      revenue: '$1,600',
      utilization: '62%'
    },
    {
      id: '3',
      name: 'Professional Training Box',
      bookings: 30,
      revenue: '$3,600',
      utilization: '45%'
    }
  ];
  
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
                              <div>{new Date(booking.date).toLocaleDateString()}</div>
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
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                      Popular Cricket Boxes
                    </h2>
                    <Link to="/admin/boxes">
                      <Button variant="link" size="sm" className="flex items-center">
                        View All <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {popularBoxes.map((box) => (
                      <div key={box.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 rounded-md bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-3">
                          <Box size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {box.name}
                          </p>
                          <div className="flex text-xs text-gray-500 dark:text-gray-400">
                            <span className="mr-2">{box.bookings} bookings</span>
                            <span>Utilization: {box.utilization}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {box.revenue}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Revenue
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Link to="/admin/boxes/create">
                      <Button variant="secondary" fullWidth className="flex items-center justify-center">
                        <Box size={16} className="mr-2" />
                        Add New Cricket Box
                      </Button>
                    </Link>
                  </div>
                </Card>
                
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