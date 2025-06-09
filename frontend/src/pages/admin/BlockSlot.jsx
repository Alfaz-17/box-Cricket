import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TimePicker from '../../components/ui/TimePicker';
import api from '../../utils/api';

const BlockSlot = () => {
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(''); // NEW quarter state

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
        const firstBox = data.boxes[0];
        setSelectedBoxId(firstBox._id);

        // Set default selectedQuarter from first box's quarters if available
        if (firstBox.quarters && firstBox.quarters.length > 0) {
          setSelectedQuarter(firstBox.quarters[0].name || firstBox.quarters[0]);
        } else {
          setSelectedQuarter(''); // No quarters available
        }

        fetchBlockedSlots(firstBox._id);
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
      console.log(res.data)
    } catch (error) {
      toast.error('Failed to fetch blocked slots');
      console.log("Error fetching slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  // When box changes, update quarters & selectedQuarter accordingly
  const handleBoxChange = (e) => {
    const boxId = e.target.value;
    setSelectedBoxId(boxId);

    const box = boxes.find(b => b._id === boxId);
    if (box && box.quarters && box.quarters.length > 0) {
      setSelectedQuarter(box.quarters[0].name || box.quarters[0]);
    } else {
      setSelectedQuarter('');
    }

    fetchBlockedSlots(boxId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedQuarter) {
      toast.error('Please select a quarter');
      setLoading(false);
      return;
    }

    const formattedDate = formData.date.toISOString().split("T")[0];

    try {
      const response = await api.post('/slots/block-slots', {
        date: formattedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        boxId: selectedBoxId,
        quarterName: selectedQuarter, // IMPORTANT: send quarterName
      });

      toast.success(response.data.message || 'Time slot blocked successfully');
      fetchBlockedSlots(selectedBoxId);

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
      fetchBlockedSlots(selectedBoxId);
    } catch (err) {
      toast.error("Failed to unblock slot");
    }
  };
  

  //fromat date to a readable string
    const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card title="Block a Time Slot">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Select Box</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedBoxId || ''}
              onChange={handleBoxChange}
              required
            >
              {boxes.map(box => (
                <option key={box._id} value={box._id}>
                  {box.name || `Box ${box._id.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Quarter</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedQuarter || ''}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              required
              disabled={!selectedBoxId || !boxes.find(b => b._id === selectedBoxId)?.quarters?.length}
            >
              {boxes.find(b => b._id === selectedBoxId)?.quarters?.map((quarter, idx) => (
                <option key={idx} value={quarter.name || quarter}>
                  {quarter.name || quarter}
                </option>
              )) || (
                <option value="">No quarters available</option>
              )}
            </select>
          </div>

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
      {blockedSlots.map((slotGroup) => (
        <li
          key={slotGroup._id}
          className="p-4 bg-yellow-100 dark:bg-gray-800 rounded-md flex flex-col space-y-2"
        >
          <p className="font-semibold">
            Quarter: {slotGroup.quarterName}
          </p>

          <div className="pl-4 space-y-3">
            {slotGroup.slots.map((timeSlot, idx) => (
              <div
                key={idx}
                className="p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-900"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Time:</span>{' '}
                  {timeSlot.startTime} - {timeSlot.endTime}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Date:</span>{' '}
                  {formatDate(timeSlot.date)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Reason:</span>{' '}
                  {timeSlot.reason || 'N/A'}
                </p>
                <button
                  onClick={() => handleUnblock(timeSlot._id)}
                  className="mt-2 text-red-500 hover:text-red-700"
                  aria-label="Unblock Slot"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )}
</Card>

    </div>
  );
};

export default BlockSlot;
