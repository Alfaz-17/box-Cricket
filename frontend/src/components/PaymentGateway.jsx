import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

/**
 * PaymentGateway Component
 * Auto-submits form to redirect user to SabPaisa payment gateway
 */
const PaymentGateway = ({ paymentData }) => {
  const formRef = useRef(null);
  const [status, setStatus] = useState('Initializing secure connection...');

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus('Encrypting payment data...'), 1000),
      setTimeout(() => setStatus('Redirecting to SabPaisa...'), 2000),
      setTimeout(() => {
        if (formRef.current && paymentData) {
          formRef.current.submit();
        }
      }, 3000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [paymentData]);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95 }
  };

  const loaderVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md p-8 mx-4"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
          {/* Branded Icon Section */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <motion.div
              variants={loaderVariants}
              animate="animate"
              className="absolute inset-0 w-24 h-24 border-t-2 border-r-2 border-green-500 rounded-full"
            />
            <div className="w-20 h-20 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight font-['Bebas_Neue',_sans-serif]">
            SECURE CHECKOUT
          </h1>
          
          <div className="h-6 mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-400 text-sm font-medium"
              >
                {status}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 bg-white/5 py-3 px-4 rounded-xl border border-white/5">
              <Lock className="w-4 h-4" />
              <span>TLS 1.2 End-to-End Encryption Enabled</span>
            </div>
          </div>

          {/* Hidden SabPaisa Form */}
          {paymentData && (
            <form
              ref={formRef}
              action={paymentData.spURL}
              method="POST"
              className="hidden"
            >
              <input type="hidden" name="encData" value={paymentData.encData} />
              <input type="hidden" name="clientCode" value={paymentData.clientCode} />
            </form>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-600 text-[10px] uppercase tracking-[0.2em]">
            <span>Processing via</span>
            <span className="text-white font-bold italic">SabPaisa</span>
          </div>
        </div>
      </motion.div>

      {/* Subtle bottom text */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-gray-600 text-xs">Please do not refresh or go back</p>
      </div>
    </div>
  );
};

export default PaymentGateway;
