import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
      // Navigate back to booking page or retry payment
      navigate(`/booking?retry=${bookingId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            We couldn't process your payment
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            What happened?
          </h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              {getErrorMessage()}
            </p>
          </div>

          {bookingId && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Booking ID:</span> {bookingId}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Check your payment method and try again</li>
              <li>Ensure you have sufficient balance</li>
              <li>Contact your bank if the issue persists</li>
              <li>Reach out to our support team for assistance</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {bookingId && (
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Support Contact */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 text-center">
            Need help? Contact our support team
          </p>
          <p className="text-sm text-gray-600 text-center mt-1">
            📧 support@cricketbox.com | 📞 +91-XXXXXXXXXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
