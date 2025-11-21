import React, { useContext, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Bell, Trash2, UserPlus } from 'lucide-react'
import api from '../../utils/api'
import AuthContext from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import useNotificationStore from '../../store/useNotificationStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Notifications = () => {
  const { user } = useContext(AuthContext)
  const { notifications, fetchNotifications, markAllAsRead, fetchUnreadCount } = useNotificationStore()

  useEffect(() => {
    fetchUnreadCount()
    fetchNotifications()
    markAllAsRead()
  }, [])

  const handleJoinGroup = async groupId => {
    try {
      await api.post('/group/join', {
        userIdToInvite: user._id,
        groupId,
      })
      toast.success('Joined group successfully')
      fetchNotifications()
    } catch (error) {
      console.error('Error joining group', error)
    }
  }

  const handleDeleteNotification = async notificationId => {
    try {
      const res = await api.post(`/notification/deleteNotification/${notificationId}`)
      if (res.status === 200) {
        toast.success('Notification deleted successfully')
        fetchNotifications()
      }
    } catch (error) {
      toast.error('Error deleting notification')
      console.log(error)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
            <Bell className="w-8 h-8 text-primary" />
        </div>
        <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold">Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-muted/10">
            <div className="p-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications yet.</p>
                <p className="text-sm">We'll notify you when something important happens.</p>
            </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <Card 
                key={n._id} 
                className={`transition-all hover:shadow-md ${!n.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-grow">
                    <div className="mb-1">
                        {n.type === 'booking_created' ? (
                            <Link
                            to="/admin/bookings"
                            className="text-base font-bold text-primary hover:underline"
                            >
                            {n.message}
                            </Link>
                        ) : (
                            <p className="text-base font-semibold text-foreground">{n.message}</p>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                        {new Date(n.createdAt).toLocaleString()}
                    </p>

                    {n.status === 'pending' && (
                        <Button 
                            size="sm" 
                            className="mt-3"
                            onClick={() => handleJoinGroup(n.groupId)}
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> Join Group
                        </Button>
                    )}
                </div>

                <button 
                    onClick={() => handleDeleteNotification(n._id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-full"
                    title="Delete notification"
                >
                    <Trash2 size={18} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
