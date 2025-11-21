import { useEffect, useState, useRef, useContext } from 'react'
import api from '../../utils/api'
import { ArrowLeft, Send, Info } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import socket from '../../utils/soket'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const GroupChat = () => {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const bottomRef = useRef(null)
  const { groupId, groupName } = useParams()

  useEffect(() => {
    if (!groupId) return

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/all/${groupId}`)
        setMessages(res.data.reverse())
      } catch (err) {
        console.error('Error loading messages:', err)
      }
    }

    fetchMessages()

    const handleNewGroupMessage = data => {
      if (data.groupId === groupId) {
        setMessages(prev => [...prev, data.message])
      }
    }

    socket.on('new-group-message', handleNewGroupMessage)

    return () => {
      socket.off('new-group-message', handleNewGroupMessage)
    }
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim()) return

    try {
      const res = await api.post('/messages/send', {
        groupId,
        content: newMsg,
      })

      setMessages(prev => [...prev, res.data])
      setNewMsg('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-card/50 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center gap-4">
            <Link to={`/groups`}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                    <ArrowLeft className="w-6 h-6 text-primary" />
                </Button>
            </Link>
            <div>
                <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold tracking-wide">
                    {groupName}
                </h2>
                <p className="text-xs text-muted-foreground">Online</p>
            </div>
        </div>
        <Link to={`/groupInfo/${groupName}/${groupId}`}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Info className="w-6 h-6 text-primary" />
            </Button>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-muted/5">
        {messages.map((msg, i) => {
          const isOwn = msg.sender?._id === user?._id

          return (
            <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isOwn && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 flex-shrink-0">
                    <img
                      src={
                        msg.sender?.profileImg ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          msg.sender?.name || 'User'
                        )}&background=random`
                      }
                      alt={msg.sender?.name}
                      className="w-full h-full object-cover"
                    />
                </div>
              )}
              
              <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="text-xs text-muted-foreground mb-1 px-1">
                    {isOwn ? 'You' : msg.sender?.name}
                </div>
                <div
                    className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isOwn 
                        ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-tr-none' 
                        : 'bg-card border border-primary/10 text-foreground rounded-tl-none'
                    }`}
                >
                    {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Input
                type="text"
                className="flex-1 rounded-full border-primary/20 focus-visible:ring-primary/50"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button 
                onClick={handleSend} 
                size="icon" 
                className="rounded-full w-10 h-10 shadow-md hover:scale-105 transition-transform"
            >
                <Send size={18} />
            </Button>
        </div>
      </div>
    </div>
  )
}

export default GroupChat
