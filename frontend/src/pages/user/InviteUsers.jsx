import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArrowLeft, UserPlus } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

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
    <div className="p-4 bg-base-100 shadow rounded-xl">
      <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-lg font-semibold mb-2">
        <Link to={`/groups`}>
          <button className="btn btn-sm btn-ghost">
            <ArrowLeft />
          </button>
        </Link>
        Invite Users
      </h3>
      <input
        type="text"
        placeholder="Search users..."
        className="input input-bordered w-full mb-4"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
        {filteredUsers.length === 0 && <p className="text-gray-400 text-sm">No users found</p>}
        {filteredUsers.map(user => (
          <div
            key={user._id}
            className="flex justify-between items-center p-2 rounded hover:bg-base-200 transition"
          >
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img src={user.profileImg || null} alt={user.name} />
                </div>
              </div>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
            <button
              className="btn btn-sm btn-outline btn-primary"
              disabled={inviting[user._id]}
              onClick={() => handleInvite(user._id)}
            >
              {inviting[user._id] ? 'Inviting...' : <UserPlus size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InviteUsers
