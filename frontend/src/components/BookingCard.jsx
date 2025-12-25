import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Download, Eye, AlertCircle, XCircle } from 'lucide-react';
import { Card } from './ui/Card'; // Adjusted path assuming components is sibling or similar
import { Button } from './ui/Button'; // Adjusted path
import { downloadReceipt } from '../utils/downloadReceipt';
import { formatEndTime, formatBookingDate } from '../utils/formatDate';

const BookingCard = ({ booking }) => {
  const getStatusBadge = status => {
    if (status === 'confirmed') {
      return (
        <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
          <CheckCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
        </div>
      )
    } else if (status === 'completed') {
      return (
        <div className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
          <CheckCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
        </div>
      )
    } else if (status === 'pending') {
      return (
        <div className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
          <AlertCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
          <XCircle size={14} className="mr-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Cancelled</span>
        </div>
      )
    }
  }

  return (
    <Card className="overflow-hidden hover:border-primary/40 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 lg:w-1/4 h-48 md:h-auto relative overflow-hidden">
          <img
            src={booking.box.image}
            alt={booking.box.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
          <div className="absolute bottom-3 left-3 md:hidden">
             {getStatusBadge(booking.status)}
          </div>
        </div>
        
        <div className="md:w-2/3 lg:w-3/4 p-4 sm:p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 font-display tracking-tight"
                >
                  {booking.box.name}
                </h3>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{booking.box.location}</span>
                </div>
              </div>
              <div className="hidden md:block ml-4">
                {getStatusBadge(booking.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
                <Calendar size={18} className="sm:w-6 sm:h-6 mr-3 text-primary flex-shrink-0" />
                <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-foreground/60 font-bold uppercase tracking-wider mb-0.5">Booking Date</p>
                    <p className="font-bold text-sm sm:text-base text-foreground truncate">{formatBookingDate(booking.date)}</p>
                </div>
              </div>
              <div className="flex items-center p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
                <Clock size={18} className="sm:w-6 sm:h-6 mr-3 text-primary flex-shrink-0" />
                <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-foreground/60 font-bold uppercase tracking-wider mb-0.5">Time Slot</p>
                    <p className="font-bold text-sm sm:text-base text-foreground truncate">
                        {booking.startTime} - {formatEndTime(booking.endTime)}
                    </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-5 border-t-2 border-primary/10">
            <div className="flex items-baseline gap-2">
              <span className="text-xs sm:text-sm font-semibold text-foreground/60 uppercase tracking-wide">Total Amount:</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">₹{booking.amountPaid}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link to={`/box/${booking.box._id}`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> View Box
                </Button>
              </Link>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadReceipt(booking._id)} // Using booking._id as per original logic, though PaymentSuccess has bookingId. Checking consistency.
                className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default BookingCard;
