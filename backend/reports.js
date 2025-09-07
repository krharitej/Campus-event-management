// Campus Event Management Platform - Reporting Module
// Add these routes to your main app.js file after the other route definitions

// ============================================================================
// REPORTING ROUTES
// ============================================================================

// GET /colleges/:college_id/reports/event-popularity
app.get('/colleges/:college_id/reports/event-popularity', 
  authenticateToken, checkCollegeAccess, async (req, res) => {
  try {
    // Only admin and staff can view reports
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admin and staff can view reports' }
      });
    }

    const { start_date, end_date, category_id, limit = 10 } = req.query;
    
    let whereConditions = ['e.college_id = $1'];
    let params = [req.params.college_id];
    let paramCount = 1;

    if (start_date) {
      whereConditions.push(`e.start_date >= $${++paramCount}`);
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push(`e.end_date <= $${++paramCount}`);
      params.push(end_date);
    }
    
    if (category_id) {
      whereConditions.push(`e.category_id = $${++paramCount}`);
      params.push(category_id);
    }

    const query = `
      SELECT 
        e.event_id,
        e.name,
        e.college_event_code,
        e.start_date,
        e.end_date,
        ec.name as category_name,
        COUNT(DISTINCT er.registration_id) as total_registrations,
        COUNT(DISTINCT ea.attendance_id) as total_attendees,
        CASE 
          WHEN COUNT(DISTINCT er.registration_id) > 0 
          THEN ROUND(COUNT(DISTINCT ea.attendance_id)::numeric / COUNT(DISTINCT er.registration_id)::numeric * 100, 2)
          ELSE 0 
        END as attendance_rate,
        COALESCE(AVG(ef.rating), 0) as average_rating,
        COUNT(DISTINCT ef.feedback_id) as feedback_count
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.status = 'registered'
      LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
      LEFT JOIN event_feedback ef ON e.event_id = ef.event_id
      WHERE ${whereConditions.join(' AND ')} AND e.status IN ('published', 'completed')
      GROUP BY e.event_id, e.name, e.college_event_code, e.start_date, e.end_date, ec.name
      ORDER BY total_registrations DESC, average_rating DESC
      LIMIT $${++paramCount}
    `;

    params.push(limit);
    const result = await pool.query(query, params);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT e.event_id) as total_events,
        COUNT(DISTINCT er.registration_id) as total_registrations,
        CASE 
          WHEN COUNT(DISTINCT er.registration_id) > 0 
          THEN ROUND(COUNT(DISTINCT ea.attendance_id)::numeric / COUNT(DISTINCT er.registration_id)::numeric * 100, 2)
          ELSE 0 
        END as average_attendance_rate
      FROM events e
      LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.status = 'registered'
      LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
      WHERE ${whereConditions.join(' AND ')} AND e.status IN ('published', 'completed')
    `;

    const summaryResult = await pool.query(summaryQuery, params.slice(0, -1)); // Remove limit

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
          average_rating: parseFloat(row.average_rating).toFixed(1),
          feedback_count: parseInt(row.feedback_count),
          start_date: row.start_date,
          end_date: row.end_date
        })),
        summary: {
          total_events: parseInt(summaryResult.rows[0].total_events),
          total_registrations: parseInt(summaryResult.rows[0].total_registrations),
          average_attendance_rate: parseFloat(summaryResult.rows[0].average_attendance_rate)
        }
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

// GET /colleges/:college_id/reports/student-participation
app.get('/colleges/:college_id/reports/student-participation',
  authenticateToken, checkCollegeAccess, async (req, res) => {
  try {
    // Only admin and staff can view reports
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admin and staff can view reports' }
      });
    }

    const { limit = 50, min_events = 0 } = req.query;

    const query = `
      SELECT 
        u.user_id,
        u.student_id,
        u.first_name || ' ' || u.last_name as name,
        u.department,
        u.year_of_study,
        COUNT(DISTINCT er.registration_id) as events_registered,
        COUNT(DISTINCT ea.attendance_id) as events_attended,
        CASE 
          WHEN COUNT(DISTINCT er.registration_id) > 0 
          THEN ROUND(COUNT(DISTINCT ea.attendance_id)::numeric / COUNT(DISTINCT er.registration_id)::numeric * 100, 2)
          ELSE 0 
        END as attendance_rate,
        COALESCE(AVG(ef.rating), 0) as average_feedback_rating
      FROM users u
      LEFT JOIN event_registrations er ON u.user_id = er.user_id AND er.status = 'registered'
      LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
      LEFT JOIN event_feedback ef ON u.user_id = ef.user_id
      WHERE u.college_id = $1 AND u.role = 'student' AND u.is_active = true
      GROUP BY u.user_id, u.student_id, u.first_name, u.last_name, u.department, u.year_of_study
      HAVING COUNT(DISTINCT er.registration_id) >= $2
      ORDER BY events_attended DESC, events_registered DESC, attendance_rate DESC
      LIMIT $3
    `;

    const result = await pool.query(query, [req.params.college_id, min_events, limit]);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT u.user_id) as total_students,
        ROUND(AVG(student_stats.events_registered), 1) as average_events_per_student,
        ROUND(AVG(student_stats.attendance_rate), 1) as overall_attendance_rate
      FROM users u
      LEFT JOIN (
        SELECT 
          u.user_id,
          COUNT(DISTINCT er.registration_id) as events_registered,
          CASE 
            WHEN COUNT(DISTINCT er.registration_id) > 0 
            THEN COUNT(DISTINCT ea.attendance_id)::numeric / COUNT(DISTINCT er.registration_id)::numeric * 100
            ELSE 0 
          END as attendance_rate
        FROM users u
        LEFT JOIN event_registrations er ON u.user_id = er.user_id AND er.status = 'registered'
        LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
        WHERE u.college_id = $1 AND u.role = 'student' AND u.is_active = true
        GROUP BY u.user_id
      ) student_stats ON u.user_id = student_stats.user_id
      WHERE u.college_id = $1 AND u.role = 'student' AND u.is_active = true
    `;

    const summaryResult = await pool.query(summaryQuery, [req.params.college_id]);

    res.json({
      success: true,
      data: {
        students: result.rows.map(row => ({
          user_id: row.user_id,
          student_id: row.student_id,
          name: row.name,
          department: row.department,
          year_of_study: row.year_of_study,
          events_registered: parseInt(row.events_registered),
          events_attended: parseInt(row.events_attended),
          attendance_rate: parseFloat(row.attendance_rate),
          average_feedback_rating: parseFloat(row.average_feedback_rating).toFixed(1)
        })),
        summary: {
          total_students: parseInt(summaryResult.rows[0].total_students),
          average_events_per_student: parseFloat(summaryResult.rows[0].average_events_per_student),
          overall_attendance_rate: parseFloat(summaryResult.rows[0].overall_attendance_rate)
        }
      }
    });

  } catch (error) {
    console.error('Student participation report error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate student participation report' }
    });
  }
});

// GET /colleges/:college_id/reports/top-active-students
app.get('/colleges/:college_id/reports/top-active-students',
  authenticateToken, checkCollegeAccess, async (req, res) => {
  try {
    // Only admin and staff can view reports
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admin and staff can view reports' }
      });
    }

    const { limit = 3, metric = 'events_attended' } = req.query;
    
    const orderBy = metric === 'events_registered' ? 'events_registered' : 'events_attended';

    const query = `
      SELECT 
        u.user_id,
        u.student_id,
        u.first_name || ' ' || u.last_name as name,
        u.department,
        u.year_of_study,
        u.email,
        COUNT(DISTINCT er.registration_id) as events_registered,
        COUNT(DISTINCT ea.attendance_id) as events_attended,
        CASE 
          WHEN COUNT(DISTINCT er.registration_id) > 0 
          THEN ROUND(COUNT(DISTINCT ea.attendance_id)::numeric / COUNT(DISTINCT er.registration_id)::numeric * 100, 2)
          ELSE 0 
        END as attendance_rate,
        COALESCE(AVG(ef.rating), 0) as average_feedback_rating,
        ARRAY_AGG(DISTINCT e.name ORDER BY e.start_date DESC) FILTER (WHERE ea.attendance_id IS NOT NULL) as recent_events_attended
      FROM users u
      LEFT JOIN event_registrations er ON u.user_id = er.user_id AND er.status = 'registered'
      LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
      LEFT JOIN events e ON ea.event_id = e.event_id
      LEFT JOIN event_feedback ef ON u.user_id = ef.user_id
      WHERE u.college_id = $1 AND u.role = 'student' AND u.is_active = true
      GROUP BY u.user_id, u.student_id, u.first_name, u.last_name, u.department, u.year_of_study, u.email
      HAVING COUNT(DISTINCT ea.attendance_id) > 0  -- Only students who attended at least one event
      ORDER BY ${orderBy} DESC, attendance_rate DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [req.params.college_id, limit]);

    res.json({
      success: true,
      data: {
        top_students: result.rows.map((row, index) => ({
          rank: index + 1,
          user_id: row.user_id,
          student_id: row.student_id,
          name: row.name,
          department: row.department,
          year_of_study: row.year_of_study,
          email: row.email,
          events_registered: parseInt(row.events_registered),
          events_attended: parseInt(row.events_attended),
          attendance_rate: parseFloat(row.attendance_rate),
          average_feedback_rating: parseFloat(row.average_feedback_rating).toFixed(1),
          recent_events_attended: row.recent_events_attended || []
        })),
        metadata: {
          metric_used: metric,
          total_returned: result.rows.length,
          generated_at: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Top active students report error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate top active students report' }
    });
  }
});

// GET /colleges/:college_id/reports/dashboard
app.get('/colleges/:college_id/reports/dashboard',
  authenticateToken, checkCollegeAccess, async (req, res) => {
  try {
    // Only admin and staff can view dashboard
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admin and staff can view dashboard' }
      });
    }

    // Get overall statistics for the college
    const dashboardQuery = `
      WITH event_stats AS (
        SELECT 
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE status = 'published') as published_events,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_events,
          COUNT(*) FILTER (WHERE start_date > NOW()) as upcoming_events
        FROM events 
        WHERE college_id = $1
      ),
      registration_stats AS (
        SELECT 
          COUNT(DISTINCT er.user_id) as total_registered_students,
          COUNT(er.registration_id) as total_registrations,
          COUNT(ea.attendance_id) as total_attendances
        FROM event_registrations er
        JOIN events e ON er.event_id = e.event_id
        LEFT JOIN event_attendance ea ON er.registration_id = ea.registration_id
        WHERE e.college_id = $1 AND er.status = 'registered'
      ),
      feedback_stats AS (
        SELECT 
          COUNT(*) as total_feedback,
          ROUND(AVG(rating), 2) as average_rating
        FROM event_feedback ef
        JOIN events e ON ef.event_id = e.event_id
        WHERE e.college_id = $1
      ),
      category_stats AS (
        SELECT 
          ec.name as category_name,
          COUNT(e.event_id) as event_count,
          COUNT(er.registration_id) as registration_count
        FROM event_categories ec
        LEFT JOIN events e ON ec.category_id = e.category_id AND e.college_id = $1
        LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.status = 'registered'
        GROUP BY ec.category_id, ec.name
        ORDER BY event_count DESC
      )
      SELECT 
        (SELECT row_to_json(event_stats) FROM event_stats) as event_stats,
        (SELECT row_to_json(registration_stats) FROM registration_stats) as registration_stats,
        (SELECT row_to_json(feedback_stats) FROM feedback_stats) as feedback_stats,
        (SELECT json_agg(category_stats) FROM category_stats) as category_stats
    `;

    const result = await pool.query(dashboardQuery, [req.params.college_id]);
    const data = result.rows[0];

    res.json({
      success: true,
      data: {
        overview: {
          total_events: data.event_stats.total_events,
          published_events: data.event_stats.published_events,
          completed_events: data.event_stats.completed_events,
          upcoming_events: data.event_stats.upcoming_events,
          total_registered_students: data.registration_stats.total_registered_students,
          total_registrations: data.registration_stats.total_registrations,
          total_attendances: data.registration_stats.total_attendances,
          attendance_rate: data.registration_stats.total_registrations > 0 
            ? Math.round((data.registration_stats.total_attendances / data.registration_stats.total_registrations) * 100) 
            : 0,
          total_feedback: data.feedback_stats.total_feedback,
          average_rating: data.feedback_stats.average_rating || 0
        },
        category_breakdown: data.category_stats,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate dashboard report' }
    });
  }
});

// GET /event-categories - Get all event categories
app.get('/event-categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM event_categories ORDER BY name ASC');

    res.json({
      success: true,
      data: result.rows.map(row => ({
        category_id: row.category_id,
        name: row.name,
        description: row.description,
        color_code: row.color_code
      }))
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch event categories' }
    });
  }
});