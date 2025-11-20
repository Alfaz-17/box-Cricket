import React, { useEffect, useState } from 'react'
import { Calendar, Clock, UserRound, CalendarX2, Square, Filter } from 'lucide-react'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'

export default function BookedSlots({ boxId }) {
  const [bookedSlots, setBookedSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')

  //fetch Booked solts api
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await api.get(`/slots/booked-blocked-slots/${boxId}`)
        setBookedSlots(res.data.bookedSlots || [])
        setFilteredSlots(res.data.bookedSlots || [])
      } catch (error) {
        console.error('Failed to fetch booked slots:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [boxId])

  // Extract unique quarters from booked slots
  const uniqueQuarters = [...new Set(bookedSlots.map(q => q.quarterName))]

  // add filter
  const handleQuarterChange = e => {
    const quarter = e.target.value
    setSelectedQuarter(quarter)

    const filtered = bookedSlots
      .filter(q => quarter === '' || q.quarterName === quarter)
      .map(q => ({
        ...q,
        slots: selectedDate ? q.slots.filter(slot => slot.date === selectedDate) : q.slots,
      }))

    setFilteredSlots(filtered)
  }

  const handleDateChange = e => {
    const date = e.target.value
    setSelectedDate(date)

    const filtered = bookedSlots
      .filter(q => selectedQuarter === '' || q.quarterName === selectedQuarter)
      .map(q => ({
        ...q,
        slots: date ? q.slots.filter(slot => slot.date === date) : q.slots,
      }))

    setFilteredSlots(filtered)
  }

  // Filter out quarters with no slots after applying date filter
  const noFilteredResults = filteredSlots.every(q => q.slots.length === 0)

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )

  if (bookedSlots.length === 0)
    return (
      <div className="text-center  bg-base-300 p-6 rounded-lg shadow-inner">
        <div className="flex justify-center mb-2">
          <CalendarX2 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg font-medium">No upcoming booked slots</p>
        <p className="text-sm">There are currently no bookings scheduled for this box.</p>
      </div>
    )

  return (
    <div className="bg-base-300 rounded-xl shadow-md p-6">
      <h2
        style={{ fontFamily: 'Bebas Neue' }}
        className="text-2xl font-bold  mb-4 flex items-center gap-2"
      >
        📅 Booked Slots by Boxes
      </h2>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-primary" />

        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border rounded-lg px-3 py-1 text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <select
          value={selectedQuarter}
          onChange={handleQuarterChange}
          className="border rounded-lg px-3 py-1 text-sm  bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Boxes</option>
          {uniqueQuarters.map(qtr => (
            <option key={qtr} value={qtr}>
              {qtr}-box
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedDate('')
            setSelectedQuarter('')
            setFilteredSlots(bookedSlots)
          }}
          className="ml-auto text-sm text-green-600 hover:underline"
        >
          Clear Filter
        </button>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {filteredSlots.map(quarter =>
          quarter.slots.length === 0 ? null : (
            <div
              key={quarter.quarterName}
              className="border border-base-100  rounded-lg p-4 bg-base-100 "
            >
              <div className="flex items-center gap-2 mb-3">
                <Square className="w-5 h-5  text-primary" />
                <h3
                  style={{ fontFamily: 'Bebas Neue' }}
                  className="text-lg font-semibold text-primary"
                >
                  Boxes:{quarter.quarterName}-(box)
                </h3>
              </div>

              <div className="space-y-3">
                {quarter.slots.map(slot => (
                  <div
                    key={slot._id}
                    className="border border-base-100 dark:border-gray-600 rounded-lg p-3 bg-base-300 hover:bg-base-100  shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1 ">
                      <UserRound className="w-4 h-4 text-primary" />
                      <span className="font-medium">User:</span>
                      <span>{slot.user}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(slot.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
      {noFilteredResults && (
        <div className="text-center text-primary bg-base-100 p-4 rounded-md shadow">
          <p className="font-medium">No booked slots found for selected filter(s).</p>
        </div>
      )}
    </div>
  )
}
