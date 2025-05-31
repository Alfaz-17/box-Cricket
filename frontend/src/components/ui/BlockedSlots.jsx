import React, { useEffect, useState } from "react";
import { Calendar, Clock, Ban, Square, Filter, CalendarX2 } from "lucide-react";
import api from "../../utils/api";

export default function BlockedSlots({ boxId }) {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await api.get(`/slots/booked-blocked-slots/${boxId}`);
        setBlockedSlots(res.data.blockedSlots || []);
        setFilteredSlots(res.data.blockedSlots || []);
      } catch (error) {
        console.error("Failed to fetch blocked slots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [boxId]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date === "") {
      setFilteredSlots(blockedSlots);
    } else {
      const filtered = blockedSlots.map((quarter) => ({
        ...quarter,
        slots: quarter.slots.filter((slot) => slot.date === date),
      }));
      setFilteredSlots(filtered);
    }
  };

  if (loading)
    return (
      <div className="text-center py-6 text-red-600 animate-pulse">
        Loading blocked slots...
      </div>
    );

  if (blockedSlots.length === 0)
    return (
      <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg shadow-inner">
        <div className="flex justify-center mb-2">
          <CalendarX2 className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-lg font-medium">No blocked slots found</p>
        <p className="text-sm">
          You're all clear! No time blocks are currently scheduled.
        </p>
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
        ⛔ Blocked Slots by Quarter
      </h2>

      <div className="mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-red-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          onClick={() => {
            setSelectedDate("");
            setFilteredSlots(blockedSlots);
          }}
          className="ml-auto text-sm text-red-600 hover:underline"
        >
          Clear Filter
        </button>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {filteredSlots.map((quarter) =>
          quarter.slots.length === 0 ? null : (
            <div
              key={quarter.quarterName}
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center gap-2 mb-3">
                <Square className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                  Quarter: {quarter.quarterName}
                </h3>
              </div>

              <div className="space-y-3">
                {quarter.slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Date:</span>
                      <span>{slot.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Ban className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Reason:</span>
                      <span>{slot.reason || "N/A"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
