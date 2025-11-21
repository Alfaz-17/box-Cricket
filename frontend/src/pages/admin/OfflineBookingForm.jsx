import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import useBoxStore from '../../store/boxStore'
import TimePicker from '../../components/ui/TimePicker'
import { Clock, Calendar, User, Phone, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

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
    <div className="mt-10 pt-6">
      <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 pb-6">
          <CardTitle style={{ fontFamily: 'Bebas Neue' }} className="text-3xl text-primary tracking-wide">
            Create Offline Booking
          </CardTitle>
          <CardDescription>
            Manually add a booking for walk-in customers or phone reservations.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleOfflineBooking}
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Box Selector */}
            <div className="space-y-2">
              <Label>Select Box</Label>
              <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
                <SelectTrigger className="bg-muted/30 border-primary/20">
                  <SelectValue placeholder="Choose box" />
                </SelectTrigger>
                <SelectContent>
                  {boxes.map(box => (
                    <SelectItem key={box._id} value={box._id}>
                      {box.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quarter Selector */}
            <div className="space-y-2">
              <Label>Select Quarter</Label>
              <Select 
                value={form.quarterId} 
                onValueChange={(val) => setForm(prev => ({ ...prev, quarterId: val }))}
                disabled={!selectedBoxId}
              >
                <SelectTrigger className="bg-muted/30 border-primary/20">
                  <SelectValue placeholder="Choose quarter" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuarters.map(q => (
                    <SelectItem key={q._id} value={q._id}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="bg-muted/30 border-primary/20 pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="relative">
                <TimePicker
                  value={form.startTime}
                  onChange={val => setForm(prev => ({ ...prev, startTime: val }))}
                />
                <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (hours)</Label>
              <div className="relative">
                <Input
                  type="number"
                  name="duration"
                  min={1}
                  value={form.duration}
                  onChange={handleChange}
                  required
                  className="bg-muted/30 border-primary/20 pl-10"
                />
                <Timer className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <div className="relative">
                <Input
                  type="tel"
                  name="contactNumber"
                  pattern="\d{10}"
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                  placeholder="10-digit number"
                  className="bg-muted/30 border-primary/20 pl-10"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label>Booking Name</Label>
              <div className="relative">
                <Input
                  type="text"
                  name="user"
                  value={form.user}
                  onChange={handleChange}
                  required
                  placeholder="Customer Name"
                  className="bg-muted/30 border-primary/20 pl-10"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 lg:col-span-3 pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto min-w-[200px]"
                disabled={loading || !selectedBoxId}
              >
                {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Add Offline Booking'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
