# ASTU Smart Complaint & Issue Tracking System — Backend

A robust REST API built for the **Adama Science and Technology University (ASTU)** campus complaint management system. Students can submit, track, and manage complaints while staff and admin users handle resolution workflows, analytics, and system administration.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 20 |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Auth | JWT (access + refresh tokens) |
| Email | Nodemailer (SMTP) |
| AI Chatbot | OpenAI GPT |
| Docs | OpenAPI / Swagger UI |
| Container | Docker & Docker Compose |

## Features

- **Authentication & Authorization**: Register, login, JWT issuance, refresh token rotation, password change, account lockout
- **Role-Based Access Control**: Student, Staff, Admin roles with fine-grained permissions
- **Complaint Management**: Submit, track, filter, paginate, update status, add remarks
- **File Attachments**: Secure upload with MIME validation and size limits
- **Status Lifecycle**: Open → In Progress → Resolved → Closed (with Reopen support)
- **Notifications**: In-app notification engine with read/unread tracking
- **Email Alerts**: Automatic email on complaint submission and status updates
- **Analytics Dashboard**: Per-role statistics, department reports, resolution metrics
- **AI Chatbot**: Campus assistant powered by OpenAI for complaint triage
- **Admin Panel**: User management, category/department CRUD, role moderation
- **API Documentation**: Interactive Swagger UI at `/api-docs`

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 8
- PostgreSQL 15+
- Redis 7+ (optional, falls back to in-memory)

### Installation

```bash
# Clone the repository
git clone https://github.com/fahamijemal/astu-smart-complaints-backend.git
cd astu-smart-complaints-backend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database credentials, JWT secrets, etc.
```

### Database Setup

```bash
# Run migrations
pnpm ts-node src/db/migrate.ts

# Seed initial data (departments, categories, test users)
pnpm ts-node src/db/seed.ts
```

### Development

```bash
pnpm run dev
```

Server starts at `http://localhost:5000`. API docs available at `http://localhost:5000/api-docs`.

### Docker

```bash
docker-compose up -d
```

This starts the API, PostgreSQL, and Redis containers.

## Default Credentials (Seed Data)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@astu.edu.et | Admin@ASTU2026 |
| Staff | it.staff@astu.edu.et | Staff@ASTU2026 |
| Student | student@astu.edu.et | Student@ASTU2026 |

## API Endpoints

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register student account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (denylist token) |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/change-password` | Change password |

### Complaints
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/complaints` | Submit complaint |
| GET | `/api/complaints` | List complaints (filtered) |
| GET | `/api/complaints/:id` | Get complaint details |
| PATCH | `/api/complaints/:id/status` | Update status |
| POST | `/api/complaints/:id/remarks` | Add remark |
| GET | `/api/complaints/:id/history` | Audit log |
| DELETE | `/api/complaints/:id` | Delete (admin) |

### Notifications
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/read-all` | Mark all read |
| PATCH | `/api/notifications/:id/read` | Mark one read |

### Analytics
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/report` | System report (admin) |

### Chatbot
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/chatbot/message` | Chat with AI assistant |

### Admin
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/users` | Create staff account |
| PATCH | `/api/admin/users/:id/role` | Update user role |
| PATCH | `/api/admin/users/:id/deactivate` | Deactivate user |

## Project Structure

```
src/
├── config/          # Environment, database, Redis, Swagger config
├── db/              # Migrations and seed scripts
├── middleware/       # Auth, RBAC, validation, rate limiting, upload, error handling
├── modules/
│   ├── admin/       # Admin service, controller, routes
│   ├── analytics/   # Dashboard stats and reports
│   ├── auth/        # Authentication and authorization
│   ├── chatbot/     # AI chatbot integration
│   ├── complaints/  # Complaint CRUD and lifecycle
│   └── notifications/ # In-app notifications
├── services/        # Email and token services
├── types/           # TypeScript interfaces
├── utils/           # Logger, AppError, response helpers
└── server.ts        # Express app bootstrap
```

## License

This project is developed for academic purposes at ASTU.
