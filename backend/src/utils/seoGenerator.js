import slugify from 'slugify'

/**
 * Generates SEO-friendly slug from box name and location
 */
export function generateSlug(name, location) {
  const combined = `${name} cricket box ${location} bhavnagar`
  return slugify(combined, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
}

/**
 * Generates complete SEO content for a cricket box
 */
export function generateSEOContent(box) {
  const { name, location, address, hourlyRate, facilities = [], features = [] } = box
  
  const slug = generateSlug(name, location)
  
  // Combine facilities and features for description
  const allFeatures = [...facilities, ...features]
  const facilitiesText = allFeatures.length > 0 
    ? allFeatures.slice(0, 2).join(' & ').toLowerCase()
    : 'turf ground & night lights'
  
  return {
    slug,
    seo: {
      metaTitle: `${name} in ${location} Bhavnagar | Book Cricket Box`,
      metaDescription: `Book ${name} in ${location}, Bhavnagar with ${facilitiesText}. Hourly slots for students, teams & corporate groups. Online booking available.`,
      h1: `${name} – Cricket Box in ${location}, Bhavnagar`,
      seoParagraphs: [
        `Looking for a premium cricket box in ${location}, Bhavnagar? ${name} offers the perfect playing experience for cricket enthusiasts across Bhavnagar. Located in ${location}, our facility is easily accessible from major localities including Ghogha Circle, Crescent Circle, and Takhteshwar Road. Whether you're a student looking for practice sessions, a local team preparing for tournaments, or a corporate group planning team-building activities, our cricket box provides professional-grade infrastructure with well-maintained turf and modern amenities.`,
        `${name} comes equipped with ${allFeatures.length > 0 ? allFeatures.join(', ').toLowerCase() : 'high-quality turf flooring, powerful night lights for evening matches'}, and flexible hourly booking slots. Book your slot online through our website or call us for offline bookings. We cater to students from local schools and colleges, cricket academies, weekend warriors, and corporate teams across Bhavnagar. With transparent pricing starting at ₹${hourlyRate}/hour, instant confirmation, and hassle-free booking, we've made it easier than ever to enjoy cricket in ${location}.`
      ],
      keywords: [
        'cricket box in bhavnagar',
        `cricket turf ${location.toLowerCase()} bhavnagar`,
        'book cricket ground bhavnagar',
        `${name.toLowerCase()} ${location.toLowerCase()}`,
        'night cricket bhavnagar',
        'turf cricket ground bhavnagar',
        'hourly cricket booking bhavnagar',
        `cricket practice ground ${location.toLowerCase()}`,
        'bhavnagar cricket facilities',
        `${location.toLowerCase()} sports ground booking`
      ],
      faq: [
        {
          question: `How can I book ${name} in ${location}, Bhavnagar?`,
          answer: `Booking ${name} is simple and convenient! You can book online through our website by selecting your preferred date and time slot. We also accept offline bookings via phone call. Once your booking is confirmed, you'll receive instant confirmation with all the details. Our online booking system is available 24/7 for your convenience.`
        },
        {
          question: `What facilities and amenities are available at ${name} in ${location}?`,
          answer: allFeatures.length > 0
            ? `${name} in ${location}, Bhavnagar offers premium facilities including ${allFeatures.join(', ').toLowerCase()}. Our cricket box is well-maintained and equipped with modern amenities to ensure the best playing experience for students, local teams, and corporate groups.`
            : `${name} in ${location}, Bhavnagar features professional turf flooring, bright night lights for evening matches, covered seating area, clean washroom facilities, and ample parking space. We maintain our facility to the highest standards for your comfort and safety.`
        },
        {
          question: `What are the booking rates and charges for ${name}?`,
          answer: `The hourly rate for ${name} in ${location} starts at ₹${hourlyRate} per hour. We offer flexible hourly booking options to suit your schedule. Special discounted rates are available for regular bookings, bulk bookings, and long-duration sessions. Students and local cricket academies can also avail special pricing. Contact us for customized packages for tournaments and corporate events.`
        },
        {
          question: `Is ${name} suitable for practice sessions and tournaments in Bhavnagar?`,
          answer: `Absolutely! ${name} in ${location} is perfect for cricket practice sessions, friendly matches, local tournaments, and corporate team-building events. Our facility caters to players of all skill levels - from beginners to professionals. We welcome students, cricket academies, weekend teams, and corporate groups from across Bhavnagar. The well-maintained turf and professional setup make it ideal for serious practice and competitive matches.`
        },
        {
          question: `What are the operating hours and booking timings for ${name}?`,
          answer: `${name} in ${location}, Bhavnagar operates from early morning to late night to accommodate your schedule. We offer flexible hourly slots throughout the day. Night cricket is also available with our powerful floodlights. You can book slots for weekdays and weekends. For specific timing details and slot availability, please check our online booking calendar or contact us directly.`
        }
      ]
    }
  }
}
