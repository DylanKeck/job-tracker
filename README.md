# job-tracker

Job Tracker is a full-stack TypeScript application for tracking job applications, reminders, profiles, and documents. It includes a Node/Express backend (TypeScript) and a React frontend (Vite + TypeScript), and is designed to run locally or in Docker.

Features
- Manage jobs: add, update, delete, view details
- Track application status and key performance indicators (KPI)
- Reminders for follow-ups and events
- Profile management and authentication (sign-up, sign-in)
- Document uploads linked to jobs
- Simple charts and recent activity widgets on the dashboard

Tech stack
- Backend: Node.js, Express, TypeScript
- Frontend: React, Vite, TypeScript, React Router
- Database: PostgreSQL (SQL file included)
- Containerization: Docker, docker-compose

Repository structure (top-level)
- backend/ — TypeScript Express API
  - src/ — controllers, routes, utils, app entry
- frontend/ — React + Vite app
  - app/ — components, layouts, routes
  - public/ — static assets
- sql/ — tracker.sql (schema / seed)
- docker-compose.yml & docker-compose.override.yml — local and override compose files
- production.yml — production deployment compose file
- project.env — environment variable template

Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker & Docker Compose (if using containers)
- PostgreSQL (if running backend without Docker)

Environment
- Copy project.env and fill values before running locally or with Docker.
- Example variables you should provide:
  - DATABASE_URL or individual DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
  - SESSION_SECRET
  - EMAIL_ configuration (if email features are used)

Run locally (development)
1. Backend
   - cd backend
   - npm install
   - copy and edit project.env (or set env vars)
   - npm run dev (or the start script defined in backend/package.json)

2. Frontend
   - cd frontend
   - npm install
   - npm run dev
   - Open http://localhost:5173 (or the port shown by Vite)

Run with Docker (recommended for parity)
1. Ensure project.env is configured and Docker is running.
2. From the repository root:
   - docker-compose up --build
3. Services started typically include: frontend, backend, database, reverse-proxy (if configured). Check docker-compose.yml for exact service names and ports.

Database
- A SQL schema is provided at sql/tracker.sql. If you run the database via Docker, the compose file will handle initialization (check docker-compose.yml). If using a local DB, apply the SQL schema to create tables.

API overview (backend/src/apis)
- Auth & Users
  - POST /api/sign-up — register a new user
  - POST /api/sign-in — authenticate
  - GET /api/sign-in/activate — activation endpoints (if used)
- Jobs
  - GET /api/jobs — list jobs
  - GET /api/jobs/:id — job detail
  - POST /api/jobs — create job
  - PUT /api/jobs/:id — update job
  - DELETE /api/jobs/:id — delete job
- Reminders
  - GET /api/reminders — list reminders
  - POST /api/reminders — create reminder
- Documents
  - Routes under /api/document for uploading and retrieving documents

Frontend routes (app/routes)
- / — Home
- /dashboard — Dashboard (charts, KPIs, recent activity)
- /jobs — Jobs list
- /jobs/:id — Job detail
- /jobs/new or /add-job — Add job form
- /reminders — Reminders
- /profile — User profile
- /signup, /login, /logout — Auth flows
- /settings — User settings

Development notes
- The frontend contains a layout component at app/layouts/navbar.tsx that controls the main navigation. When changing the UI, follow the same design/structure used by the navbar for consistency (CSS variables, classes, and layout patterns are used across components).
- Loaders and actions for routes live under frontend/app/utils/loaders and actions respectively.
- Backend utilities (auth, database connection, response helpers) are under backend/src/utils.

Testing & linting
- Check package.json scripts in each of backend/ and frontend/ for available scripts (lint, test, build).

Building for production
- Frontend: npm run build inside frontend/ (Vite build)
- Backend: build TypeScript to JavaScript according to backend/package.json (check build script)
- Alternatively run the provided production Docker composition: docker-compose -f production.yml up --build

Contributing
- Fork the repository, create a feature branch, and open a pull request with a clear description.
- Follow existing TypeScript/React coding patterns and run lint/tests before submitting.

License
- This project includes a LICENSE file in the repository root. Follow the terms described there.

Contact
- For questions about this repository, open an issue with reproduction steps or feature requests.

---
This README gives a concise overview and instructions to get started. Refer to backend/ and frontend/ package.json scripts for exact commands and to project.env for required environment variables.
