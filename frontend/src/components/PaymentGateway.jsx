import React, { useEffect, useRef } from 'react';

/**
 * PaymentGateway Component
 * Auto-submits form to redirect user to SabPaisa payment gateway
 */
const PaymentGateway = ({ paymentData }) => {
  const formRef = useRef(null);

  useEffect(() => {
    // Auto-submit form when component mounts
    if (formRef.current && paymentData) {
      formRef.current.submit();
    }
  }, [paymentData]);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Redirecting to Payment Gateway
        </h2>
        <p className="text-gray-600">Please wait while we redirect you to complete your payment...</p>
        
        {/* Hidden form that auto-submits */}
        <form
          ref={formRef}
          action={paymentData.spURL}
          method="POST"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="encData" value={paymentData.encData} />
          <input type="hidden" name="clientCode" value={paymentData.clientCode} />
        </form>
      </div>
    </div>
  );
};

export default PaymentGateway;
