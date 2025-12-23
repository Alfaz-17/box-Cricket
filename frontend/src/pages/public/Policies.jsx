import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, FileText, Truck, DollarSign, ChevronDown, ChevronUp, AlertCircle, CheckCircle, HelpCircle, Lock } from 'lucide-react'

const Policies = () => {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General & Terms', icon: FileText },
    { id: 'payments', label: 'Payments & Refunds', icon: DollarSign },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'shipping', label: 'Delivery/Shipping', icon: Truck },
  ]

  const content = {
    general: [
      {
        question: "What is BookMyBox?",
        answer: "BookMyBox is an online platform that allows customers to discover and book cricket boxes and turfs. We facilitate the booking process between players and venue owners."
      },
      {
        question: "User Responsibilities",
        answer: "Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account."
      },
      {
        question: "Acceptance of Terms",
        answer: "By accessing and using BookMyBox, you accept and agree to be bound by our terms and conditions. If you do not agree, please do not use our services."
      }
    ],
    payments: [
      {
        question: "Do you offer refunds?",
        answer: "We strictly follow a 'No Refund via Us' policy. Once a booking is confirmed and the advance payment is made, we do not process refunds through our platform. Any potential refunds must be discussed directly with the venue management."
      },
      {
        question: "How do payments work?",
        answer: "We only collect a fixed advance booking fee (approx. ₹300-500) to confirm your slot. The remaining balance of the booking amount is to be paid directly to the venue (turf/box) owner at the time of play."
      },
      {
        question: "Is the Payment Gateway liable for disputes?",
        answer: "No. The Payment Gateway Service Provider is acting solely as a payment processor for the advance booking fee. They are not a party to the service agreement between you and the venue owner. BookMyBox takes full responsibility for disputes related to the advance payment collected through the platform."
      },
      {
        question: "Are there hidden fees?",
        answer: "No. BookMyBox believes in transparency. The price you see at checkout is the price you pay for the advance booking. There are no hidden booking fees charged by us."
      }
    ],
    privacy: [
      {
        question: "What data do we collect?",
        answer: "We collect only the necessary information required to facilitate your bookings, such as your name, contact details, and booking preferences. We do not sell or share your personal data with third parties for marketing purposes."
      },
      {
        question: "Is my payment information safe?",
        answer: "Yes. We implement industry-standard security measures. Your payment information is processed securely through our payment partners and is not stored on our servers."
      },
      {
        question: "How is my information used?",
        answer: "Your information is used solely for processing your bookings, communicating confirmations/updates, and complying with legal requirements."
      }
    ],
    shipping: [
      {
        question: "Do you ship physical products?",
        answer: "No. BookMyBox provides digital booking services for cricket venues. There are no physical products to ship or deliver."
      },
      {
        question: "How do I get my booking confirmation?",
        answer: "Upon successful payment, you will receive an instant confirmation via email and/or SMS. This digital confirmation serves as your ticket/pass for the booked slot."
      }
    ]
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-display tracking-tight"
        >
          Policies & FAQs
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to know about our services, payments, and policies.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-card border border-primary/10 hover:bg-primary/10 text-muted-foreground'
            }`}
          >
            <tab.icon size={18} />
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {content[activeTab].map((item, index) => (
          <QAItem key={index} question={item.question} answer={item.answer} index={index} />
        ))}
      </motion.div>
    </div>
  )
}

const QAItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-bold text-foreground">{question}</span>
        {isOpen ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 pb-4"
          >
            <p className="text-muted-foreground leading-relaxed border-t border-primary/5 pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Policies
