import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TimePicker from '../../components/ui/TimePicker';
import api from '../../utils/api';

const BlockSlot = () => {
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null); // ⭐ NEW

  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      const response = await api.get('/boxes/my-box');
      const data = response.data;
      setBoxes(data.boxes);

      if (data.boxes.length > 0) {
        setSelectedBoxId(data.boxes[0]._id); // ⭐ Save selected box
        fetchBlockedSlots(data.boxes[0]._id);
      } else {
        toast.error("No boxes found");
      }

    } catch (error) {
      toast.error('Failed to fetch boxes');
      console.error("Error fetching boxes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedSlots = async (boxId) => {
    if (!boxId) return;
    setSlotsLoading(true);
    try {
      const res = await api.get(`/slots/booked-blocked-slots/${boxId}`);
      setBlockedSlots(res.data.blockedSlots || []);
    } catch (error) {
      toast.error('Failed to fetch blocked slots');
      console.log("Error fetching slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedDate = formData.date.toISOString().split("T")[0];

    try {
      const response = await api.post('/slots/block-slots', {
        date: formattedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        boxId: selectedBoxId, // ⭐ ensure boxId is passed if required
      });

      toast.success(response.data.message || 'Time slot blocked successfully');
      fetchBlockedSlots(selectedBoxId); // ✅ REFRESH using correct ID

      setFormData({ date: new Date(), startTime: '', endTime: '', reason: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to block slot');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (slotId) => {
    try {
      await api.delete(`/slots/unblock/${slotId}`);
      toast.success("Slot unblocked successfully");
      fetchBlockedSlots(selectedBoxId); // ✅ REFRESH using correct ID
    } catch (err) {
      toast.error("Failed to unblock slot");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card title="Block a Time Slot">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <div className="relative">
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                minDate={new Date()}
                className="w-full px-3 py-2 border rounded-md"
                dateFormat="MMMM d, yyyy"
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <div className="relative">
                <TimePicker
                  value={formData.startTime}
                  onChange={(val) => setFormData(prev => ({ ...prev, startTime: val }))}
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <div className="relative">
                <TimePicker
                  value={formData.endTime}
                  onChange={(val) => setFormData(prev => ({ ...prev, endTime: val }))}
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter reason for blocking"
              required
            />
          </div>

          <Button type="submit" fullWidth isLoading={loading}>
            Block Time Slot
          </Button>
        </form>
      </Card>

      <Card title="Blocked Slots">
        {slotsLoading ? (
          <p className="text-center text-gray-500">Loading blocked slots...</p>
        ) : blockedSlots.length === 0 ? (
          <p className="text-center text-gray-500">No blocked slots found.</p>
        ) : (
          <ul className="space-y-4">
            {blockedSlots.map(slot => (
              <li key={slot._id} className="p-4 bg-yellow-100 dark:bg-gray-800 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">{slot.date} | {slot.startTime} - {slot.endTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{slot.reason}</p>
                </div>
                <button
                  onClick={() => handleUnblock(slot._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default BlockSlot;