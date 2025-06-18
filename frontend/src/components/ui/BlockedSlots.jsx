import React, { useEffect, useState } from "react";
import { Calendar, Clock, Ban, Square, Filter, CalendarX2 } from "lucide-react";
import api from "../../utils/api";
import { formatDate } from "../../utils/formatDate";

export default function BlockedSlots({ boxId }) {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");



// fetch block slots
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


//add filter for BlockSlots (date,quater)
  const filterSlots = (date, quarter) => {
    let filtered = blockedSlots;

    if (quarter !== "") {
      filtered = filtered.filter((q) => q.quarterName === quarter);
    }

    filtered = filtered.map((q) => ({
      ...q,
      slots:
        date === "" ? q.slots : q.slots.filter((slot) => slot.date === date),
    }));

    setFilteredSlots(filtered);
  };
  
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    filterSlots(date, selectedQuarter);
  };

  const handleQuarterChange = (e) => {
    const quarter = e.target.value;
    setSelectedQuarter(quarter);
    filterSlots(selectedDate, quarter);
  };

  // Extract unique quarters from blocked slots
  const noFilteredResults = filteredSlots.every((q) => q.slots.length === 0);



  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  if (blockedSlots.length === 0)
    return (
      <div className="text-center  bg-base-300 p-6 rounded-lg shadow-inner">
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
    <div className="bg-base-300  rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
        ⛔ Blocked Slots by Boxes
      </h2>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded-lg px-3 py-1 text-[16px]  text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={selectedQuarter}
          onChange={handleQuarterChange}
          className="border rounded-lg px-3 py-1 text-sm  bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Boxes</option>
          {[...new Set(blockedSlots.map((q) => q.quarterName))].map((name) => (
            <option key={name} value={name}>
              {name}-(box)
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedDate("");
            setSelectedQuarter("");
            setFilteredSlots(blockedSlots);
          }}
          className="ml-auto text-sm  hover:underline"
        >
          Clear Filter
        </button>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {filteredSlots.map((quarter) =>
          quarter.slots.length === 0 ? null : (
            <div
              key={quarter.quarterName}
              className="border border-base-100  rounded-lg p-4 bg-base-100 "
            >
              <div className="flex items-center gap-2 mb-3">
                <Square className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-primary ">
                  Boxes: {quarter.quarterName}-(box)
                </h3>
              </div>

              <div className="space-y-3">
                {quarter.slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="border border-base-100 text-base-content rounded-lg p-3 bg-base-300 hover:bg-gray-500  shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1  ">
                      <Calendar className="w-4 h-4 text-red-500  " />
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(slot.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1 ">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2  ">
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

      {noFilteredResults && (
        <div className="text-center  bg-base-100  p-4 rounded-md shadow mb-4">
          <p className="text-lg font-semibold">
            No blocked slots found for selected date.
          </p>
          <p className="text-sm">
            Try choosing a different date or clear the filter.
          </p>
        </div>
      )}
    </div>
  );
}
