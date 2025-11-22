import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqs = [
    {
      question: 'How do I book a cricket box?',
      answer:
        "Log in to your account, go to the home page, choose your preferred box, date, and time, then click 'Check Slot'. If the slot is available, click 'Book Now'.",
    },
    {
      question: 'Can I cancel my booking?',
      answer: "Yes, according to Box policies. Go to 'My Bookings' and cancel any booking (subject to cancellation rules).",
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We currently support Advance ₹500 UPI. Remaining payments can be made via cash at the location (if allowed by the box owner).',
    },
    {
      question: 'Is there a mobile app available?',
      answer:
        'A mobile app is under development. For now, you can use our fully responsive web app on any device.',
    },
    {
      question: 'Terms and Conditions',
      answer:
        'By using Book My Box, you agree to: (1) Provide accurate information during registration and booking. (2) Comply with the rules and regulations of the cricket box facility. (3) Pay all applicable fees on time. (4) Not engage in any unlawful or prohibited activities. (5) Accept that we reserve the right to cancel bookings that violate our terms. (6) Understand that box owners set their own policies for usage, cancellation, and refunds. (7) Acknowledge that we act as a platform connecting users with box owners and are not responsible for the quality of facilities.',
    },
    {
      question: 'Refund Policy',
      answer:
        'Refund eligibility depends on the individual box owner\'s policy and timing of cancellation: (1) Cancellations made 24+ hours before the booking time may be eligible for a full refund minus processing fees. (2) Cancellations made less than 24 hours before may receive partial or no refund. (3) The ₹500 advance payment refund is subject to the box owner\'s approval. (4) Refunds are processed within 5-7 business days to the original payment method. (5) No-shows are not eligible for refunds. (6) In case of facility issues or unavailability, full refunds will be provided. For specific refund queries, please contact us at alfazbilakhiya17@gmail.com or call 6353783332.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="text-center mb-12">
        <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h2
          style={{ fontFamily: 'Bebas Neue' }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-2"
        >
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about booking with us.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <span className="text-lg font-semibold text-foreground pr-8">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-primary transition-transform duration-300 ${
                  activeIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-primary/5 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FAQSection
