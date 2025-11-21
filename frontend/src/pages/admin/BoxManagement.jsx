import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Trash2, Box as BoxIcon, MapPin, IndianRupee } from 'lucide-react'
import api from '../../utils/api'
import useBoxStore from '../../store/boxStore'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const BoxManagement = () => {
  const [showDeleteInput, setShowDeleteInput] = useState(false)
  const [selectedBoxId, setSelectedBoxId] = useState(null)
  const [ownerCode, setOwnerCode] = useState('')

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
    <div className="min-h-screen bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary tracking-wide">
            Box Management
            </h1>
            <p className="text-muted-foreground">Manage your cricket boxes and facilities.</p>
        </div>
        <Link to="/admin/boxes/create">
          <Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
            <Plus size={20} /> Add New Box
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map(box => (
          <Card key={box._id} className="group overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  box.image ||
                  'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                }
                alt={box.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
                <Link to={`/admin/boxes/edit/${box._id}`}>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-black">
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
                <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold text-white mb-1 truncate">
                    {box.name}
                </h2>
                <div className="flex items-center text-white/80 text-xs">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate">{box.location || 'Location not set'}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                    <BoxIcon size={12} className="mr-1" /> Cricket Box
                </Badge>
                <div className="flex items-center font-bold text-lg text-primary">
                  <IndianRupee size={16} className="mr-1" />
                  {box.hourlyRate}/hr
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                {box.description || 'No description provided.'}
              </p>

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BoxManagement
