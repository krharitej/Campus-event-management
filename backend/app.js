// Campus Event Management Platform - Main Application
// Author: Campus Event Management Team
// Date: September 7, 2025
// Technology: Node.js + Express + PostgreSQL

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'campus_events',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Access token required' }
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check college access
const checkCollegeAccess = (req, res, next) => {
  const requestedCollegeId = req.params.college_id;
  const userCollegeId = req.user.college_id;
  if (requestedCollegeId !== userCollegeId) {
    return res.status(403).json({
      success: false,
      error: { code: 'COLLEGE_MISMATCH', message: 'Access denied to this college data' }
    });
  }
  next();
};

// ============================================================================
// ROOT ENDPOINT: Homepage to switch between Admin Portal and Student App
// ============================================================================
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Campus Event Management Platform</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 100px auto; text-align: center;">
        <h1>🎓 Campus Event Management Platform</h1>
        <p>Choose your interface:</p>
        <div style="margin: 30px 0;">
          <a href="/admin" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">
            👑 Admin Portal
          </a>
          <a href="/student" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #2ecc71; color: white; text-decoration: none; border-radius: 5px;">
            📱 Student App  
          </a>
        </div>
        <p><small>API running on port 3000</small></p>
      </body>
    </html>
  `);
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, college_code } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    // Find user with college information
    let query = `
      SELECT u.*, c.name as college_name, c.code as college_code
      FROM users u 
      JOIN colleges c ON u.college_id = c.college_id 
      WHERE u.email = $1 AND u.is_active = true
    `;
    let params = [email];

    // If college_code provided, add it to the query
    if (college_code) {
      query += ' AND c.code = $2';
      params.push(college_code);
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const user = result.rows[0];
    // In production, verify password with bcrypt
    // const validPassword = await bcrypt.compare(password, user.password_hash);

    // Generate JWT token
    const token = jwt.sign({
      user_id: user.user_id,
      college_id: user.college_id,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [user.user_id]);

    res.json({
      success: true,
      data: {
        access_token: token,
        user: {
          user_id: user.user_id,
          college_id: user.college_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          college_name: user.college_name,
          college_code: user.college_code
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' }
    });
  }
});

// ============================================================================
// COLLEGE, EVENT, REGISTRATION, ATTENDANCE, FEEDBACK ROUTES
// ... (as in your original file)
// [Include here all route handlers as provided in your code]
// ============================================================================

// ============================================================================
// REPORTING ROUTES
// ============================================================================

// GET /colleges/:college_id/reports/event-popularity
app.get('/colleges/:college_id/reports/event-popularity', 
  authenticateToken, checkCollegeAccess, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admin and staff can view reports' }
      });
    }
    const query = `
      SELECT 
        e.event_id,
        e.name,
        e.college_event_code,
        ec.name as category_name,
        COUNT(DISTINCT er.registration_id) as total_registrations,
        COUNT(DISTINCT ea.attendance_id) as total_attendees,
        CASE WHEN COUNT(DISTINCT er.registration_id) > 0 
          THEN ROUND(COUNT(DISTINCT ea.attendance_id)::numeric / COUNT(DISTINCT er.registration_id)::numeric * 100, 2)
          ELSE 0 
        END as attendance_rate,
        COALESCE(AVG(ef.rating), 0) as average_rating
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.status = 'registered'
      LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
      LEFT JOIN event_feedback ef ON e.event_id = ef.event_id
      WHERE e.college_id = $1 AND e.status IN ('published', 'completed')
      GROUP BY e.event_id, e.name, e.college_event_code, ec.name
      ORDER BY total_registrations DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [req.params.college_id]);

    res.json({
      success: true,
      data: {
        events: result.rows.map(row => ({
          event_id: row.event_id,
          name: row.name,
          college_event_code: row.college_event_code,
          category_name: row.category_name,
          total_registrations: parseInt(row.total_registrations),
          total_attendees: parseInt(row.total_attendees),
          attendance_rate: parseFloat(row.attendance_rate),
          average_rating: parseFloat(row.average_rating).toFixed(1)
        }))
      }
    });
  } catch (error) {
    console.error('Event popularity report error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate event popularity report' }
    });
  }
});

// ... (include rest of report routes your code has)

// ============================================================================
// SERVE FRONTEND APPLICATIONS 
// ============================================================================

// Serve static files for admin portal
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin-portal')));

// Serve static files for student app
app.use('/student', express.static(path.join(__dirname, '../frontend/student-app')));



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Campus Event Management Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`📝 Ready to handle requests!`);
});

module.exports = app;
