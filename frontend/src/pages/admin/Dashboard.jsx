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
  <div className="min-h-screen bg-base-300">
    <div className="lg:flex ">
      <div className="flex-1 min-w-0  ">
        {/* Top Bar */}
        <div className=" bg-base-300 border-b border-base-100 px-4 py-3 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-base-content">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-base-content opacity-70">Welcome, Admin</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-6 px-4 sm:px-6">
          {/* Stats Cards */}
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {stats.map((stat, index) => (
    <div
      key={index}
      className={`card shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 ${stat.color} text-base-content`}
    >
      <div className="card-body p-5  bg-base-100 rounded-2xl">
        <div className="flex justify-between items-start ">
          <div>
            <p className="text-sm text-primary font-medium opacity-70 mb-1">{stat.title}</p>
            <p className="text-2xl text-primary font-bold">{stat.value}</p>
          </div>
          <div className="p-2 rounded-full bg-base-100 shadow">
            {stat.icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span
            className={`flex items-center text-sm ${
              stat.isIncrease ? 'text-success' : 'text-error'
            }`}
          >
            {stat.isIncrease ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            {stat.change}
          </span>
          <Link
            to={stat.link}
            className="ml-auto flex items-center text-primary text-sm  hover:underline"
          >
            View <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  ))}
</div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 p-4 shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-primary">Recent Bookings</h2>
                  <Link to="/admin/bookings">
                    <button className="btn btn-link btn-sm">
                      View All <ArrowRight size={14} className="ml-1" />
                    </button>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr className="text-xs text-base-content opacity-70">
                        <th>User</th>
                        <th>Box</th>
                        <th>Date & Time</th>
                        <th>Boxes</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings ? bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>{booking.user}</td>
                          <td>{booking.box.name}</td>
                          <td>
                            <div>{booking.date}</div>
                            <div className="text-xs opacity-70">{booking.startTime} to {booking.endTime}</div>
                          </td>
                          <td>{booking.quarterName}</td>
                          <td>{booking.amountPaid} rs</td>
                          <td>
                            <span className={`badge badge-sm font-medium ${
                              booking.status === 'confirmed' ? 'badge-success' :
                              booking.status === 'complete' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      )) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 p-4 shadow mt-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/admin/boxes/create">
                    <button className="btn btn-secondary w-full my-2">
                      <Box size={16} className="mr-2" />
                      Create New Box
                    </button>
                  </Link>
                  <Link to="/admin/block-slot">
                    <button className="btn btn-secondary w-full my-2">
                      <Clock size={16} className="mr-2" />
                      Block Time Slot
                    </button>
                  </Link>
                  <Link to="/admin/bookings">
                    <button className="btn btn-secondary w-full my-2">
                      <Calendar size={16} className="mr-2" />
                      View All Bookings
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);

};

export default Dashboard;