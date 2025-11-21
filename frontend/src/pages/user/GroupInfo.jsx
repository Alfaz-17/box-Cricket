import { useEffect, useState, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import AuthContext from '../../context/AuthContext'
import { ArrowLeft, Trash2, LogOut, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const GroupInfo = () => {
  const { user } = useContext(AuthContext)
  const [admin, setAdmin] = useState(null)
  const [members, setMembers] = useState([])
  const { groupId, groupName } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await api.post(`/group/getMembers/${groupId}`)
        setAdmin(res.data.admin)
        setMembers(res.data.members)
      } catch (err) {
        console.error('Error fetching group info:', err)
      }
    }

    fetchGroupInfo()
  }, [groupId])

  const handleLeaveGroup = async () => {
    try {
      const res = await api.post(`/group/leave/${groupId}`)
      if (!res.data.ok) {
        toast.error(res.data.message || 'Failed to leave the group.')
        navigate('/groups') 
      }
    } catch (err) {
      console.error('Error:', err)
      const message = err.response?.data?.message || 'Something went wrong while leaving the group.'
      toast.error(message)
    }
  }

  const handleDeleteGroup = async () => {
    try {
      const res = await api.post(`/group/delete/${groupId}`)
      if (res.status === 200) {
        toast.success('Group deleted successfully.')
        navigate('/groups') 
      }
    } catch (err) {
      console.error('Failed to delete group:', err)
      toast.error('An error occurred while deleting the group.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/groupChat/${groupName}/${groupId}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-6 h-6" />
            </Button>
        </Link>
        <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary">
          {groupName} Info
        </h2>
      </div>

      <div className="space-y-6">
        {/* Admin Card */}
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-primary" /> Group Admin
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 p-2 rounded-xl bg-muted/30">
                    <img src={admin?.profileImg} alt={admin?.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                    <div>
                        <div className="font-bold text-lg">{admin?.name}</div>
                        <div className="text-sm text-muted-foreground">{admin?.contactNumber}</div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Members Card */}
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" /> Members ({members.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    {members.map(member => (
                    <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <img src={member?.profileImg} alt={member?.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {member.contactNumber}
                            {admin._id === member._id && <span className="ml-2 text-primary font-bold">(Admin)</span>}
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
            <Button 
                onClick={handleLeaveGroup} 
                variant="outline" 
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            >
                <LogOut className="w-4 h-4 mr-2" /> Leave Group
            </Button>
            
            {user?._id === admin?._id && (
            <Button 
                onClick={handleDeleteGroup} 
                variant="destructive" 
                className="w-full"
            >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Group
            </Button>
            )}
        </div>
      </div>
    </div>
  )
}

export default GroupInfo
