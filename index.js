import express from 'express';
import cors from 'cors';
import sharp from 'sharp';
import pool from './db.js';
const app = express();

app.use(cors());
app.use(express.json()); // To parse JSON body


// Middleware to parse query parameters and log requests
app.post('/tracking_pixel', express.json(), async (req, res) => {
    try {
      const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const user_agent = req.get('User-Agent') || 'Unknown';
      const referrer = req.get('Referer') || 'Direct';
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
      // Accept JSON body
      const campaign_id = req.body.cid ? req.body.cid.trim() : 'Unknown';
      const button_id = req.body.aid ? req.body.aid.trim() : 'Unknown';
  
      console.log(`[TRACK-POST] cid=${campaign_id}, aid=${button_id}, ip=${ip_address}`);
  
      // Store in MySQL
      const sql = `INSERT INTO tracking_logs (ip_address, user_agent, referrer, campaign_id, button_id, timestamp) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [ip_address, user_agent, referrer, campaign_id, button_id, timestamp];
      await pool.query(sql, values);
    } catch (err) {
      console.error('[ERROR] Logging failed:', err);
    }
  
    // Return 1x1 transparent PNG
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  
    const pixel = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    }).png().toBuffer();
  
    res.send(pixel);
  });
  

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 Tracking Pixel Server running on http://localhost:${PORT}`);
});
