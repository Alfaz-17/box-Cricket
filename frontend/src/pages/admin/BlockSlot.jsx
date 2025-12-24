import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Calendar as CalendarIcon, Clock, Trash2, ShieldAlert, CheckCircle2, Box as BoxIcon, MapPin, FileText, Layout, X } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TimePicker from '../../components/ui/TimePicker'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatDate'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Label } from '../../components/ui/Label'
import { Textarea } from '../../components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldAlert className="text-primary w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Operational <span className="text-primary">Locks</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Manage facility availability by blocking specific time windows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Block Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                <Layout size={18} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Configuration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Facility Unit</Label>
                <div className="relative">
                  <BoxIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Select value={selectedBoxId || ''} onValueChange={handleBoxChange}>
                    <SelectTrigger className="pl-10 h-11 border-border bg-muted/20">
                      <SelectValue placeholder="Select a Box" />
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
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Specific Quarter</Label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Select 
                    value={selectedQuarter || ''} 
                    onValueChange={setSelectedQuarter}
                    disabled={!selectedBoxId || !boxes.find(b => b._id === selectedBoxId)?.quarters?.length}
                  >
                    <SelectTrigger className="pl-10 h-11 border-border bg-muted/20">
                      <SelectValue placeholder="Select a Sub-unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {boxes
                        .find(b => b._id === selectedBoxId)
                        ?.quarters?.map((quarter, idx) => (
                          <SelectItem key={idx} value={quarter.name || quarter}>
                            {quarter.name || quarter}
                          </SelectItem>
                        )) || <SelectItem value="none" disabled>No units available</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Lock Date</Label>
                <div className="relative">
                  <DatePicker
                    selected={formData.date}
                    onChange={date => setFormData(prev => ({ ...prev, date }))}
                    minDate={new Date()}
                    className="flex h-11 w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 pl-10 transition-all"
                    dateFormat="MMMM d, yyyy"
                  />
                  <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Start Window</Label>
                  <div className="relative">
                    <TimePicker
                      value={formData.startTime}
                      onChange={val => setFormData(prev => ({ ...prev, startTime: val }))}
                    />
                    <Clock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">End Window</Label>
                  <div className="relative">
                    <TimePicker
                      value={formData.endTime}
                      onChange={val => setFormData(prev => ({ ...prev, endTime: val }))}
                    />
                    <Clock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Reason for Lockout</Label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3 text-muted-foreground z-10" />
                  <Textarea
                    rows="3"
                    placeholder="Describe maintenance or reason..."
                    value={formData.reason}
                    onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    className="pl-10 h-24 border-border bg-muted/20 resize-none pt-2.5"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 font-bold uppercase tracking-wider" disabled={loading}>
                {loading ? 'Processing...' : 'Execute Window Lock'}
              </Button>
            </form>
          </div>
        </div>

        {/* Blocked Slots List Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <ShieldAlert size={18} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Active Locks</h2>
              </div>

              {selectedBoxId && (
                <div className="w-48">
                  <Select value={selectedFilterQuarter} onValueChange={setSelectedFilterQuarter}>
                    <SelectTrigger className="h-9 text-[10px] font-bold uppercase tracking-wider border-border bg-muted/20">
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
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
            </div>

            {slotsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-30">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-xs font-bold uppercase tracking-widest">Scanning inventory...</p>
              </div>
            ) : blockedSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-6 border border-border opacity-30">
                  <ShieldAlert size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No Active Constraints</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Facility is currently fully operational across all time windows.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {blockedSlots
                  .filter(
                    slotGroup =>
                      selectedFilterQuarter === 'all' ||
                      slotGroup.quarterName === selectedFilterQuarter
                  )
                  .map(slotGroup => (
                    <div key={slotGroup._id} className="space-y-3">
                      <div className="flex items-center gap-3 px-1">
                        <div className="h-4 w-1 bg-primary rounded-full"></div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                          {slotGroup.quarterName}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {slotGroup.slots.map((timeSlot, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-start gap-6 hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-3 flex-1">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                  <CalendarIcon size={14} className="text-primary" />
                                  {formatDate(timeSlot.date)}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                  <Clock size={14} className="text-primary" />
                                  {timeSlot.startTime} - {timeSlot.endTime}
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed leading-tight bg-background/50 p-2 rounded border border-border/50">
                                <FileText size={14} className="mt-0.5 shrink-0 opacity-40" />
                                <span className="text-xs italic">"{timeSlot.reason || 'No specific reason logged'}"</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 border border-border/50"
                              onClick={() => handleUnblock(timeSlot._id)}
                            >
                              <X size={16} />
                            </Button>
                          </motion.div>
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
