import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Trash2, MapPin, IndianRupee, ChevronDown, ChevronUp, Box as BoxIcon, Info } from 'lucide-react'
import api from '../../utils/api'
import useBoxStore from '../../store/boxStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

const BoxManagement = () => {
  const [showDeleteInput, setShowDeleteInput] = useState(false)
  const [selectedBoxId, setSelectedBoxId] = useState(null)
  const [ownerCode, setOwnerCode] = useState('')
  const [expandedBox, setExpandedBox] = useState(null)

  const { boxes, loading, fetchBoxes } = useBoxStore()

  useEffect(() => {
    fetchBoxes()
  }, [])

  const handleDelete = async () => {
    if (!ownerCode) {
      toast.error('Owner code is required')
      return
    }

    if (!confirm('Are you sure you want to delete this box?')) return

    try {
      await api.delete(`/boxes/delete/${selectedBoxId}`, {
        data: { ownerCode },
      })

      toast.success('Box deleted successfully')
      setShowDeleteInput(false)
      setSelectedBoxId(null)
      setOwnerCode('')
      fetchBoxes()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete box')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <BoxIcon className="text-primary w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Box <span className="text-primary">Management</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Configure and manage your cricket facility inventory</p>
        </div>
        <Link to="/admin/boxes/create" className="w-full sm:w-auto">
          <Button className="gap-2 w-full h-11 font-bold uppercase tracking-wider text-xs">
            <Plus size={16} /> Add New Box
          </Button>
        </Link>
      </div>

      {/* Box Inventory List */}
      <div className="grid grid-cols-1 gap-4">
        {boxes.length > 0 ? (
          boxes.map(box => (
            <div
              key={box._id}
              className="bg-card rounded-lg border border-border shadow-sm overflow-hidden group hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Visual Representation */}
                <div className="lg:w-72 h-48 lg:h-auto relative bg-muted">
                  <img
                    src={box.image || 'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                    alt={box.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-border">
                      ID: {box._id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Information Area */}
                <div className="flex-1 p-6 lg:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">{box.name}</h2>
                      <div className="flex items-center text-muted-foreground text-sm font-medium">
                        <MapPin size={14} className="mr-1.5 text-primary/60" />
                        {box.location || 'Location not specified'}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end">
                      <div className="flex items-baseline gap-1 text-primary">
                        <span className="text-sm font-bold">₹</span>
                        <span className="text-3xl font-bold tracking-tighter">{box.hourlyRate}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">/ hour</span>
                      </div>
                      {box.weekendHourlyRate && (
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                          Weekend: ₹{box.weekendHourlyRate}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {box.description || 'No description available for this box.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setExpandedBox(expandedBox === box._id ? null : box._id)}
                        className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider hover:underline"
                      >
                        {expandedBox === box._id ? (
                          <>
                            <ChevronUp size={14} /> Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> View Technical Specs
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/admin/boxes/edit/${box._id}`}>
                        <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase tracking-wider text-[10px] border-border hover:bg-muted">
                          <Edit size={14} /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBoxId(box._id)
                          setShowDeleteInput(true)
                          setOwnerCode('')
                        }}
                        className="h-9 gap-2 font-bold uppercase tracking-wider text-[10px] text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 size={14} /> Terminate
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedBox === box._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                          <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Facility Matrix</h4>
                            <div className="space-y-2">
                              {box.features ? (
                                <div className="text-sm font-medium text-foreground">
                                  {box.features.split(',').map((f, i) => (
                                    <span key={i} className="inline-block bg-background border border-border px-2 py-0.5 rounded mr-1.5 mb-1.5 text-[10px]">
                                      {f.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No specialized specs logged.</p>
                              )}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Unit Configuration</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">Internal Sub-units</span>
                              <span className="text-xl font-bold text-foreground">{box.numberOfQuarters || 0}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-medium text-muted-foreground">Operational Status</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Active</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dangerous Action: Terminate Confirmation */}
                  <AnimatePresence>
                    {showDeleteInput && selectedBoxId === box._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-6 bg-destructive/5 border border-destructive/20 rounded-lg space-y-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <Trash2 size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-destructive uppercase tracking-wider">Termination Sequence</h3>
                            <p className="text-xs text-muted-foreground">Enter owner code to confirm permanent removal.</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Input
                            type="password"
                            value={ownerCode}
                            onChange={e => setOwnerCode(e.target.value)}
                            className="h-10 border-destructive/30 focus-visible:ring-destructive/30 flex-1"
                            placeholder="Enter administrative code"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setShowDeleteInput(false)
                                setSelectedBoxId(null)
                                setOwnerCode('')
                              }}
                              className="h-10 px-4 font-bold uppercase tracking-wider text-xs"
                            >
                              Abort
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDelete}
                              className="h-10 px-6 font-bold uppercase tracking-wider text-xs"
                            >
                              Execute Removal
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-xl bg-muted/5">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
              <BoxIcon className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Inventory Records</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Start by adding your first cricket box to the system.</p>
            <Link to="/admin/boxes/create" className="mt-8 inline-block">
              <Button className="gap-2">
                <Plus size={18} /> Add Your First Box
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default BoxManagement
