// components/BlockedSlots.jsx
import React, { useEffect, useState } from "react";
import { Calendar, Clock, Ban } from "lucide-react";

import api from '../../utils/api'
export default function BlockedSlots({ boxId }) {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await api.get(`/slots/booked-blocked-slots/${boxId}`);
        setBlockedSlots(res.data.blockedSlots || []);
        console.log(res.data)
      } catch (error) {
        console.error("Failed to fetch blocked slots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [boxId]);

  if (loading) return <p>Loading blocked slots...</p>;
  if (blockedSlots.length === 0) return <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg shadow-inner">
  <div className="flex justify-center mb-2">
    <Ban className="w-8 h-8 text-red-400" />
  </div>
  <p className="text-lg font-medium">No blocked slots found</p>
  <p className="text-sm">You're all clear! No time blocks are currently scheduled.</p>
</div>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
  <h2 className="text-2xl font-bold text-red-600 mb-4">⛔ Blocked Slots</h2>

  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
    {blockedSlots.map(slot => (
      <div
        key={slot._id}
        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-2 mb-1 text-gray-700">
          <Calendar className="w-4 h-4 text-red-500" />
          <span className="font-medium">Date:</span>
          <span>{slot.date}</span>
        </div>
        <div className="flex items-center gap-2 mb-1 text-gray-700">
          <Clock className="w-4 h-4 text-red-500" />
          <span className="font-medium">Time:</span>
          <span>{slot.startTime} - {slot.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Ban className="w-4 h-4 text-red-500" />
          <span className="font-medium">Reason:</span>
          <span>{slot.reason || "N/A"}</span>
        </div>
      </div>
    ))}
  </div>
</div>

  );
}
