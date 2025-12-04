import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'alfazbilakhiya17@gmail.com',
      link: 'mailto:alfazbilakhiya17@gmail.com',
    
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 6353783332',
      link: 'tel:+916353783332',
      description: 'Mon-Sat from 8am to 8pm',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'India',
      link: null,
      description: 'We provide booking service  for turfs in bhavnagar,Gujrat.',
    },
  ]

  return (
    <div className="min-h-screen via-muted/30 to-background py-12 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto text-center mb-16"
      >
        <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1
          style={{ fontFamily: 'Bebas Neue' }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4"
        >
          Get In Touch
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Have questions about booking a cricket box? We're here to help! Reach out to us and we'll get back to you as soon as possible.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="inline-block p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4"
              >
                <info.icon className="w-8 h-8 text-primary" />
              </motion.div>
              <h3
                style={{ fontFamily: 'Bebas Neue' }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {info.title}
              </h3>
              {info.link ? (
                <a
                  href={info.link}
                  className="text-primary hover:text-secondary transition-colors font-semibold text-lg block mb-2"
                >
                  {info.value}
                </a>
              ) : (
                <p className="text-foreground font-semibold text-lg mb-2">{info.value}</p>
              )}
              <p className="text-muted-foreground text-sm">{info.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card border border-primary/20 rounded-2xl p-8 md:p-12 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-6 h-6 text-primary" />
            <h2
              style={{ fontFamily: 'Bebas Neue' }}
              className="text-3xl font-bold text-foreground"
            >
              Send Us A Message
            </h2>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3
                style={{ fontFamily: 'Bebas Neue' }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Message Sent Successfully!
              </h3>
              <p className="text-muted-foreground">
                We'll get back to you as soon as possible.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full border-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Your Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  className="w-full border-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          )}
        </motion.div>

        {/* Business Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center"
        >
          <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-2xl font-bold text-foreground mb-3"
          >
            Support Hours
          </h3>
          <p className="text-muted-foreground text-lg">
            Monday - Saturday: 8:00 AM - 8:00 PM IST
          </p>
          <p className="text-muted-foreground text-lg">
            Sunday: 10:00 AM - 6:00 PM IST
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            We typically respond within 24 hours
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ContactUs
