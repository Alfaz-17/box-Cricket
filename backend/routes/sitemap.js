import express from 'express'
import CricketBox from '../models/CricketBox.js'
import { generateSlug } from '../utils/seoGenerator.js'

const router = express.Router()

// Simple XML sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const boxes = await CricketBox.find()
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    
    // Home page
    xml += '<url>'
    xml += '<loc>https://yourdomain.com/</loc>'
    xml += '<priority>1.0</priority>'
    xml += '<changefreq>daily</changefreq>'
    xml += '</url>'
    
    // Each box page
    boxes.forEach(box => {
      const slug = generateSlug(box.name, box.location)
      xml += '<url>'
      xml += `<loc>https://yourdomain.com/box/${box._id}/${slug}</loc>`
      xml += '<priority>0.8</priority>'
      xml += '<changefreq>weekly</changefreq>'
      xml += '</url>'
    })
    
    xml += '</urlset>'
    
    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (error) {
    console.error('Sitemap error:', error)
    res.status(500).send('Error generating sitemap')
  }
})

export default router
