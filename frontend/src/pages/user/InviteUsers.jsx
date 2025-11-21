import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UserPlus, Search, Users } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const InviteUsers = () => {
  const [allUsers, setAllUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviting, setInviting] = useState({})
  const [groups, setGroups] = useState([])
  const { id } = useParams() // id = groupId

  const fetchGroups = async () => {
    try {
      const res = await api.get('/group/myGroups')
      setGroups(res.data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const res = await api.post('/auth/me')
      setCurrentUser(res.data.user)
    } catch (err) {
      console.error('Failed to fetch current user:', err)
    }
  }

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users') // Make sure this route exists on your backend
      setAllUsers(res.data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
    fetchGroups()
  }, [])

  const handleInvite = async userIdToInvite => {
    try {
      setInviting(prev => ({ ...prev, [userIdToInvite]: true }))

      const res = await api.post('/group/invite', {
        groupId: id,
        userIdToInvite,
      })

      toast.success(res.data.message || 'User invited successfully')
    } catch (err) {
      console.error('Error inviting user:', err)
      const msg = err?.response?.data?.message || 'Failed to invite user.'

      if (msg.toLowerCase().includes('already invited')) {
        toast.error('User has already been invited.')
      } else {
        toast.error(msg)
      }
    } finally {
      setInviting(prev => ({ ...prev, [userIdToInvite]: false }))
    }
  }

  // Filter users based on search term and group membership and  current user
  const currentGroup = groups.find(group => group._id === id)
  const groupMemberIds = currentGroup?.members?.map(member => member._id) || []

  const filteredUsers = allUsers.filter(user => {
    const isCurrentUser = user._id === currentUser?._id
    const isAlreadyMember = groupMemberIds.includes(user._id)
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())

    return !isCurrentUser && !isAlreadyMember && matchesSearch
  })

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/groups`}>
            <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-6 h-6" />
            </Button>
        </Link>
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary">
            Invite Users
        </h1>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Search users by name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users found to invite.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map(user => (
                    <div
                        key={user._id}
                        className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                                <img 
                                    src={user.profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                        </div>
                        <Button
                            size="sm"
                            variant={inviting[user._id] ? "secondary" : "default"}
                            disabled={inviting[user._id]}
                            onClick={() => handleInvite(user._id)}
                            className="min-w-[100px]"
                        >
                            {inviting[user._id] ? 'Inviting...' : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" /> Invite
                                </>
                            )}
                        </Button>
                    </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InviteUsers
