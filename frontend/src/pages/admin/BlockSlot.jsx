import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar as CalendarIcon, Clock, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TimePicker from '../../components/ui/TimePicker'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

const BlockSlot = () => {
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [blockedSlots, setBlockedSlots] = useState([])
  const [boxes, setBoxes] = useState([])
  const [selectedBoxId, setSelectedBoxId] = useState(null)
  const [selectedQuarter, setSelectedQuarter] = useState('')
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

        if (firstBox.quarters && firstBox.quarters.length > 0) {
          setSelectedQuarter(firstBox.quarters[0].name || firstBox.quarters[0])
        } else {
          setSelectedQuarter('')
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
    } catch (error) {
      toast.error('Failed to fetch blocked slots')
      console.log('Error fetching slots:', error)
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBoxChange = value => {
    const boxId = value
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
        quarterName: selectedQuarter,
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-display tracking-tight">
          Block Time Slots
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Prevent bookings for specific times due to maintenance or other reasons.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Block Form Section */}
        <div className="space-y-6">
          <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🚫</span>
              <h2 className="text-2xl font-bold text-primary font-display tracking-tight">
                Block New Slot
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>🏏</span> Select Box
                </Label>
                <Select value={selectedBoxId || ''} onValueChange={handleBoxChange}>
                  <SelectTrigger className="bg-muted/30 border-primary/20">
                    <SelectValue placeholder="Select a box" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxes.map(box => (
                      <SelectItem key={box._id} value={box._id}>
                        {box.name || `Box ${box._id.slice(-4)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>📍</span> Select Quarter
                </Label>
                <Select 
                  value={selectedQuarter || ''} 
                  onValueChange={setSelectedQuarter}
                  disabled={!selectedBoxId || !boxes.find(b => b._id === selectedBoxId)?.quarters?.length}
                >
                  <SelectTrigger className="bg-muted/30 border-primary/20">
                    <SelectValue placeholder="Select a quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxes
                      .find(b => b._id === selectedBoxId)
                      ?.quarters?.map((quarter, idx) => (
                        <SelectItem key={idx} value={quarter.name || quarter}>
                          {quarter.name || quarter}
                        </SelectItem>
                      )) || <SelectItem value="none" disabled>No quarters available</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>📅</span> Date
                </Label>
                <div className="relative">
                  <DatePicker
                    selected={formData.date}
                    onChange={date => setFormData(prev => ({ ...prev, date }))}
                    minDate={new Date()}
                    className="flex h-10 w-full rounded-md border border-primary/20 bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                    dateFormat="MMMM d, yyyy"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>⏰</span> Start Time
                  </Label>
                  <div className="relative">
                    <TimePicker
                      value={formData.startTime}
                      onChange={val => setFormData(prev => ({ ...prev, startTime: val }))}
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>⏰</span> End Time
                  </Label>
                  <div className="relative">
                    <TimePicker
                      value={formData.endTime}
                      onChange={val => setFormData(prev => ({ ...prev, endTime: val }))}
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>📝</span> Reason
                </Label>
                <Textarea
                  rows="3"
                  placeholder="e.g. Turf Maintenance, Private Event"
                  value={formData.reason}
                  onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  className="bg-muted/30 border-primary/20 resize-none"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Block Time Slot'}
              </Button>
            </form>
          </div>
        </div>

        {/* Blocked Slots List Section */}
        <div className="space-y-6">
          <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✅</span>
              <h2 className="text-2xl font-bold text-primary font-display tracking-tight">
                Active Blocks
              </h2>
            </div>

            {selectedBoxId && (
              <div className="mb-6">
                <Label className="mb-2 block">Filter by Quarter</Label>
                <Select value={selectedFilterQuarter} onValueChange={setSelectedFilterQuarter}>
                  <SelectTrigger className="bg-muted/30 border-primary/20">
                    <SelectValue placeholder="Filter by quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    {boxes
                      .find(b => b._id === selectedBoxId)
                      ?.quarters?.map((quarter, idx) => (
                        <SelectItem key={idx} value={quarter.name || quarter}>
                          {quarter.name || quarter}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {slotsLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : blockedSlots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-primary/10 rounded-xl">
                <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No blocked slots found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {blockedSlots
                  .filter(
                    slotGroup =>
                      selectedFilterQuarter === 'all' ||
                      slotGroup.quarterName === selectedFilterQuarter
                  )
                  .map(slotGroup => (
                    <div key={slotGroup._id} className="bg-muted/20 border border-primary/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-primary border-b border-primary/5 pb-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        BOX: {slotGroup.quarterName}
                      </div>
                      <div className="space-y-3">
                        {slotGroup.slots.map((timeSlot, idx) => (
                          <div
                            key={idx}
                            className="bg-background/50 border border-primary/10 rounded-lg p-3 active:border-primary/30 md:hover:border-primary/30 transition-colors flex justify-between items-start gap-3"
                          >
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2">
                                <CalendarIcon size={14} className="text-muted-foreground" />
                                <span className="font-medium">{formatDate(timeSlot.date)}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <Clock size={14} className="text-muted-foreground" />
                                <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
                              </p>
                              <p className="text-xs text-muted-foreground italic mt-1">
                                "{timeSlot.reason || 'No reason provided'}"
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0 shrink-0 rounded-full"
                              onClick={() => handleUnblock(timeSlot._id)}
                              title="Unblock Slot"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockSlot
