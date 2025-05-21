import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TimePicker from '../../components/ui/TimePicker';

const BlockSlot = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: '',
    endTime: '',
    reason: ''
  });


    const handleTimeChange = (newTime) => {
   setFormData(prev=>({
    ...prev,
    startTime:newTime,
    endTime:newTime
   }))
  
  };
  const [boxes, setBoxes] = useState([
    { id: '1', name: 'Premium Cricket Box' },
    { id: '2', name: 'Standard Cricket Net' },
    { id: '3', name: 'Professional Training Box' }
  ]);
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  const formattedDate = formData.date.toISOString().split("T")[0];

  try {
    const response = await fetch('http://localhost:5001/api/owners/block-slot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify({
        date: formattedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason
      })
    });

    const data = await response.json(); // ✅ Must await this!

    if (!response.ok) {
      throw new Error(data.message || "Failed to block slot");
    }

    toast.success(data.message || 'Time slot blocked successfully');

    setFormData({
      date: new Date(),
      startTime: '',
      endTime: '',
      reason: ''
    });

  } catch (error) {
    toast.error(error.message);
    console.log("error in blocked time slots", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Block Time Slot">
        <form onSubmit={handleSubmit}>
       

          <div className="mb-4">
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Date
            </label>
            <div className="relative">
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                minDate={new Date()}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
                dateFormat="MMMM d, yyyy"
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Start Time
              </label>
              <div className="relative">
        <TimePicker
  value={formData.startTime} // Show the current selected time
  onChange={(newTime) =>
    setFormData((prev) => ({
      ...prev,
      startTime: newTime
    }))
  }
/>


                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                End Time
              </label>
              <div className="relative">
         <TimePicker
  value={formData.endTime} // Show the current selected time
  onChange={(endTime) =>
    setFormData((prev) => ({
      ...prev,
      endTime: endTime
    }))
  }
/>
                <Clock className="absolute right-3 top-2.5 h-5 w-5 mx-1 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Reason for Blocking
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows="4"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
              placeholder="Enter reason for blocking this time slot"
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={loading}
          >
            Block Time Slot
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BlockSlot;