import React, { useContext, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Bell, DeleteIcon } from 'lucide-react'
import api from '../../utils/api'
import AuthContext from '../../context/AuthContext'
import { Link } from 'react-router-dom' // make sure it's imported
import useNotificationStore from '../../store/useNotificationStore'

const Notifications = () => {
  const { user } = useContext(AuthContext)

  const { notifications, fetchNotifications, markAllAsRead, fetchUnreadCount } =
    useNotificationStore()

  // Notifications.jsx
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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <div className="alert alert-vertical shadow-sm">
          <span>No notifications yet.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`card shadow-md ${
                !n.isRead ? 'border-l-4 border-primary' : ''
              } bg-base-100`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-1">
                  {/* Wrap message in a link if it's a booking notification */}
                  {n.type === 'booking_created' ? (
                    <Link
                      to="/admin/bookings"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold">{n.message}</p>
                  )}

                  <div onClick={() => handleDeleteNotification(n._id)}>
                    <DeleteIcon />
                  </div>
                </div>

                <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>

                {n.status === 'pending' && (
                  <button className="btn btn-accent" onClick={() => handleJoinGroup(n.groupId)}>
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
