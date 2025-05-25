// components/BlockedSlots.jsx
import React, { useEffect, useState } from "react";
import { Calendar, Clock, Ban, Square } from "lucide-react";
import api from '../../utils/api';

export default function BlockedSlots({ boxId }) {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await api.get(`/slots/booked-blocked-slots/${boxId}`);
        setBlockedSlots(res.data.blockedSlots || []);
        console.log(res.data);
      } catch (error) {
        console.error("Failed to fetch blocked slots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [boxId]);

  if (loading) return <p>Loading blocked slots...</p>;
  if (blockedSlots.length === 0)
    return (
      <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg shadow-inner">
        <div className="flex justify-center mb-2">
          <Ban className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-lg font-medium">No blocked slots found</p>
        <p className="text-sm">
          You're all clear! No time blocks are currently scheduled.
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">⛔ Blocked Slots by Quarter</h2>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {blockedSlots.map((quarter) => (
          <div key={quarter.quarterName} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Square className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-700">
                Quarter: {quarter.quarterName}
              </h3>
            </div>

            {quarter.slots.length === 0 ? (
              <p className="text-sm text-gray-500">No blocked slots in this quarter.</p>
            ) : (
              <div className="space-y-3">
                {quarter.slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1 text-gray-700">
                      <Calendar className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Date:</span>
                      <span>{slot.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Ban className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Reason:</span>
                      <span>{slot.reason || "N/A"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
