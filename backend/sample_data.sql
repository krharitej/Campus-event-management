-- Sample Data for Campus Event Management Platform
-- This data represents a realistic scenario with 3 colleges for testing

-- 1. INSERT SAMPLE COLLEGES
INSERT INTO colleges (college_id, name, code, domain, address, phone, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Massachusetts Institute of Technology', 'MIT', 'mit.edu', '77 Massachusetts Ave, Cambridge, MA 02139', '+1-617-253-1000', 'America/New_York'),
    ('22222222-2222-2222-2222-222222222222', 'Stanford University', 'STANFORD', 'stanford.edu', '450 Jane Stanford Way, Stanford, CA 94305', '+1-650-723-2300', 'America/Los_Angeles'),
    ('33333333-3333-3333-3333-333333333333', 'Indian Institute of Technology Delhi', 'IITD', 'iitd.ac.in', 'Hauz Khas, New Delhi, Delhi 110016', '+91-11-2659-1333', 'Asia/Kolkata');

-- 2. INSERT EVENT CATEGORIES
INSERT INTO event_categories (category_id, name, description, color_code) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hackathon', 'Competitive programming and innovation events', '#e74c3c'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Workshop', 'Educational and skill-building sessions', '#3498db'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tech Talk', 'Industry expert presentations and lectures', '#2ecc71'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Fest', 'Cultural and technical festivals', '#f39c12'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Seminar', 'Academic and research presentations', '#9b59b6');

-- 3. INSERT SAMPLE USERS (Mix of admins, staff, and students)

-- MIT Users
INSERT INTO users (user_id, college_id, email, password_hash, first_name, last_name, role, student_id, department, year_of_study, phone) VALUES
    -- Admin
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin@mit.edu', '$2b$10$hashedpassword1', 'John', 'Admin', 'admin', NULL, 'Administration', NULL, '+1-617-555-0101'),
    -- Staff
    ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'events@mit.edu', '$2b$10$hashedpassword2', 'Sarah', 'Events', 'staff', NULL, 'Student Affairs', NULL, '+1-617-555-0102'),
    -- Students
    ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'alice.johnson@mit.edu', '$2b$10$hashedpassword3', 'Alice', 'Johnson', 'student', '2023001', 'Computer Science', 2, '+1-617-555-0103'),
    ('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'bob.smith@mit.edu', '$2b$10$hashedpassword4', 'Bob', 'Smith', 'student', '2023002', 'Electrical Engineering', 2, '+1-617-555-0104'),
    ('a5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'carol.davis@mit.edu', '$2b$10$hashedpassword5', 'Carol', 'Davis', 'student', '2022001', 'Computer Science', 3, '+1-617-555-0105');

-- Stanford Users
INSERT INTO users (user_id, college_id, email, password_hash, first_name, last_name, role, student_id, department, year_of_study, phone) VALUES
    -- Admin
    ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'admin@stanford.edu', '$2b$10$hashedpassword6', 'David', 'Wilson', 'admin', NULL, 'Administration', NULL, '+1-650-555-0201'),
    -- Students
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'emma.brown@stanford.edu', '$2b$10$hashedpassword7', 'Emma', 'Brown', 'student', '2023101', 'Computer Science', 2, '+1-650-555-0202'),
    ('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'frank.miller@stanford.edu', '$2b$10$hashedpassword8', 'Frank', 'Miller', 'student', '2023102', 'Data Science', 2, '+1-650-555-0203');

-- IIT Delhi Users
INSERT INTO users (user_id, college_id, email, password_hash, first_name, last_name, role, student_id, department, year_of_study, phone) VALUES
    -- Admin
    ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'admin@iitd.ac.in', '$2b$10$hashedpassword9', 'Raj', 'Patel', 'admin', NULL, 'Administration', NULL, '+91-11-555-0301'),
    -- Students
    ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'priya.sharma@iitd.ac.in', '$2b$10$hashedpassword10', 'Priya', 'Sharma', 'student', '2023301', 'Computer Science', 2, '+91-11-555-0302'),
    ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'arjun.singh@iitd.ac.in', '$2b$10$hashedpassword11', 'Arjun', 'Singh', 'student', '2023302', 'Electrical Engineering', 2, '+91-11-555-0303');

-- 4. INSERT SAMPLE EVENTS

-- MIT Events
INSERT INTO events (event_id, college_id, category_id, name, description, location, start_date, end_date, registration_deadline, max_attendees, price, status, created_by) VALUES
    ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MIT HackMIT 2025', 'Annual hackathon bringing together innovative minds', 'MIT Student Center', '2025-10-15 09:00:00', '2025-10-17 18:00:00', '2025-10-10 23:59:59', 200, 0.00, 'published', 'a2222222-2222-2222-2222-222222222222'),
    ('e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Machine Learning Workshop', 'Introduction to ML with hands-on projects', 'Room 32-123', '2025-09-20 14:00:00', '2025-09-20 17:00:00', '2025-09-18 23:59:59', 50, 25.00, 'published', 'a2222222-2222-2222-2222-222222222222'),
    ('e3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'AI in Healthcare Tech Talk', 'Industry experts discuss AI applications in healthcare', 'Stata Center Auditorium', '2025-09-25 18:00:00', '2025-09-25 19:30:00', '2025-09-23 23:59:59', 100, 0.00, 'published', 'a2222222-2222-2222-2222-222222222222');

-- Stanford Events
INSERT INTO events (event_id, college_id, category_id, name, description, location, start_date, end_date, registration_deadline, max_attendees, price, status, created_by) VALUES
    ('e4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TreeHacks 2025', 'Stanford premier hackathon event', 'Tresidder Memorial Union', '2025-11-01 18:00:00', '2025-11-03 15:00:00', '2025-10-25 23:59:59', 300, 0.00, 'published', 'b1111111-1111-1111-1111-111111111111'),
    ('e5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Entrepreneurship Seminar', 'From Idea to IPO: A startup journey', 'CEMEX Auditorium', '2025-09-30 16:00:00', '2025-09-30 18:00:00', '2025-09-28 23:59:59', 75, 15.00, 'published', 'b1111111-1111-1111-1111-111111111111');

-- IIT Delhi Events
INSERT INTO events (event_id, college_id, category_id, name, description, location, start_date, end_date, registration_deadline, max_attendees, price, status, created_by) VALUES
    ('e6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tryst 2025', 'Annual technical and cultural fest', 'IIT Delhi Campus', '2025-12-05 10:00:00', '2025-12-07 22:00:00', '2025-11-30 23:59:59', 1000, 50.00, 'published', 'c1111111-1111-1111-1111-111111111111'),
    ('e7777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Blockchain Development Workshop', 'Learn to build DApps from scratch', 'Computer Science Block', '2025-09-28 10:00:00', '2025-09-28 16:00:00', '2025-09-26 23:59:59', 40, 30.00, 'published', 'c1111111-1111-1111-1111-111111111111');

-- 5. INSERT SAMPLE REGISTRATIONS
INSERT INTO event_registrations (registration_id, event_id, user_id, status, payment_status) VALUES
    -- MIT HackMIT registrations
    ('r1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'registered', 'waived'),
    ('r2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'registered', 'waived'),
    ('r3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'registered', 'waived'),
    
    -- ML Workshop registrations
    ('r4444444-4444-4444-4444-444444444444', 'e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'registered', 'paid'),
    ('r5555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'registered', 'paid'),
    
    -- AI Tech Talk registrations
    ('r6666666-6666-6666-6666-666666666666', 'e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'registered', 'waived'),
    ('r7777777-7777-7777-7777-777777777777', 'e3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'registered', 'waived'),
    
    -- Stanford TreeHacks registrations
    ('r8888888-8888-8888-8888-888888888888', 'e4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'registered', 'waived'),
    ('r9999999-9999-9999-9999-999999999999', 'e4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'registered', 'waived'),
    
    -- IIT Delhi Blockchain Workshop
    ('raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e7777777-7777-7777-7777-777777777777', 'c2222222-2222-2222-2222-222222222222', 'registered', 'paid'),
    ('rbbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'e7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'registered', 'paid');

-- 6. INSERT SAMPLE ATTENDANCE (Some students attended, some didn't)
INSERT INTO event_attendance (attendance_id, registration_id, event_id, user_id, check_in_time, attendance_method, marked_by) VALUES
    -- MIT events attendance
    ('t1111111-1111-1111-1111-111111111111', 'r4444444-4444-4444-4444-444444444444', 'e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', '2025-09-20 14:05:00', 'qr_code', 'a2222222-2222-2222-2222-222222222222'),
    ('t2222222-2222-2222-2222-222222222222', 'r5555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', '2025-09-20 14:10:00', 'manual', 'a2222222-2222-2222-2222-222222222222'),
    ('t3333333-3333-3333-3333-333333333333', 'r6666666-6666-6666-6666-666666666666', 'e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '2025-09-25 18:02:00', 'app', 'a2222222-2222-2222-2222-222222222222');

-- 7. INSERT SAMPLE FEEDBACK
INSERT INTO event_feedback (feedback_id, event_id, user_id, rating, organization_rating, content_rating, comments, would_recommend) VALUES
    ('f1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 5, 5, 5, 'Excellent workshop! Very hands-on and practical.', true),
    ('f2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 4, 4, 4, 'Good content, but could be more advanced.', true),
    ('f3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 5, 5, 5, 'Amazing insights from industry experts!', true);