import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 100, // limit each ip to 100 request per windowsMs
  message: 'Too many request frrom this Ip Pleaes try again after 15 minitues',
})

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:20, //  requests per hour
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again  after 1 hour.',
  },

  // this is count req per user and without keygenrator its count on ip per request
  // keyGenerator: (req, res) => {
  //   if (req.user?.id) return req.user._id
  //   return ipKeyGenerator(req, res)
  // },
})

export const checkSlotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many slots check, Please wait  1 minuite',
  },
})
