import React, { useState } from 'react'
import api from '../../utils/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { MessageSquare, Phone, User, Send } from 'lucide-react'

const FeedbackSupport = () => {
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [responseMessage, setResponseMessage] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setResponseMessage('')
    setErrorMessage('') // Clear previous errors

    try {
      const res = await api.post('/boxes/support', form)

      if (res.status === 201) {
        setResponseMessage(res.data.message)
        setForm({ name: '', contactNumber: '', message: '' })
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-[80vh] flex items-center justify-center">
      <Card className="w-full border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <CardTitle style={{ fontFamily: 'Bebas Neue' }} className="text-4xl text-primary">
                Feedback & Support
            </CardTitle>
            <CardDescription className="text-lg">
                We'd love to hear from you. Send us a message!
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                        <User size={16} className="text-primary" /> Name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your Name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="flex items-center gap-2">
                        <Phone size={16} className="text-primary" /> Contact Number
                    </Label>
                    <Input
                        id="contactNumber"
                        type="text"
                        name="contactNumber"
                        value={form.contactNumber}
                        onChange={handleChange}
                        required
                        placeholder="Your Contact Number"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary" /> Message
                    </Label>
                    <textarea
                        id="message"
                        name="message"
                        className="flex min-h-[120px] w-full rounded-xl border-2 border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/20"
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        required
                        placeholder="How can we help you?"
                    ></textarea>
                </div>

                <Button type="submit" className="w-full" disabled={loading} size="lg">
                    {loading ? 'Submitting...' : (
                        <>
                            Submit Feedback <Send className="ml-2 w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            {responseMessage && (
                <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-center font-medium">
                    {responseMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-center font-medium">
                    {errorMessage}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FeedbackSupport
