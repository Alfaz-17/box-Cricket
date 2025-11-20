import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import useBoxStore from '../../store/boxStore'
import TimePicker from '../../components/ui/TimePicker'
import { Clock } from 'lucide-react'

export default function OfflineBookingForm() {
  const { boxes, fetchBoxes } = useBoxStore()
  const [loading, setLoading] = useState(false)
  const [selectedBoxId, setSelectedBoxId] = useState('')
  const [availableQuarters, setAvailableQuarters] = useState([])

  const [form, setForm] = useState({
    boxId: '',
    quarterId: '',
    date: '',
    startTime: '',
    duration: 1,
    contactNumber: '',
    user: '',
  })

  useEffect(() => {
    fetchBoxes()
  }, [])
  // update quarters when box is selected
  useEffect(() => {
    const box = boxes.find(b => b._id === selectedBoxId)
    if (box) {
      setAvailableQuarters(box.quarters || [])
      setForm(prev => ({
        ...prev,
        boxId: box._id,
        quarterId: box.quarters?.[0]?._id || '',
      }))
    } else {
      setAvailableQuarters([])
      setForm(prev => ({
        ...prev,
        boxId: '',
        quarterId: '',
      }))
    }
  }, [selectedBoxId])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleOfflineBooking = async e => {
    e.preventDefault()

    const data = {
      ...form,
      method: 'offline',
      isOffline: true,
    }

    try {
      setLoading(true)
      await api.post('/booking/temporary-booking', data)
      toast.success('Offline booking added!')

      setForm({
        boxId: '',
        quarterId: '',
        date: '',
        startTime: '',
        duration: 1,
        contactNumber: '',
        user: '',
      })
      setSelectedBoxId('')
    } catch (err) {
      console.error('Booking error:', err)
      toast.error(err?.response?.data?.message || 'Booking failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t mt-10 pt-6">
      <h2 className="text-2xl font-bold  mb-4" style={{ fontFamily: 'Bebas Neue' }}>
        Create Offline Booking
      </h2>

      <form
        onSubmit={handleOfflineBooking}
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Box Selector */}
        <div>
          <label className="label text-primary font-semibold">Select Box</label>
          <select
            name="selectedBox"
            className="select select-bordered  w-full"
            required
            value={selectedBoxId}
            onChange={e => setSelectedBoxId(e.target.value)}
          >
            <option value="">Choose box</option>
            {boxes.map(box => (
              <option key={box._id} value={box._id}>
                {box.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quarter Selector */}
        <div>
          <label className="label text-primary font-semibold">Select Quarter</label>
          <select
            name="quarterId"
            className="select select-bordered text-[16px] w-full"
            required
            value={form.quarterId}
            onChange={handleChange}
            disabled={!selectedBoxId}
          >
            <option value="">Choose quarter</option>
            {availableQuarters.map(q => (
              <option key={q._id} value={q._id}>
                {q.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label  text-primary font-semibold">Date</label>
          <input
            type="date"
            name="date"
            className="input input-bordered  text-[16px] w-full"
            required
            value={form.date}
            onChange={handleChange}
          />
        </div>

        {/* Start Time */}
        {/* Time Pickers */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-[16px] text-primary">Start Time</span>
          </label>
          <div className="relative">
            <TimePicker
              value={form.startTime}
              onChange={val => setForm(prev => ({ ...prev, startTime: val }))}
            />

            <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="label font-semibold text-primary">Duration (hours)</label>
          <input
            type="number"
            name="duration"
            min={1}
            className="input input-bordered text-[16px] w-full"
            required
            value={form.duration}
            onChange={handleChange}
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="label text-primary font-semibold">Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            pattern="\d{10}"
            className="input input-bordered text-[16px] w-full"
            required
            value={form.contactNumber}
            onChange={handleChange}
          />
        </div>

        {/* Customer Name */}
        <div>
          <label className="label text-primary font-semibold">Booking Name</label>
          <input
            type="text"
            name="user"
            className="input input-bordered text-[16px] w-full"
            required
            value={form.user}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !selectedBoxId}
          >
            {loading ? 'Booking...' : 'Add Offline Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
