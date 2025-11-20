import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 100, // limit each ip to 100 request per windowsMs
  message: 'Too many request frrom this Ip Pleaes try again after 15 minitues',
})

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    error: 'Too many booking attempts. Please try again after an hour.',
  },
  keyGenerator: (req, res) => {
    if (req.user?.id) return req.user.id
    return ipKeyGenerator(req, res)
  },
})

// Just log once when the server starts
console.log('Booking limiter applied ✅')
