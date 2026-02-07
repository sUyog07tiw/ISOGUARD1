# ISOGUARD - Automated ISO/IEC 27001:2022 ISMS Compliance Validator

## Overview
ISOGUARD is a secure, full-stack web application designed to automate and simplify compliance validation against the ISO/IEC 27001:2022 standard. It enables organizations to continuously assess their Information Security Management System (ISMS) maturity.

## Tech Stack

### Backend
- **Framework**: Django 5.1
- **Database**: PostgreSQL
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **File Processing**: PyPDF2, python-docx

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context/Redux

## Project Structure
```
ISOGUARD/
├── backend/                 # Django backend
│   ├── isoguard/           # Main Django project
│   ├── users/           # User authentication & RBAC
│   ├── compliance/         # Compliance analysis & reports
│   ├── documents/          # File upload & processing
│   └── audit/         # Audit logging system
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

1. **Create virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure PostgreSQL:**
   - Create database and user (see Database Setup section)
   - Copy `.env.example` to `.env` and update credentials

4. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Start development server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Setup (PostgreSQL)

### Step 1: Install PostgreSQL
Download and install from https://www.postgresql.org/download/

### Step 2: Create Database and User

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE isoguard_db;

-- Create user with password
CREATE USER isoguard_user WITH PASSWORD 'your_secure_password';

-- Configure user settings
ALTER ROLE isoguard_user SET client_encoding TO 'utf8';
ALTER ROLE isoguard_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE isoguard_user SET timezone TO 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE isoguard_db TO isoguard_user;

-- Connect to the database and grant schema privileges
\c isoguard_db
GRANT ALL ON SCHEMA public TO isoguard_user;
```

### Step 3: Update .env file
```
DB_NAME=isoguard_db
DB_USER=isoguard_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=isoguard_db
DB_USER=isoguard_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# LLM API (OpenAI/Claude)
LLM_API_KEY=your-llm-api-key
LLM_MODEL=gpt-4

# File Upload
MAX_UPLOAD_SIZE_MB=50
ALLOWED_FILE_TYPES=pdf,docx,txt,xlsx
```

## Features
- 📄 Document upload and processing (PDF, DOCX, TXT)
- 🔍 AI-powered compliance analysis against ISO 27001:2022
- 📊 Interactive dashboards with heatmaps and scorecards
- 📈 Compliance percentage calculation
- 🎯 Gap identification and prioritization
- 📝 Actionable remediation recommendations
- 📑 PDF report generation
- 🔐 Role-based access control (RBAC)
- 📋 Comprehensive audit logging
- 🔒 Secure-by-design architecture

## License
This project is developed as a BSIT capstone project.

## Author
BSIT Capstone Project - ISOGUARD Team
