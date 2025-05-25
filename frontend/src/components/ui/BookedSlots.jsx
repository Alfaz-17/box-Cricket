// components/BookedSlots.jsx
import React, { useEffect, useState } from "react";
import { Calendar, Clock, UserRound, CalendarX2, Square } from "lucide-react";
import api from "../../utils/api";

export default function BookedSlots({ boxId }) {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await api.get(`/slots/booked-blocked-slots/${boxId}`);
        setBookedSlots(res.data.bookedSlots || []);
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [boxId]);

  if (loading) return <p>Loading booked slots...</p>;

  if (bookedSlots.length === 0)
    return (
      <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg shadow-inner">
        <div className="flex justify-center mb-2">
          <CalendarX2 className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-lg font-medium">No upcoming booked slots</p>
        <p className="text-sm">
          There are currently no bookings scheduled for this box.
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        📅 Upcoming Booked Slots by Quarter
      </h2>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {bookedSlots.map((quarter) => (
          <div
            key={quarter.quarterName}
            className="border border-gray-300 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Square className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-700">
                Quarter: {quarter.quarterName}
              </h3>
            </div>

            {quarter.slots.length === 0 ? (
              <p className="text-sm text-gray-500">
                No booked slots in this quarter.
              </p>
            ) : (
              <div className="space-y-3">
                {quarter.slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1 text-gray-700">
                      <UserRound className="w-4 h-4 text-green-500" />
                      <span className="font-medium">User:</span>
                      <span>{slot.user}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Date:</span>
                      <span>{slot.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
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
