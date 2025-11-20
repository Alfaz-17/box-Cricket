// middleware/role.js
export const isOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Only owners allowed' })
  }
  next()
}
