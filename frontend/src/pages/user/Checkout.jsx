import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard, Calendar, Clock, MapPin, CheckCircle, Shield } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch booking details');
        }
        
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Failed to load booking details');
        
        // Mock data for demo
        setBooking(mockBooking);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({
      ...paymentForm,
      [name]: value
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!paymentForm.cardName.trim()) {
      errors.cardName = 'Cardholder name is required';
    }
    
    if (!paymentForm.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentForm.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!paymentForm.expMonth.trim()) {
      errors.expMonth = 'Required';
    } else if (!/^(0[1-9]|1[0-2])$/.test(paymentForm.expMonth)) {
      errors.expMonth = 'Invalid';
    }
    
    if (!paymentForm.expYear.trim()) {
      errors.expYear = 'Required';
    } else if (!/^\d{4}$/.test(paymentForm.expYear)) {
      errors.expYear = 'Invalid';
    }
    
    if (!paymentForm.cvv.trim()) {
      errors.cvv = 'Required';
    } else if (!/^\d{3,4}$/.test(paymentForm.cvv)) {
      errors.cvv = 'Invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Normally, you'd make a POST request to Stripe here
      // const response = await fetch(`/api/booking/process-payment/${bookingId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     paymentMethodId: 'pm_card_visa' // In reality, this would come from Stripe Elements
      //   })
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Payment failed');
      // }
      
      // Success - redirect to success page
      toast.success('Payment successful');
      navigate('/booking-success', { 
        state: { 
          bookingId, 
          boxName: booking.boxName 
        } 
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Mock data for demonstration
  const mockBooking = {
    id: bookingId,
    boxId: '1',
    boxName: 'Premium Cricket Box',
    location: 'Central Sports Complex, New York',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '12:00',
    duration: 2,
    price: 90,
    subtotal: 90,
    tax: 7.2,
    total: 97.2,
    boxImage: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-300 mb-6">
        Complete Your Booking
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Payment Information
            </h2>
            
            <form onSubmit={handleSubmit}>
              <Input
                label="Cardholder Name"
                id="cardName"
                name="cardName"
                value={paymentForm.cardName}
                onChange={handleInputChange}
                placeholder="Name on card"
                error={formErrors.cardName}
              />
              
              <Input
                label="Card Number"
                id="cardNumber"
                name="cardNumber"
                value={paymentForm.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                error={formErrors.cardNumber}
              />
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="expMonth" className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Exp. Month
                  </label>
                  <input
                    type="text"
                    id="expMonth"
                    name="expMonth"
                    placeholder="MM"
                    value={paymentForm.expMonth}
                    onChange={handleInputChange}
                    maxLength={2}
                    className={`
                      w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:text-white
                      ${formErrors.expMonth ? 'border-red-500 focus:ring-red-500' : 'border-yellow-300 dark:border-gray-600 focus:border-yellow-500'}
                    `}
                  />
                  {formErrors.expMonth && <p className="mt-1 text-sm text-red-600">{formErrors.expMonth}</p>}
                </div>
                
                <div>
                  <label htmlFor="expYear" className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Exp. Year
                  </label>
                  <input
                    type="text"
                    id="expYear"
                    name="expYear"
                    placeholder="YYYY"
                    value={paymentForm.expYear}
                    onChange={handleInputChange}
                    maxLength={4}
                    className={`
                      w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:text-white
                      ${formErrors.expYear ? 'border-red-500 focus:ring-red-500' : 'border-yellow-300 dark:border-gray-600 focus:border-yellow-500'}
                    `}
                  />
                  {formErrors.expYear && <p className="mt-1 text-sm text-red-600">{formErrors.expYear}</p>}
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={handleInputChange}
                    maxLength={4}
                    className={`
                      w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:text-white
                      ${formErrors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-yellow-300 dark:border-gray-600 focus:border-yellow-500'}
                    `}
                  />
                  {formErrors.cvv && <p className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>}
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  id="saveCard"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                />
                <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Save card for future bookings
                </label>
              </div>
              
              <div className="flex items-center p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-gray-700 dark:text-gray-300">
                <Shield size={18} className="mr-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p>Your payment information is encrypted and secure. We never store your full card details.</p>
              </div>
              
              <Button
                type="submit"
                fullWidth
                isLoading={processing}
              >
                {processing ? 'Processing Payment...' : `Pay $${booking.total.toFixed(2)}`}
              </Button>
            </form>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4">
              Booking Summary
            </h2>
            
            <div className="mb-4">
              <img 
                src={booking.boxImage} 
                alt={booking.boxName} 
                className="w-full h-32 object-cover rounded-md mb-3"
              />
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-1">
                {booking.boxName}
              </h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <span>{booking.startTime} - {booking.endTime} ({booking.duration} hour{booking.duration > 1 ? 's' : ''})</span>
              </div>
              <div className="flex items-center">
                <MapPin size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <span>{booking.location}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-1">
              <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${booking.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>${booking.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200 text-lg">
                <span>Total</span>
                <span>${booking.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm">
              <CheckCircle size={16} className="mr-2" />
              <span>Cricket box is available for your selected time</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;