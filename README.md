# Campus Event Management Platform

## Project Overview

This is a platform that makes management events and registrations easier.
This web-based solution has a _Admin Portal_ Used by college staff to create and publish events (hackathons, workshops, tech talks, fests, etc.). and a _Student Portal_ Used by students to browse events, register, and check-in on the event day.
The attandance of the registered student can monitored bu the admin. The admin portal also provides a pictorial report of visual understanding.

## System Architecture

The Campus Event Management Platform follows a three-tier architecture designed to serve both administrative and student needs.
**Core Components:**
_Admin Portal (Web Application)_

- Web-based interface for college staff and administrator
- Provides dashboard functionality for event overview
- creation, editing and publishing events
- Managing users and permissions

_Backend API (NodeJs + PostgreSQL)_

- RESTful APIs with node.js
- SQL database for reliable data persistance
- Authentication and authorization
- CRUD operations on events
- Support for multiple colleges

_Student APP (Mobile)_

- Interface for student interactions
- Browsing and discovering upcoming events in their respective campus
- Self-registration for events

## Features Implemented

- Separate portal for Admin and Students
- Event listing by campus admin
- Adding and managing users (students/staff/admin)
- Student event registration
- Attendance marking system
- Feedback collection
- Event reporting system

## Technology Stack

- **Database:** PostgreSQL
- **Backend:** NodeJs
- **Frontend:** HTML/CSS

## Database Schema

- Users table
- Events table
- Students table
- Registrations table
- Attendance table
- Feedback table

## API Endpoints

**Authentication Endpoints**

- `POST   /auth/login`
- `POST   /auth/logout`

**Event Management**

- `GET    /colleges/{college_id}/events`
- `GET    /colleges/{college_id}/events/{event_id}`
- `POST   /colleges/{college_id}/events`
- `PUT    /colleges/{college_id}/events/{event_id}`
- `DELETE /colleges/{college_id}/events/{event_id}`

**Registration Management**

- `POST   /colleges/{college_id}/events/{event_id}/register`
- `DELETE /colleges/{college_id}/events/{event_id}/register`
- `GET    /colleges/{college_id}/events/{event_id}/registrations`

**Administrative**

- `GET    /event-categories`
- `GET    /colleges/{college_id}`
- `GET    /users/profile`
- `PUT    /users/profile`

## Setup Instructions

### Prerequisites

- Node.js
- NPM
- PostgreSQL

### Installation Steps

1. Clone the repository
2. Setup up Database
3. Install dependencies
4. Run the application

```
cd backend
```

### Installing dependencies

```
npm i
```

### Running the Application

```
npm run dev
```

## Files Structure

```
campus-event-management/
├── backend/
│   ├── app.js
│   ├── database_schema.sql
│   ├── sample_data.sql
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── node_modules/
│   └── test-system.ps1
│
├── frontend/
│   ├── admin-portal/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── app.js
│   │
│   └── student-app/
│       ├── index.html
│       ├── style.css
│       ├── app.js
├── README.md
```

## Author

**K R HARITEJ**

---

**Note:** This project was developed as part of the Webknot Technologies Campus Drive Assignment.
