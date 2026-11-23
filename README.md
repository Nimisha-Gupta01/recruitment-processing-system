# RecPro — Online Recruitment Processing System

> FSAD (Full Stack Application Development) | MTECH – BITS Pilani

A web-based application that automates the end-to-end recruitment lifecycle for an HR division, connecting **Employers** (who post jobs, search candidates, and schedule interviews) with **Candidates** (who build profiles, search jobs, apply, and track status in real time).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features & Modules](#features--modules)
- [API Reference](#api-reference)
- [Local Setup — Manual](#local-setup--manual)
- [Local Setup — Docker](#local-setup--docker-recommended)
- [Demo Credentials](#demo-credentials)
- [Application URLs](#application-urls)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)
- [Team](#team)
- [Assignment Artifacts](#assignment-artifacts)

---

## Overview

Manual recruitment processes are slow, paper-heavy, and hard to track. RecPro eliminates that by providing:

- An employer portal to post vacancies, search the candidate pool, schedule interviews, and update outcomes
- A candidate portal to register, build a profile with skills and preferences, search and apply for jobs, and track application status
- Automated email notifications at every status change
- Comprehensive reports for both roles

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.3.1 |
| Routing | React Router DOM | 6.28.0 |
| HTTP Client | Axios | 1.7.7 |
| UI | Bootstrap | 5.3.3 |
| Build Tool | Vite | 5.4.10 |
| Backend | Spring Boot | 3.3.4 |
| ORM | Spring Data JPA + Hibernate | 6.x |
| Database | MySQL | 8.0 |
| Auth | Spring Security + JWT (jjwt) | 0.12.6 |
| Email | Spring Mail (JavaMail / Gmail SMTP) | — |
| Build | Maven | 3.9 |
| Java | 21 (SapMachine LTS) | 21 |
| Containerisation | Docker + Docker Compose | — |

---

## Architecture

Three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│  Browser (React 18 + Vite)      :5173               │
│  Pages: Landing · Login · Register                  │
│         Employer: Dashboard · Vacancies · Applications│
│                   Interviews · Candidate Search      │
│         Candidate: Dashboard · Jobs · Applications  │
│                    Profile                           │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST (Axios + Bearer JWT)
┌─────────────────────▼───────────────────────────────┐
│  Spring Boot 3  :8080                               │
│  Security → JwtAuthFilter → Controllers             │
│  Services → Repositories → JPA/Hibernate            │
└─────────────────────┬───────────────────────────────┘
                      │ JDBC
┌─────────────────────▼───────────────────────────────┐
│  MySQL 8  :3306  · recruitment_db                   │
│  Tables: employers · candidates · vacancies          │
│          applications · interviews · notifications   │
│          candidate_skills · candidate_location_prefs │
│          candidate_role_prefs                        │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
recruitment-processing-system/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/recruitment/
│       │   ├── RecruitmentSystemApplication.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── VacancyController.java
│       │   │   ├── PublicVacancyController.java
│       │   │   ├── CandidateController.java
│       │   │   ├── ApplicationController.java
│       │   │   ├── InterviewController.java
│       │   │   ├── EmployerSearchController.java
│       │   │   └── ResumeController.java
│       │   ├── service/
│       │   │   ├── AuthService.java
│       │   │   ├── VacancyService.java
│       │   │   ├── CandidateService.java
│       │   │   ├── ApplicationService.java
│       │   │   ├── InterviewService.java
│       │   │   └── EmployerSearchService.java
│       │   ├── entity/
│       │   │   ├── Employer.java
│       │   │   ├── Candidate.java
│       │   │   ├── Vacancy.java
│       │   │   ├── Application.java
│       │   │   ├── Interview.java
│       │   │   ├── CandidateSkill.java
│       │   │   ├── CandidateLocationPref.java
│       │   │   └── CandidateRolePref.java
│       │   ├── repository/          # Spring Data JPA repos
│       │   ├── dto/                 # Request / Response DTOs
│       │   ├── security/
│       │   │   ├── JwtUtil.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   └── SecurityConfig.java
│       │   └── exception/
│       │       └── GlobalExceptionHandler.java
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── api/axios.js
│       ├── components/ProtectedRoute.jsx
│       └── pages/
│           ├── LandingPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── employer/
│           │   ├── EmployerDashboard.jsx
│           │   ├── VacancyManagementPage.jsx
│           │   ├── ApplicationsPage.jsx
│           │   ├── InterviewsPage.jsx
│           │   └── CandidateSearchPage.jsx
│           └── candidate/
│               ├── CandidateDashboard.jsx
│               ├── JobSearchPage.jsx
│               ├── MyApplicationsPage.jsx
│               └── CandidateProfile.jsx
├── docs/
│   ├── db-schema.sql            # Full MySQL DDL (re-runnable)
│   ├── seed-data.sql            # Sample data (INSERT IGNORE)
│   ├── SRS.md                   # Software Requirements Specification
│   ├── abstract.md              # Project abstract
│   └── TEST_REPORT.md           # Playwright UI test results
├── docker-compose.yml
├── CHANGELOG.md
└── README.md
```

---

## Features & Modules

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 1 | Registration & Login | Role-based JWT auth for Employer and Candidate | ✅ Done |
| 2 | Vacancy Management | Employer posts, edits, and closes job vacancies | ✅ Done |
| 3 | Candidate Search | Employer filters candidates by qualification, location, salary, merit | ✅ Done |
| 4 | Candidate Profile & Preferences | Candidate fills profile, skills, job/location/salary preferences | ✅ Done |
| 5 | Job Search & Apply | Candidate searches open vacancies and applies (duplicate prevention) | ✅ Done |
| 6 | Interview Scheduling | Employer schedules interviews and updates outcomes | ✅ Done |
| 7 | Reports | Application and interview history for both roles | ✅ Done |
| 8 | Email Notifications | Automated emails on registration, status change (configurable SMTP) | ✅ Wired |

---

## API Reference

All protected endpoints require `Authorization: Bearer <JWT>` header.

### Auth — Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/employer` | Register new employer, returns JWT |
| POST | `/api/auth/register/candidate` | Register new candidate, returns JWT |
| POST | `/api/auth/login` | Login (either role), returns JWT + role |

### Vacancies — Employer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/employer/vacancies` | Post a new vacancy |
| GET | `/api/employer/vacancies` | List own vacancies (newest first) |
| GET | `/api/employer/vacancies/{id}` | Get single vacancy (owner only) |
| PUT | `/api/employer/vacancies/{id}` | Edit a vacancy (owner only) |
| PATCH | `/api/employer/vacancies/{id}/close` | Close a vacancy (owner only) |

### Vacancies — Public (Candidate)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vacancies` | List all Open vacancies (filterable) |

### Candidate Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidate/profile` | Get own profile with skills + preferences |
| PUT | `/api/candidate/profile` | Update profile, skills, prefs (replace-all) |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidate/vacancies/{id}/apply` | Apply for a vacancy (duplicate-safe) |
| GET | `/api/candidate/applications` | Candidate's own application history |
| GET | `/api/employer/applications` | Employer's applications by vacancy |
| PATCH | `/api/employer/applications/{id}/status` | Update application status |

### Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/employer/interviews` | Schedule an interview |
| GET | `/api/employer/interviews` | List interviews for employer's vacancies |
| PUT | `/api/employer/interviews/{id}/outcome` | Update interview outcome |

### Candidate Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employer/candidates/search` | Search candidates with filters (qualification, location, salary, merit) |

### Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidate/resume` | Upload resume (multipart) |
| GET | `/api/candidate/resume` | Download own resume |

---

## Local Setup — Manual

### Prerequisites

- Java 21+
- Maven 3.9+
- MySQL 8 (`brew install mysql && brew services start mysql` on macOS)
- Node.js 18+

### 1. Database

```bash
# Create schema + tables (run once; re-runnable)
mysql -u root < docs/db-schema.sql

# Load sample data (optional — INSERT IGNORE, safe to re-run)
mysql -u root recruitment_db < docs/seed-data.sql
```

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/recruitment_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=          # leave blank if no password
```

For email notifications, replace the Gmail SMTP placeholders:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
# Server starts at http://localhost:8080
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### 5. Quick API Smoke Test

```bash
# Register a candidate
curl -s -X POST http://localhost:8080/api/auth/register/candidate \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"Test@1234"}'

# Login and retrieve JWT
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","role":"CANDIDATE"}'
```

---

## Local Setup — Docker (Recommended)

Runs all three services (MySQL, Spring Boot, React/nginx) together with a single command.

### Prerequisites

- Docker Desktop

### Start

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| MySQL | localhost:3306 |

### Stop

```bash
docker compose down          # keep data volumes
docker compose down -v       # also remove volumes (full reset)
```

### Notes

- The DB container auto-runs all `.sql` files from `docs/` on first start via `docker-entrypoint-initdb.d`.
- The backend waits for MySQL to be healthy before starting (health check configured in `docker-compose.yml`).
- Resume uploads are persisted in a named Docker volume (`uploads`).
- DB root password in Docker: `RecPro2026` (dev only — change before any shared deployment).

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employer | techcorp@example.com | Test@1234 |
| Candidate | priya@example.com | Test@1234 |
| Candidate (secondary) | rahul@example.com | Test@1234 |

> These accounts are created by `docs/seed-data.sql`. Re-run it at any time to reset to the initial state.

---

## Application URLs

| Page | URL |
|------|-----|
| Landing Page | http://localhost:5173 |
| Login | http://localhost:5173/login |
| Register | http://localhost:5173/register |
| Employer Dashboard | http://localhost:5173/employer/dashboard |
| Vacancy Management | http://localhost:5173/employer/vacancies |
| Applications (Employer) | http://localhost:5173/employer/applications |
| Interviews | http://localhost:5173/employer/interviews |
| Candidate Search | http://localhost:5173/employer/search |
| Candidate Dashboard | http://localhost:5173/candidate/dashboard |
| Job Search | http://localhost:5173/candidate/jobs |
| My Applications | http://localhost:5173/candidate/applications |
| My Profile | http://localhost:5173/candidate/profile |

---

## Frontend Pages

| Page | Route | Role |
|------|-------|------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Employer Dashboard | `/employer/dashboard` | EMPLOYER |
| Vacancy Management | `/employer/vacancies` | EMPLOYER |
| Applications | `/employer/applications` | EMPLOYER |
| Interviews | `/employer/interviews` | EMPLOYER |
| Candidate Search | `/employer/search` | EMPLOYER |
| Candidate Dashboard | `/candidate/dashboard` | CANDIDATE |
| Job Search & Apply | `/candidate/jobs` | CANDIDATE |
| My Applications | `/candidate/applications` | CANDIDATE |
| Profile | `/candidate/profile` | CANDIDATE |

Route protection is handled by `ProtectedRoute.jsx`, which checks both token presence and role in `localStorage`. Unauthenticated or wrong-role access redirects to `/login`.

---

## Testing

A full Playwright UI test suite was run against the live stack. All 19 tests passed.

| Category | Tests | Pass |
|----------|-------|------|
| Auth & Security | 4 | 4 |
| Employer — Vacancy Management | 4 | 4 |
| Employer — Applications | 3 | 3 |
| Employer — Interviews | 2 | 2 |
| Employer — Candidate Search | 1 | 1 |
| Candidate — Job Search & Apply | 3 | 3 |
| Candidate — My Applications | 1 | 1 |
| Candidate — Profile | 1 | 1 |
| **Total** | **19** | **19** |

Full test cases, bug list, and fix log: [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md)

---

## Team

| Member | Role |
|--------|------|
| Fassi | Backend — Modules 1 (Auth), 3 (Candidate Search), 5 (Job Search & Apply) |
| Nimisha | Backend — Modules 2 (Vacancies), 4 (Candidate Profile), 6 (Interviews), Frontend |

---

## Assignment Artifacts

| # | Artifact | Location | Status |
|---|----------|----------|--------|
| 1 | DB Schema | `docs/db-schema.sql` | ✅ Done |
| 2 | Architecture Diagram | `docs/architecture-diagram.drawio` | ✅ Done |
| 3 | SRS Document | `docs/SRS.md` · `docs/Artifact3_SRS.pdf` | ✅ Done |
| 4 | UI Design | `docs/Artifact4_UI_Design.pdf` | ✅ Done |
| 5 | Abstract | `docs/abstract.md` · `docs/Artifact5_Abstract.pdf` | ✅ Done |
| 6 | PPT Presentation | `docs/Artifact6_Presentation.pptx` | ✅ Done |
| 7 | Prototype | `backend/` + `frontend/` | ✅ Done |
