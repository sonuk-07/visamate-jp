# VisaMate Japan

A comprehensive visa consulting web application for students seeking to study abroad in Japan. The platform provides appointment booking, applicant management, and consulting services.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Email System](#email-system)
- [Environment Variables](#environment-variables)

---

## Overview

VisaMate Japan is a full-stack web application that helps:
- **Students** book consultations, track their visa applications, and prepare for study abroad
- **Consultants** manage appointments, view applicant information, and communicate with clients
- **Admins** manage users, appointment slots, and system settings

### Key Features

- 🔐 **User Authentication**: JWT-based authentication with token refresh
- 📅 **Appointment Booking**: Multi-step wizard with calendar date selection
- 📧 **Email Notifications**: Automated confirmation emails for bookings
- 👤 **User Profiles**: Personal dashboard with appointment history
- 📄 **Document Management**: Upload and manage application documents
- 🌐 **Multi-language Support**: Language context for internationalization

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Django 6.0.3 | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT authentication |
| SQLite | Development database |
| python-dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| date-fns | Date manipulation |
| Lucide React | Icons |
| Sonner | Toast notifications |

---

## Project Structure

```
visamate-jp/
├── backend/                    # Django backend
│   ├── core/                   # Django project settings
│   │   ├── settings.py         # Main configuration
│   │   ├── urls.py             # Root URL routing
│   │   └── wsgi.py             # WSGI entry point
│   ├── agency/                 # Agency/admin app (future)
│   ├── applicants/             # Applicant management
│   │   ├── models.py           # Applicant, Document models
│   │   ├── views.py            # REST API endpoints
│   │   └── serializers.py      # DRF serializers
│   ├── appointments/           # Appointment booking
│   │   ├── models.py           # Appointment, AppointmentSlot models
│   │   ├── views.py            # Booking API endpoints
│   │   ├── serializers.py      # DRF serializers
│   │   └── emails.py           # Email notification functions
│   ├── common/                 # Shared functionality
│   │   ├── models.py           # Settings, ContactMessage models
│   │   ├── views.py            # Auth & contact endpoints
│   │   └── serializers.py      # User, register serializers
│   ├── .env                    # Environment variables (gitignored)
│   ├── .env.example            # Environment template
│   └── manage.py               # Django CLI
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/                # API client modules
│   │   │   └── djangoClient.js # Axios API wrapper
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── home/           # Home page sections
│   │   ├── lib/                # Utilities & context
│   │   │   ├── AuthContext.jsx # Authentication context
│   │   │   └── utils.js        # Helper functions
│   │   ├── pages/              # Page components
│   │   │   ├── AppointmentBooking.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   └── auth/           # Login, Signup pages
│   │   ├── App.jsx             # Main app component
│   │   └── Layout.jsx          # App layout wrapper
│   ├── package.json            # Dependencies
│   └── vite.config.js          # Vite configuration
│
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv

# Copy environment template and configure
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed appointment slots (optional)
python manage.py shell
# Run the slot seeding script

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/token/` | Get JWT tokens | No |
| POST | `/api/token/refresh/` | Refresh access token | No |
| POST | `/api/register/` | Register new user | No |
| GET | `/api/profile/` | Get user profile | Yes |
| PATCH | `/api/profile/` | Update user profile | Yes |

### Appointment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/appointment-slots/` | List available slots | No |
| GET | `/api/appointment-slots/available/` | List non-booked slots | No |
| GET | `/api/appointment-slots/dates_with_slots/` | Get bookable dates | No |
| POST | `/api/appointments/` | Create appointment | No |
| GET | `/api/appointments/` | List user's appointments | Yes |
| GET | `/api/appointments/my_appointments/` | Get current user's appointments | Yes |
| POST | `/api/appointments/{id}/cancel/` | Cancel appointment | Yes |

### Applicant Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/applicants/` | Create applicant profile | No |
| GET | `/api/applicants/` | List applicants | Yes |
| GET | `/api/applicants/{id}/` | Get applicant details | Yes |

### Document Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/documents/` | List user's documents | Yes |
| POST | `/api/documents/` | Upload document | Yes |
| DELETE | `/api/documents/{id}/` | Delete document | Yes |

### Contact Endpoint

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/contact/` | Submit contact form | No |

---

## Frontend Architecture

### State Management

- **AuthContext**: Manages user authentication state, login/logout, token storage
- **React Query**: (if used) Caches API responses and handles loading states
- **Local State**: Component-level state for forms and UI

### Key Components

| Component | Purpose |
|-----------|---------|
| `Layout.jsx` | App wrapper with navigation |
| `AppointmentBooking.jsx` | Multi-step booking wizard |
| `Dashboard.jsx` | User dashboard with appointments |
| `AuthContext.jsx` | Authentication provider |
| `djangoClient.js` | Configured Axios API client |

### Routing

Routes are defined in `App.jsx` using React Router v6:

```jsx
/               → Home
/login          → Login page
/signup         → Registration page
/dashboard      → User dashboard (protected)
/profile        → User profile (protected)
/book-appointment → Appointment booking
/visa-guidance  → Visa information
/university-selection → University info
/application-support → Application help
/pre-departure  → Pre-departure prep
```

---

## Backend Architecture

### Django Apps

| App | Responsibility |
|-----|----------------|
| `core` | Project settings, root URLs, WSGI |
| `agency` | Admin/consultant features (future) |
| `applicants` | Applicant profiles and documents |
| `appointments` | Booking system and email notifications |
| `common` | Auth, settings, contact forms |

### Models Overview

```
AppointmentSlot
├── date, start_time, end_time
├── service_type
├── max_bookings, current_bookings
└── is_available (computed)

Appointment
├── user (FK to User)
├── slot (FK to AppointmentSlot)
├── full_name, email, phone
├── status (pending/confirmed/cancelled/completed)
└── created_at, updated_at

Applicant
├── user (FK to User)
├── first_name, last_name, email, phone
├── passport_number, status
└── documents (reverse FK)

Document
├── applicant (FK to Applicant)
├── title, file
└── uploaded_at
```

---

## Email System

The application sends automated emails for:

1. **Appointment Confirmation**: HTML email to customer after booking
2. **Admin Notification**: Plain-text email to admin about new bookings

### Configuration

Emails are sent via SMTP (Gmail by default). Configure in `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
```

### Testing Emails

```python
# Django shell
from appointments.emails import send_appointment_confirmation
from appointments.models import Appointment

appointment = Appointment.objects.first()
send_appointment_confirmation(appointment)
```

---

## Environment Variables

### Backend (.env)

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com

# Database (optional, defaults to SQLite)
# DATABASE_URL=postgres://user:pass@localhost/dbname
```

### Frontend

The frontend uses hardcoded API URL (`http://localhost:8000/api/`).
For production, create a `.env` file:

```env
VITE_API_URL=https://api.yoursite.com/api/
```

---

## Development Notes

### Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (if configured)
cd frontend
npm test
```

### Code Style

- **Backend**: PEP 8, docstrings for all modules/classes/functions
- **Frontend**: ESLint, JSDoc comments for components

### Common Tasks

```bash
# Create new Django app
cd backend && python manage.py startapp appname

# Generate migrations
python manage.py makemigrations

# Access Django shell
python manage.py shell

# Clear cache and rebuild frontend
cd frontend && rm -rf node_modules/.vite && npm run dev
```

---

## License

Proprietary - VisaMate Japan

---

## Contributing

1. Create a feature branch from `main`
2. Make changes with appropriate documentation
3. Test locally
4. Submit a pull request

For questions, contact the development team.
