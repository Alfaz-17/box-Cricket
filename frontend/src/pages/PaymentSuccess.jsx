import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import BookingCard from '../components/BookingCard';
import { formatBookingDate } from '../utils/formatDate';
import { downloadReceipt } from '../utils/downloadReceipt';

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

  /* handleDownloadReceipt removed, using imported utility */

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
            Your slot at <span className="text-green-500">{booking?.box?.name}</span> is reserved.
          </p>
        </motion.div>

        {/* Booking Card */}
        {booking && (
          <motion.div 
            variants={itemVariants}
            className="mb-8 w-full"
          >
            <BookingCard booking={booking} />
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
