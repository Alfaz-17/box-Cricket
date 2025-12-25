import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, MapPin, User, Phone, IndianRupee, ArrowRight, Home, Download } from 'lucide-react';
import { formatBookingDate } from '../utils/formatDate';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/booking/report/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-t-2 border-green-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative overflow-hidden flex flex-col items-center justify-center py-12 px-4">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl relative z-10"
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-6 relative"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 relative z-10" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-green-500/10 rounded-full"
            />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight italic font-['Bebas_Neue',_sans-serif]">
            BOOKING CONFIRMED!
          </h1>
          <p className="text-gray-400 font-medium">
            Your slot at <span className="text-green-500">{booking?.boxName}</span> is reserved.
          </p>
        </motion.div>

        {/* Booking Card */}
        {booking && (
          <motion.div 
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl overflow-hidden relative"
          >
            {/* Glossy Overlay */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Booking ID</p>
                <h3 className="text-white font-mono font-bold text-lg">{booking.bookingId}</h3>
              </div>
              <div className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <span className="text-green-500 text-sm font-bold">PAID</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Date</p>
                    <p className="text-white font-semibold">{formatBookingDate(booking.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Time Slot</p>
                    <p className="text-white font-semibold">{booking.startTime} - {booking.endTime}</p>
                    <p className="text-gray-400 text-xs font-medium">{booking.duration} hour(s)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Location</p>
                    <p className="text-white font-semibold">{booking.quarterName || 'Main Ground'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-white font-semibold">{booking.contactNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between bg-gradient-to-r from-transparent to-white/5 p-4 rounded-2xl">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Amount Paid</p>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee className="w-6 h-6 text-green-500" />
                  <span className="text-3xl font-black text-white italic font-['Bebas_Neue',_sans-serif]">
                    {booking.amountPaid}
                  </span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/10 transition-all font-bold text-sm"
              >
                <Download className="w-4 h-4" />
                Receipt
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/my-bookings')}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-8 rounded-2xl font-black italic tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_20px_-10px_rgba(34,197,94,0.3)] font-['Bebas_Neue',_sans-serif] text-xl"
          >
            VIEW MY BOOKINGS <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 py-4 px-8 rounded-2xl font-black italic tracking-wider border border-white/10 transition-all font-['Bebas_Neue',_sans-serif] text-xl"
          >
            BACK TO HOME
          </motion.button>
        </motion.div>

        {/* Info Box */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-center flex items-center gap-4 justify-center"
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-xl">📱</span>
          </div>
          <p className="text-sm text-blue-200 font-medium">
            Check your WhatsApp for the booking confirmation message.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
