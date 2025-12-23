import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Trash2, MapPin, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'
import useBoxStore from '../../store/boxStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight font-display">
            Box Management
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage your cricket boxes and facilities.</p>
        </div>
        <Link to="/admin/boxes/create">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus size={20} /> Add New Box
          </Button>
        </Link>
      </div>

      <div className="space-y-0">
        {boxes.map(box => (
          <div
            key={box._id}
            className="border-b border-primary/10 last:border-b-0 active:bg-muted/20 md:hover:bg-muted/10 transition-colors"
          >
            {/* Box Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  box.image ||
                  'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                }
                alt={box.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Action buttons - always visible */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Link to={`/admin/boxes/edit/${box._id}`}>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 active:bg-white md:hover:bg-white text-black">
                    <Edit size={14} />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setSelectedBoxId(box._id)
                    setShowDeleteInput(true)
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-2xl font-bold text-white mb-1 truncate font-display tracking-tight">
                    {box.name}
                </h2>
                <div className="flex items-center text-white/80 text-xs">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate">{box.location || 'Location not set'}</span>
                </div>
              </div>
            </div>

            {/* Box Details */}
            <div className="p-4 md:p-6 space-y-3">
              {/* Price & Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🏏</span>
                  <span>Cricket Box</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center font-bold text-lg md:text-xl text-primary">
                    <IndianRupee size={18} className="mr-1" />
                    {box.hourlyRate}/hr
                  </div>
                  {box.weekendHourlyRate && (
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                      Weekend: ₹{box.weekendHourlyRate}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {box.description || 'No description provided.'}
              </p>

              {/* Toggle Details Button */}
              <button
                onClick={() => setExpandedBox(expandedBox === box._id ? null : box._id)}
                className="flex items-center gap-2 text-sm text-primary active:text-primary/80 md:hover:text-primary/80 transition-colors"
              >
                {expandedBox === box._id ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Hide Details</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>View Details</span>
                  </>
                )}
              </button>

              {/* Expanded Details */}
              {expandedBox === box._id && (
                <div className="mt-4 pt-4 border-t border-primary/10 space-y-3 text-sm">
                  {box.features && (
                    <div>
                      <span className="text-muted-foreground font-medium">Features:</span>
                      <p className="mt-1">{box.features}</p>
                    </div>
                  )}
                  {box.numberOfQuarters && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Quarters:</span>
                      <span className="font-medium">{box.numberOfQuarters}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Confirmation */}
              {showDeleteInput && selectedBoxId === box._id && (
                <div className="mt-4 p-4 border border-destructive/50 bg-destructive/5 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-sm font-medium text-destructive block">
                    Confirm deletion with Owner Code:
                  </label>
                  <Input
                    type="password"
                    value={ownerCode}
                    onChange={e => setOwnerCode(e.target.value)}
                    className="h-9 border-destructive/30 focus-visible:ring-destructive/30"
                    placeholder="Enter code"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            setShowDeleteInput(false)
                            setOwnerCode('')
                        }}
                        className="h-8"
                    >
                      Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDelete}
                        className="h-8"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BoxManagement
