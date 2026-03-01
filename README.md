# ASTU Smart Complaint & Issue Tracking System — Backend

A production-ready REST API for the **Adama Science and Technology University (ASTU)** smart complaint and issue tracking system.

Students can submit and track complaints, staff can manage complaint workflows, and administrators can monitor operations through analytics and management endpoints.

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

---

## API Base URLs

- Local: `http://localhost:5000`
- Production (Render): `https://astu-smart-complaints-backend.onrender.com`

Versioned API prefix:

- `/api/v1`

Useful routes:

- Root landing route: `/`
- Health: `/api/v1/health`
- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/docs.json`

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
- **API Documentation**: Interactive Swagger UI at `/api/docs`

---

## Project Structure

```
src/
├── config/           # env, DB, Redis, Swagger
├── db/               # migrations and seed
├── middleware/       # auth, RBAC, validation, upload, rate limit, errors
├── modules/
│   ├── admin/
│   ├── analytics/
│   ├── auth/
│   ├── chatbot/
│   ├── complaints/
│   ├── notifications/
│   └── system/
├── services/         # token/email
├── types/
├── utils/
└── server.ts
```

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
pnpm run migrate:dev

# Seed initial data (departments, categories, test users)
pnpm run seed
```

### Development

```bash
pnpm run dev
```

Server starts at `http://localhost:5000`.

Open:

- `http://localhost:5000/`
- `http://localhost:5000/api/v1/health`
- `http://localhost:5000/api/docs`

### Docker

```bash
docker compose up -d --build
```

This starts the API, PostgreSQL, and Redis containers.

---

## Production Deployment (Render)

Set required environment variables in Render:

- `NODE_ENV=production`
- `PORT=5000`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `PUBLIC_API_URL`

Recommended pre-deploy command:

- `pnpm run migrate:dev`

After deploy, verify:

- `/api/v1/health`
- `/api/docs`

## Default Credentials (Seed Data)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@astu.edu.et | Admin@ASTU2026 |
| Staff | it.staff@astu.edu.et | Staff@ASTU2026 |
| Student | student@astu.edu.et | Student@ASTU2026 |

> Important: Change these credentials immediately in non-demo environments.

---

## API Endpoint Summary

All endpoints below are under `/api/v1`.

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register student account |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (denylist token) |
| GET | `/auth/me` | Get current user profile |
| PATCH | `/auth/change-password` | Change password |

### Complaints
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/complaints` | Submit complaint |
| GET | `/complaints` | List complaints (filtered) |
| GET | `/complaints/:id` | Get complaint details |
| PATCH | `/complaints/:id/status` | Update status |
| POST | `/complaints/:id/remarks` | Add remark |
| GET | `/complaints/:id/history` | Audit log |
| DELETE | `/complaints/:id` | Delete (admin) |

### Notifications
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/notifications` | Get notifications |
| PATCH | `/notifications/read-all` | Mark all read |
| PATCH | `/notifications/:id/read` | Mark one read |

### Analytics
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/analytics/summary` | Dashboard summary |
| GET | `/analytics/timeseries` | Time-series report |

### Chatbot
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/chatbot/message` | Chat with AI assistant |

### Admin
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/users` | List users |
| POST | `/admin/users` | Create staff account |
| PATCH | `/admin/users/:id/role` | Update user role |
| PATCH | `/admin/users/:id/deactivate` | Deactivate user |

### Categories & Departments
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category (admin) |
| PATCH | `/categories/:id` | Update category (admin) |
| GET | `/departments` | List departments (admin) |

---

## Testing

```bash
pnpm test
```

Manual smoke-test examples are available at:

- `docs/api-test-examples.md`

---

## Security Notes

- RBAC is enforced across role-sensitive routes.
- Validation and rate limiting are active.
- File uploads are constrained by MIME type and size.
- Parameterized SQL queries are used to reduce injection risk.

See:

- `docs/security-audit-report.md`

---

## License

This project is developed for academic purposes at ASTU.
