-- Campus Event Management Platform Database Schema
-- Shared Database, Shared Schema with College Context
-- Author: Campus Event Management Team
-- Date: September 7, 2025

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COLLEGES TABLE (Multi-tenant foundation)
CREATE TABLE colleges (
    college_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- Short code for college (e.g., 'MIT', 'STANFORD')
    domain VARCHAR(100) UNIQUE, -- Email domain for the college
    address TEXT,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    settings JSONB DEFAULT '{}', -- Flexible settings per college
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. EVENT CATEGORIES TABLE
CREATE TABLE event_categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#3498db', -- Hex color for UI
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. USERS TABLE (Students, Staff, Admins)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(college_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'staff', 'student')) NOT NULL,
    student_id VARCHAR(50), -- College-specific student ID
    department VARCHAR(100),
    year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 6), -- For students
    phone VARCHAR(20),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_email_per_college UNIQUE(college_id, email),
    CONSTRAINT unique_student_id_per_college UNIQUE(college_id, student_id)
);

-- 4. EVENTS TABLE (Core entity)
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(college_id) ON DELETE CASCADE,
    category_id UUID REFERENCES event_categories(category_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    college_event_code VARCHAR(20), -- Human-readable code like "HACK2025-001"
    location VARCHAR(255),
    venue_details TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    registration_start TIMESTAMP,
    registration_deadline TIMESTAMP,
    max_attendees INTEGER DEFAULT 0, -- 0 means unlimited
    price DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
    event_image_url TEXT,
    tags TEXT[], -- Array of tags for filtering
    requirements TEXT, -- Special requirements for attendees
    contact_email VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_event_dates CHECK (end_date > start_date),
    CONSTRAINT valid_registration_dates CHECK (registration_deadline <= start_date)
);

-- 5. EVENT REGISTRATIONS TABLE
CREATE TABLE event_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) CHECK (status IN ('registered', 'waitlisted', 'cancelled', 'attended')) DEFAULT 'registered',
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')) DEFAULT 'waived',
    payment_reference VARCHAR(100),
    additional_info JSONB DEFAULT '{}', -- Custom registration fields
    notes TEXT,
    registered_by UUID REFERENCES users(user_id), -- Who registered (for admin registrations)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_registration UNIQUE(event_id, user_id)
);

-- 6. EVENT ATTENDANCE TABLE
CREATE TABLE event_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES event_registrations(registration_id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(event_id), -- Denormalized for faster queries
    user_id UUID NOT NULL REFERENCES users(user_id), -- Denormalized for faster queries
    check_in_time TIMESTAMP DEFAULT NOW(),
    check_out_time TIMESTAMP,
    attendance_method VARCHAR(20) CHECK (attendance_method IN ('qr_code', 'manual', 'rfid', 'app')) DEFAULT 'manual',
    location_checkin VARCHAR(255), -- Where they checked in
    device_info JSONB, -- Mobile device info if checked in via app
    notes TEXT,
    marked_by UUID REFERENCES users(user_id), -- Staff who marked attendance
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_attendance UNIQUE(registration_id)
);

-- 7. EVENT FEEDBACK TABLE
CREATE TABLE event_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
    content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
    venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
    comments TEXT,
    suggestions TEXT,
    would_recommend BOOLEAN,
    is_anonymous BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_feedback UNIQUE(event_id, user_id)
);

-- 8. EVENT ANNOUNCEMENTS TABLE (for updates/notifications)
CREATE TABLE event_announcements (
    announcement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    announcement_type VARCHAR(20) CHECK (announcement_type IN ('info', 'warning', 'urgent', 'cancellation')) DEFAULT 'info',
    target_audience VARCHAR(20) CHECK (target_audience IN ('all', 'registered', 'attended')) DEFAULT 'registered',
    created_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP
);

-- INDEXES for Performance Optimization
-- Core lookup indexes
CREATE INDEX idx_events_college_status ON events(college_id, status);
CREATE INDEX idx_events_college_date ON events(college_id, start_date);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_created_by ON events(created_by);

-- User and registration indexes
CREATE INDEX idx_users_college_role ON users(college_id, role);
CREATE INDEX idx_users_college_email ON users(college_id, email);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_status ON event_registrations(event_id, status);

-- Attendance and feedback indexes
CREATE INDEX idx_attendance_event ON event_attendance(event_id);
CREATE INDEX idx_attendance_user ON event_attendance(user_id);
CREATE INDEX idx_feedback_event ON event_feedback(event_id);
CREATE INDEX idx_feedback_rating ON event_feedback(event_id, rating);

-- Announcement indexes
CREATE INDEX idx_announcements_event ON event_announcements(event_id);

-- FUNCTIONS AND TRIGGERS

-- 1. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Apply updated_at triggers to relevant tables
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Function to handle event capacity and waitlist
CREATE OR REPLACE FUNCTION manage_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_registrations INTEGER;
    max_capacity INTEGER;
BEGIN
    -- Get current registered count and max capacity
    SELECT COUNT(*), e.max_attendees 
    INTO current_registrations, max_capacity
    FROM event_registrations er
    JOIN events e ON e.event_id = er.event_id
    WHERE er.event_id = NEW.event_id 
    AND er.status = 'registered'
    GROUP BY e.max_attendees;
    
    -- If max_attendees is 0, it means unlimited capacity
    IF max_capacity > 0 AND current_registrations >= max_capacity THEN
        NEW.status = 'waitlisted';
    ELSE
        NEW.status = 'registered';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply capacity management trigger
CREATE TRIGGER trigger_manage_event_capacity 
    BEFORE INSERT ON event_registrations 
    FOR EACH ROW EXECUTE FUNCTION manage_event_capacity();

-- 4. Function to auto-generate college event codes
CREATE OR REPLACE FUNCTION generate_college_event_code()
RETURNS TRIGGER AS $$
DECLARE
    college_code VARCHAR(10);
    year_str VARCHAR(4);
    event_count INTEGER;
    new_code VARCHAR(20);
BEGIN
    -- Get college code
    SELECT c.code INTO college_code
    FROM colleges c
    WHERE c.college_id = NEW.college_id;
    
    -- Get current year
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Count existing events for this college in current year
    SELECT COUNT(*) + 1 INTO event_count
    FROM events
    WHERE college_id = NEW.college_id 
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    -- Generate code like "MIT2025-001"
    new_code := college_code || year_str || '-' || LPAD(event_count::TEXT, 3, '0');
    
    NEW.college_event_code = new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply event code generation trigger
CREATE TRIGGER trigger_generate_event_code 
    BEFORE INSERT ON events 
    FOR EACH ROW 
    WHEN (NEW.college_event_code IS NULL)
    EXECUTE FUNCTION generate_college_event_code();