import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, AlertCircle, RefreshCw, Home, MessageSquare, ShieldAlert } from 'lucide-react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('bookingId');
  const reason = searchParams.get('reason') || 'Payment was not completed';
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    if (error === 'booking_not_found') {
      return 'Booking not found. Please contact support.';
    }
    if (error === 'invalid_response') {
      return 'Invalid payment response. Please try again or contact support.';
    }
    return reason;
  };

  const handleRetry = () => {
    if (bookingId) {
      navigate(`/booking?retry=${bookingId}`);
    } else {
      navigate('/');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 font-sans">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-900/10 rounded-full blur-[120px]" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl relative z-10"
      >
        {/* Error Header */}
        <div className="text-center mb-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-6 relative"
          >
            <XCircle className="w-16 h-16 text-red-500 relative z-10" />
            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl scale-125" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight italic font-['Bebas_Neue',_sans-serif]">
            PAYMENT FAILED
          </h1>
          <p className="text-gray-400 font-medium">
            Don't worry, your money is safe. Let's try to fix this.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
          
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            What happened?
          </h2>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 text-center">
            <p className="text-red-200 font-medium">
              "{getErrorMessage()}"
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-white/80 font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              Next Steps:
            </h3>
            <ul className="space-y-3">
              {[
                "Check your balance and network connection",
                "Ensure your card/UPI limit isn't exceeded",
                "Try an alternative payment method"
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {bookingId && (
            <div className="flex items-center justify-between py-4 border-t border-white/10">
              <span className="text-gray-500 text-xs uppercase tracking-widest">Booking ID</span>
              <span className="text-white font-mono font-bold">{bookingId}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-4 px-8 rounded-2xl font-black italic tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_20px_-10px_rgba(239,68,68,0.3)] font-['Bebas_Neue',_sans-serif] text-xl"
          >
            TRY AGAIN <RefreshCw className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 py-4 px-8 rounded-2xl font-black italic tracking-wider border border-white/10 transition-all font-['Bebas_Neue',_sans-serif] text-xl"
          >
            BACK TO HOME
          </motion.button>
        </div>

        {/* Support Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Still facing issues? We're here to help</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold">
              <MessageSquare className="w-4 h-4" /> Live Support
            </button>
            <div className="hidden sm:block w-1.5 h-1.5 bg-white/10 rounded-full" />
            <p className="text-white/60 text-sm font-medium italic">
              support@cricketbox.online
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;
