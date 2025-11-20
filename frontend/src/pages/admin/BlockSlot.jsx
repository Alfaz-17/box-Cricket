import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TimePicker from '../../components/ui/TimePicker'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'

const BlockSlot = () => {
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [blockedSlots, setBlockedSlots] = useState([])
  const [boxes, setBoxes] = useState([])
  const [selectedBoxId, setSelectedBoxId] = useState(null)
  const [selectedQuarter, setSelectedQuarter] = useState('') // NEW quarter state
  const [selectedFilterQuarter, setSelectedFilterQuarter] = useState('all')

  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: '',
    endTime: '',
    reason: '',
  })

  useEffect(() => {
    fetchBoxes()
  }, [])

  const fetchBoxes = async () => {
    try {
      const response = await api.get('/boxes/my-box')
      const data = response.data
      setBoxes(data.boxes)

      if (data.boxes.length > 0) {
        const firstBox = data.boxes[0]
        setSelectedBoxId(firstBox._id)

        // Set default selectedQuarter from first box's quarters if available
        if (firstBox.quarters && firstBox.quarters.length > 0) {
          setSelectedQuarter(firstBox.quarters[0].name || firstBox.quarters[0])
        } else {
          setSelectedQuarter('') // No quarters available
        }

        fetchBlockedSlots(firstBox._id)
      } else {
        toast.error('No boxes found')
      }
    } catch (error) {
      toast.error('Failed to fetch boxes')
      console.error('Error fetching boxes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockedSlots = async boxId => {
    if (!boxId) return
    setSlotsLoading(true)
    try {
      const res = await api.get(`/slots/booked-blocked-slots/${boxId}`)
      setBlockedSlots(res.data.blockedSlots || [])
      console.log(res.data)
    } catch (error) {
      toast.error('Failed to fetch blocked slots')
      console.log('Error fetching slots:', error)
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBoxChange = e => {
    const boxId = e.target.value
    setSelectedBoxId(boxId)

    const box = boxes.find(b => b._id === boxId)
    if (box && box.quarters && box.quarters.length > 0) {
      setSelectedQuarter(box.quarters[0].name || box.quarters[0])
    } else {
      setSelectedQuarter('')
    }

    fetchBlockedSlots(boxId)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    if (!selectedQuarter) {
      toast.error('Please select a quarter')
      setLoading(false)
      return
    }

    const formattedDate = formData.date.toISOString().split('T')[0]

    try {
      const response = await api.post('/slots/block-slots', {
        date: formattedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        boxId: selectedBoxId,
        quarterName: selectedQuarter, // IMPORTANT: send quarterName
      })

      toast.success(response.data.message || 'Time slot blocked successfully')
      fetchBlockedSlots(selectedBoxId)

      setFormData({ date: new Date(), startTime: '', endTime: '', reason: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to block slot')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async slotId => {
    try {
      await api.delete(`/slots/unblock/${slotId}`)
      toast.success('Slot unblocked successfully')
      fetchBlockedSlots(selectedBoxId)
    } catch (error) {
      toast.error('Failed to unblock slot')
      console.log(error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Block a Time Slot Form */}
      <div className="card bg-base-300 shadow-md">
        <div className="card-body">
          <h2 style={{ fontFamily: 'Bebas Neue' }} className="card-title text-2xl">
            Block a Time Slot
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Box */}
            <div className="form-control">
              <label className="label">
                <span className="text-primary">Select Box</span>
              </label>
              <select
                className="select select-bordered w-full"
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

            {/* Select Quarter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary">Select Quarter</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedQuarter || ''}
                onChange={e => setSelectedQuarter(e.target.value)}
                required
                disabled={
                  !selectedBoxId || !boxes.find(b => b._id === selectedBoxId)?.quarters?.length
                }
              >
                {boxes
                  .find(b => b._id === selectedBoxId)
                  ?.quarters?.map((quarter, idx) => (
                    <option key={idx} value={quarter.name || quarter}>
                      {quarter.name || quarter}
                    </option>
                  )) || <option value="">No quarters available</option>}
              </select>
            </div>

            {/* Date Picker */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary">Date</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.date}
                  onChange={date => setFormData(prev => ({ ...prev, date }))}
                  minDate={new Date()}
                  className="input input-bordered w-full pr-10"
                  dateFormat="MMMM d, yyyy"
                />
                <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-primary">Start Time</span>
                </label>
                <div className="relative">
                  <TimePicker
                    value={formData.startTime}
                    onChange={val => setFormData(prev => ({ ...prev, startTime: val }))}
                  />
                  <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-primary">End Time</span>
                </label>
                <div className="relative">
                  <TimePicker
                    value={formData.endTime}
                    onChange={val => setFormData(prev => ({ ...prev, endTime: val }))}
                  />
                  <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary">Reason</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Enter reason for blocking"
                value={formData.reason}
                onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success w-full" disabled={loading}>
              {loading ? 'Blocking...' : 'Block Time Slot'}
            </button>
          </form>
        </div>
      </div>

      {/* Blocked Slots Card */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 style={{ fontFamily: 'Bebas Neue' }} className="card-title text-lg">
            Blocked Slots
          </h2>

          {/* Filter Quarters */}
          {selectedBoxId && (
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-primary">Filter Blocked Slots by Quarter</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedFilterQuarter || 'all'}
                onChange={e => setSelectedFilterQuarter(e.target.value)}
              >
                <option value="all">All Quarters</option>
                {boxes
                  .find(b => b._id === selectedBoxId)
                  ?.quarters?.map((quarter, idx) => (
                    <option key={idx} value={quarter.name || quarter}>
                      {quarter.name || quarter}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Blocked Slots */}
          {slotsLoading ? (
            <p className="text-center ">Loading blocked slots...</p>
          ) : blockedSlots.length === 0 ? (
            <p className="text-center ">No blocked slots found.</p>
          ) : (
            <ul className="space-y-4">
              {blockedSlots
                .filter(
                  slotGroup =>
                    selectedFilterQuarter === 'all' ||
                    slotGroup.quarterName === selectedFilterQuarter
                )
                .map(slotGroup => (
                  <li key={slotGroup._id} className="bg-base-300  text rounded-box p-4 space-y-2">
                    <p className="font-semibold text-primary">BOX: {slotGroup.quarterName}</p>
                    <div className="pl-4 space-y-3 ">
                      {slotGroup.slots.map((timeSlot, idx) => (
                        <div
                          key={idx}
                          className="bg-base-100 border border-base-100 rounded-box p-3"
                        >
                          <p>
                            <span className="font-medium">Time:</span> {timeSlot.startTime} -{' '}
                            {timeSlot.endTime}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span> {formatDate(timeSlot.date)}
                          </p>
                          <p className="text-sm opacity-70">
                            <span className="font-medium">Reason:</span> {timeSlot.reason || 'N/A'}
                          </p>
                          <button
                            onClick={() => handleUnblock(timeSlot._id)}
                            className="btn btn-sm btn-error mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlockSlot
