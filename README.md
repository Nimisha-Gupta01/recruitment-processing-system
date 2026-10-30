# Online Recruitment Processing System

> FSAD (Full Stack Application Development) 
---

## What is this project?

A web-based application that fully automates the end-to-end recruitment lifecycle for an HR division. It connects **Employers** (who post jobs and search candidates) with **Candidates** (who apply for jobs and track their status).

---

## Problem Statement

Manual recruitment processes are slow, paper-heavy, and hard to track. This system eliminates that by providing:
- A portal for employers to post vacancies, search candidates, and schedule interviews
- A portal for candidates to register, set preferences, apply for jobs, and check their status
- Automated email notifications at every stage
- Reports for both employers and candidates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | ReactJS 18 |
| Backend | Spring Boot 3.3.4 |
| ORM | Spring Data JPA + Hibernate 6 |
| Database | MySQL 8 |
| Auth | Spring Security + JWT (jjwt 0.12.6) |
| Email | Spring Mail (JavaMail) |
| Build | Maven 3.9 |
| Java | 21 (SapMachine LTS) |

---

## Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Registration & Login | Role-based auth for Employer and Candidate using JWT |
| 2 | Vacancy Management | Employer posts, edits, closes job vacancies |
| 3 | Candidate Search | Employer filters candidates by qualification, location, salary, merit |
| 4 | Candidate Profile & Preferences | Candidate fills profile, sets job/location/salary preferences |
| 5 | Job Search & Apply | Candidate searches vacancies and applies |
| 6 | Interview Scheduling | Employer schedules interview, updates outcome |
| 7 | Reports | Employer and candidate reports |
| 8 | Email Notifications | Automated emails on status changes |

---

## Project Structure

```
recruitment-processing-system/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/recruitment/
│   │   ├── controller/             # REST controllers
│   │   ├── service/                # Business logic
│   │   ├── entity/                 # JPA entities
│   │   ├── repository/             # Spring Data repositories
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── security/               # JWT filter, config
│   │   └── exception/              # Global exception handler
│   └── src/main/resources/
│       └── application.properties  # DB, JWT, mail config
├── docs/
│   ├── db-schema.sql               # Full MySQL schema (re-runnable)
│   ├── abstract.md                 # Project abstract
│   └── SRS.md                      # Software Requirements Specification
├── CHANGELOG.md                    # Work log — updated every commit
└── README.md                       # This file
```

---

## API Endpoints (implemented so far)

### Module 1 — Auth (Member 1)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/employer` | Register new employer | Public |
| POST | `/api/auth/register/candidate` | Register new candidate | Public |
| POST | `/api/auth/login` | Login (employer or candidate) | Public |

### Module 2 — Vacancy Management (Member 2)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/employer/vacancies` | Post a new vacancy | `ROLE_EMPLOYER` |
| GET | `/api/employer/vacancies` | List employer's own vacancies | `ROLE_EMPLOYER` |
| GET | `/api/employer/vacancies/{id}` | Get single vacancy | `ROLE_EMPLOYER` |
| PUT | `/api/employer/vacancies/{id}` | Edit a vacancy | `ROLE_EMPLOYER` |
| PATCH | `/api/employer/vacancies/{id}/close` | Close a vacancy | `ROLE_EMPLOYER` |

### Module 4 — Candidate Profile & Preferences (Member 2)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/candidate/profile` | Get logged-in candidate's full profile (incl. skills + prefs) | `ROLE_CANDIDATE` |
| PUT | `/api/candidate/profile` | Update profile, skills, location prefs, role prefs | `ROLE_CANDIDATE` |

---

## Local Setup

### Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8 (via Homebrew: `brew install mysql && brew services start mysql`)
- Node.js 18+ (for frontend — coming soon)

### 1. Database Setup
```bash
# Run this once (and any time schema changes)
mysql -u root < docs/db-schema.sql
```

### 2. Configure `application.properties`
File: `backend/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/recruitment_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=        # leave blank if no password set
```

### 3. Run the Backend
```bash
cd backend
mvn spring-boot:run
# OR open in IntelliJ and run RecruitmentSystemApplication.java
```
Server starts at: `http://localhost:8080`

### 4. Test the API
```bash
# Register a candidate
curl -s -X POST http://localhost:8080/api/auth/register/candidate \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"Test@1234"}'

# Login
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","role":"CANDIDATE"}'
```

---

## Team

| Member | Role |
|--------|------|
| Member 1 | Backend — Modules 1, 3, 5 |
| Member 2 | Backend — Modules 2, 4 + Frontend |

---

## Assignment Artifacts

| # | Artifact | Location | Status |
|---|----------|----------|--------|
| 1 | DB Design | `docs/db-schema.sql` | ✅ Done |
| 2 | Architecture Diagram | `docs/` | 🔲 Pending |
| 3 | SRS Document | `docs/SRS.md` | ✅ Done |
| 4 | UI Design | `docs/` | 🔲 Pending |
| 5 | Abstract | `docs/abstract.md` | ✅ Done |
| 6 | PPT | `docs/` | 🔲 Pending |
| 7 | Prototype | `backend/` + `frontend/` | 🔄 In Progress |
