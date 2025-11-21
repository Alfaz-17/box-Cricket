import { useState, useEffect, useContext } from 'react'
import api from '../../utils/api'
import { User, Users2, Plus, MessageSquare } from 'lucide-react'
import GroupChat from './GroupChat'
import { Link, useNavigate } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const Group = () => {
  const [groupName, setGroupName] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeGroup, setActiveGroup] = useState(null)
  const navigate = useNavigate()

  const { isAuthenticated } = useContext(AuthContext)

  const fetchGroups = async () => {
    try {
      const res = await api.get('/group/myGroups')
      setGroups(res.data)
      console.log(res.data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const createGroup = async () => {
    if (!groupName.trim()) return
    try {
      setLoading(true)
      await api.post('/group/create', { name: groupName })
      setGroupName('')
      fetchGroups()
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (activeGroup) {
    return (
      <GroupChat
        groupId={activeGroup._id}
        groupName={activeGroup.name}
        onBack={() => navigate('/groups')}
      />
    )
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col md:flex-row bg-background">
      {/* Left Sidebar */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-primary/10 flex flex-col h-full bg-card/30 backdrop-blur-sm">
        <div className="p-4 border-b border-primary/10">
          <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl font-bold text-center mb-4 text-primary">
            My Groups
          </h2>

          {/* Create Group */}
          <div className="flex gap-2">
            <Input
              type="text"
              className="h-10"
              placeholder="New Group Name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
            <Button size="sm" onClick={createGroup} disabled={loading} className="h-10 px-4">
              {loading ? '...' : <Plus className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Group List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
          {groups.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
                <Users2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No groups found</p>
            </div>
          ) : (
            groups.map(group => (
              <Link to={`/groupChat/${group.name}/${group._id}`} key={group._id} className="block">
                <Card className="hover:bg-primary/5 transition-colors border-primary/10 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">
                        {group.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        Admin: {group.admin?.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Users2 className="w-3 h-3" />
                        {group.members?.length} Members
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </aside>

      {/* Right Section */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">Select a group to start chatting</p>
          <p className="text-lg mt-2">Connect with your team and plan your matches!</p>
        </div>
      </div>
    </div>
  )
}

export default Group
