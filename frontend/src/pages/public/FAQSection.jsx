

const FAQSection = () => {
    const faqs = [
  {
    question: "How do I book a cricket box?",
    answer:
      "Log in to your account, go to the home page, choose your preferred box, date, and time, then click 'Check Slot' if slot is available then click 'Book Now'. "
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, according to Box polices go to 'My Bookings' and cancel any booking ."
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We currently support Advance 500.Rs UPI, and and later when you going to play cash payments at the location  (if allowed by the box owner)."
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "A mobile app is under development. For now, you can use our fully responsive web app on any device."
  }
];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 style={{ fontFamily: "Bebas Neue" }}  className="text-3xl font-bold text-center mb-8 text-primary">Frequently Asked Questions</h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="collapse collapse-arrow bg-base-200 rounded-box shadow">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-lg font-medium text-primary">
              {faq.question}
            </div>
            <div className="collapse-content text-base-content/80">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
