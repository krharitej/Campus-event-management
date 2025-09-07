# Campus Event Management Platform - Step-by-Step Build Guide

## 🚀 Let's Build Your System!

Follow these steps to get your Campus Event Management Platform up and running.

## Step 1: Project Setup

### Create Project Directory
```bash
mkdir campus-event-management
cd campus-event-management
```

### Initialize Node.js Project
```bash
npm init -y
```

## Step 2: Install Dependencies

```bash
# Core dependencies
npm install express cors bcrypt jsonwebtoken pg dotenv

# Security and validation
npm install helmet express-rate-limit joi

# Development dependencies  
npm install --save-dev nodemon jest supertest
```

## Step 3: Database Setup

### Install PostgreSQL
**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE campus_events;
CREATE USER campus_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE campus_events TO campus_admin;
\q
```

## Step 4: Project Files

I'll create all the necessary files for you. Save each file in your project directory:

### 4.1 Environment Configuration (.env)
Create `.env` file:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_events
DB_USER=campus_admin
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Step 5: Database Schema

Create the database schema and sample data (files provided above).

## Step 6: Run the Application

```bash
# Development mode
npm run dev

# Or production mode
npm start
```

## Step 7: Test the System

```bash
# Make test script executable
chmod +x test_api.sh

# Run tests
./test_api.sh
```

## Next Steps

1. ✅ Follow this setup guide
2. ✅ Create all project files
3. ✅ Set up database
4. ✅ Test the API endpoints
5. ✅ Generate reports
6. ✅ Complete personal README section
7. ✅ Submit assignment

Your system will be running at http://localhost:3000 with full API capabilities!