import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const BlockSlot = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    boxId: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    reason: ''
  });

  const [boxes, setBoxes] = useState([
    { id: '1', name: 'Premium Cricket Box' },
    { id: '2', name: 'Standard Cricket Net' },
    { id: '3', name: 'Professional Training Box' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/owners/blocktime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:"include",
        body: JSON.stringify({
          ...formData,
          date: formData.date.toISOString().split('T')[0]
        })
      });

      if (!response.ok) throw new Error('Failed to block time slot');

      toast.success('Time slot blocked successfully');
      setFormData({
        boxId: '',
        date: new Date(),
        startTime: '',
        endTime: '',
        reason: ''
      });
    } catch (error) {
      toast.error(error.message);
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
              Select Cricket Box
            </label>
            <select
              value={formData.boxId}
              onChange={(e) => setFormData(prev => ({ ...prev, boxId: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
              required
            >
              <option value="">Select a box</option>
              {boxes.map(box => (
                <option key={box.id} value={box.id}>
                  {box.name}
                </option>
              ))}
            </select>
          </div>

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
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
                  required
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                End Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
                  required
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
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