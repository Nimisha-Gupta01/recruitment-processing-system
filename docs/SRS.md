# Software Requirements Specification (SRS)
## Online Recruitment Processing System

**Document Version:** 2.2  
**Date:** November 2026  
**Course:** Full Stack Application Development (FSAD)  
**Institute:** BITS Pilani, Work Integrated Learning Programmes (WILP)  
**Team:** 2 Members — Nimisha Gupta & Fassi (MTECH — BITS Pilani)  
**Standard:** IEEE 830-1998  
**Assignment Reference:** KT_RecruitmentProcessing System_009

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Architecture](#5-system-architecture)
6. [Module Descriptions](#6-module-descriptions)
7. [API Specification](#7-api-specification)
8. [Database Design](#8-database-design)
9. [Security Design](#9-security-design)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Use Cases](#11-use-cases)
12. [Implementation Status](#12-implementation-status)
13. [Tech Stack](#13-tech-stack)
14. [Appendix](#14-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the **Online Recruitment Processing System** — a full-stack web application that automates end-to-end recruitment operations for HR departments and enables candidates to search, apply, and track job applications online.

This document reflects the **actual implemented state of the codebase** as verified from source files, and clearly maps each feature to its implementation phase. It serves as the authoritative reference for all team members, evaluators, and the project examiner, structured per **IEEE 830-1998**.

### 1.2 Scope

**System Name:** Online Recruitment Processing System  
**Repository:** `recruitment-processing-system` (GitHub, `main` branch)

The system covers the full recruitment lifecycle:

```
Vacancy Posted → Candidate Applies → Employer Searches & Shortlists
→ Interview Scheduled → Outcome Updated → Candidate Notified
```

Two primary user types:

- **Employers** — register their organization, post job vacancies, search and filter candidates by skills and preferences, schedule interviews, and record hiring outcomes.
- **Candidates** — register profiles with academic background, skills, and job preferences; search and apply for vacancies; track application status.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| Employer | An HR representative of an organization using the system to hire candidates |
| Candidate | A job seeker who registers and applies through the system |
| Vacancy | A job opening posted by an employer |
| Application | A candidate's submission record for a specific vacancy |
| Interview | A scheduled meeting between an employer and a candidate |
| JWT | JSON Web Token — stateless authentication token |
| SPA | Single-Page Application — the React frontend |
| JPA | Java Persistence API — ORM layer (Hibernate 6) |
| RBAC | Role-Based Access Control |
| DTO | Data Transfer Object — input/output contract for API endpoints |
| REST | Representational State Transfer |
| SMTP | Simple Mail Transfer Protocol — used for email notifications |
| FSAD | Full Stack Application Development |
| MTECH | Master of Technology |

### 1.4 References

- IEEE 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- Assignment Specification: KT_RecruitmentProcessing System_009
- Spring Boot 3.3.4 Reference Documentation
- Spring Security 6 Reference Documentation
- jjwt 0.12.6: https://github.com/jwtk/jjwt
- React 18 Documentation: https://react.dev/
- MySQL 8.0 Reference Manual
- Project Database Schema: `docs/db-schema.sql`
- Project Changelog: `CHANGELOG.md`
- Project README: `README.md`

---

## 2. Overall Description

### 2.1 Product Perspective

The Online Recruitment Processing System is a **three-tier web application**:

```
┌────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                              │
│               React 18 SPA  (Vite — Port 3000)                    │
│                                                                    │
│  Login · Register · Employer Dashboard · Post/Edit Vacancy         │
│  Candidate Profile · Job Search · My Applications                  │
│  Interview Schedule · Reports                                      │
│                                                                    │
│  AuthContext (JWT in localStorage) · Axios + Bearer interceptor    │
│  React Router v6 · Tailwind CSS · PrivateRoute guards             │
│                       [Frontend — in development]                  │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │ Authorization: Bearer <JWT>
┌──────────────────────────▼─────────────────────────────────────────┐
│                       APPLICATION LAYER                            │
│             Spring Boot 3.3.4  REST API  (Port 8080)              │
│                                                                    │
│  AuthController       /api/auth/**        (public)                │
│  VacancyController    /api/employer/**    (ROLE_EMPLOYER only)     │
│  CandidateController  /api/candidate/**   (ROLE_CANDIDATE only)    │
│                                                                    │
│  Spring Security 6 (STATELESS) · JwtAuthFilter (jjwt 0.12.6)     │
│  Spring Data JPA + Hibernate 6 · Bean Validation (Jakarta)        │
│  GlobalExceptionHandler  (400 / 403 / 500)                        │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ JDBC (HikariCP)
┌──────────────────────────▼─────────────────────────────────────────┐
│                         DATA LAYER                                 │
│                    MySQL 8.0  (Port 3306)                          │
│                                                                    │
│  employers · candidates · candidate_skills                         │
│  candidate_location_prefs · candidate_role_prefs                   │
│  vacancies · applications · interviews · notifications             │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ SMTP (TLS, Port 587)
┌──────────────────────────▼─────────────────────────────────────────┐
│                      EXTERNAL SERVICE                              │
│               Spring Mail / JavaMail (smtp.gmail.com)              │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Product Functions (Summary)

| # | Function | Description |
|---|----------|-------------|
| 1 | Employer Registration & Login | Register org + contact details; JWT login returning `ROLE_EMPLOYER` |
| 2 | Candidate Registration & Login | Register personal/academic details; JWT login returning `ROLE_CANDIDATE` |
| 3 | Vacancy Management | Create, read, update, close job vacancies (employer-owned) |
| 4 | Candidate Profile Management | Candidates maintain personal info, academic record, skills, location/role preferences |
| 5 | Candidate Search | Employers filter candidates by qualification, skills, location, salary, merit |
| 6 | Job Search & Apply | Candidates view open vacancies, filter, apply (one application per vacancy enforced) |
| 7 | Interview Scheduling | Schedule interviews for applicants; date, mode, venue, round, interviewer |
| 8 | Interview Outcome Tracking | Record outcomes; application status auto-updates; candidate notified |
| 9 | Email Notifications | Emails on registration, interview scheduled, status changes |
| 10 | Reports | Employer: vacancy + interview reports; Candidate: application history |

### 2.3 User Classes

| User Class | Description | Enforced Route Prefix |
|------------|-------------|----------------------|
| Employer | HR representative — posts jobs, manages candidates, schedules interviews | `/api/employer/**` (`ROLE_EMPLOYER`) |
| Candidate | Job seeker — manages profile, applies for jobs, tracks applications | `/api/candidate/**` (`ROLE_CANDIDATE`) |
| Public (unauthenticated) | Registration and login only | `/api/auth/**` |

No Admin user class is in scope for v1. Database administration is done directly via MySQL.

### 2.4 Assumptions and Constraints

- Internet connectivity required for SMTP email notifications.
- Valid SMTP credentials must be configured in `application.properties`.
- One employer account per contact email (enforced by `UNIQUE` constraint on `employers.email`).
- One candidate account per email (enforced by `UNIQUE` constraint on `candidates.email`).
- Candidates must register and log in before applying to vacancies.
- One application per candidate per vacancy (enforced by `UNIQUE KEY uq_application (vacancy_id, candidate_id)` in the database).
- JWT tokens expire after 24 hours (`app.jwt.expiration-ms=86400000`). No refresh token mechanism in v1.
- Schema changes require manually re-running `docs/db-schema.sql` (`ddl-auto=validate`; Hibernate does not auto-modify schema).
- Passwords are stored as BCrypt hashes — never in plaintext, never returned in any response.
- Lombok is declared as a dependency in `pom.xml` but **no Lombok annotations are used** in any source file — all entities and DTOs use explicit getters/setters. This ensures compatibility with Java 21 and Java 25.

---

## 3. Functional Requirements

### 3.1 Registration & Login Module (Module 1)

**FR-1.1** The system shall allow employers to register with the following fields:
- `orgName` *(required)*, `contactName` *(required)*, `email` *(required, unique, valid format)*, `password` *(required, min 6 chars)*
- Optional: `establishedYr`, `numEmployees`, `annualTurnover`, `phone`, `address`, `website`

**FR-1.2** The system shall allow candidates to register with:
- `fullName` *(required)*, `email` *(required, unique, valid format)*, `password` *(required, min 6 chars)*
- Optional at registration: `phone`, `dob` (ISO date string `YYYY-MM-DD`), `gender` (`Male`/`Female`/`Other`), `address`
- Optional academic: `degree`, `institution`, `yearOfPassing`, `percentage`
- Optional experience/salary: `totalExpYrs` (default 0), `expectedSalMin`, `expectedSalMax`

**FR-1.3** Both registration endpoints return an `AuthResponse` immediately upon success — no separate login step needed after registration.

**FR-1.4** The login endpoint requires `email`, `password`, and `role` (`"EMPLOYER"` or `"CANDIDATE"`). It validates BCrypt-hashed passwords and returns an `AuthResponse`.

**FR-1.5** `AuthResponse` contains: `token` (signed JWT), `role` (`"EMPLOYER"` or `"CANDIDATE"`), `userId` (integer PK), `name` (contact name for employer, full name for candidate).

**FR-1.6** Duplicate email registration for the same role shall return HTTP 400 with `{"error": "Email already registered"}`.

**FR-1.7** All endpoints under `/api/employer/**` and `/api/candidate/**` require a valid `Authorization: Bearer <token>` header. Requests without a valid token receive HTTP 401. Cross-role access (e.g., candidate token on employer endpoint) receives HTTP 403.

---

### 3.2 Employer — Vacancy Management (Module 2)

**FR-2.1** Authenticated employers shall post job vacancies with:
- `designation` *(required)*, `employmentType` *(required)*: `Permanent` | `Temporary` | `Contract`
- Optional: `department`, `jobDescription`, `requiredQual`, `requiredExpYrs` (default 0), `salaryMin`, `salaryMax`, `numOpenings` (default 1), `location`, `applicationDeadline` (`YYYY-MM-DD`)

**FR-2.2** Newly posted vacancies default to status `Open`.

**FR-2.3** Employers shall list only their own vacancies, ordered by `postedAt` descending.

**FR-2.4** Employers shall fetch a single vacancy by ID. If the vacancy belongs to a different employer, HTTP 403 is returned.

**FR-2.5** Employers shall update any subset of vacancy fields (partial update — only non-null fields in the request body are applied). Status can be set to `Open`, `Closed`, or `On_Hold`.

**FR-2.6** A dedicated PATCH endpoint shall close a vacancy by setting its status to `Closed`.

**FR-2.7** All vacancy mutation operations enforce ownership: `VacancyService.assertOwner` throws `SecurityException("Access denied")` if the authenticated employer's email does not match the vacancy's owner, which maps to HTTP 403.

---

### 3.3 Employer — Candidate Search & Scan (Module 3) *(Planned — Fassi)*

**FR-3.1** Authenticated employers shall search candidates using query parameters:
- `role` (preferred job role), `location` (preferred location), `salaryMin`/`salaryMax` (salary expectation range), `qualification` (degree match), `minPercentage` (merit threshold)

**FR-3.2** Search results shall be a ranked list of matching candidates — higher merit and closer preference match ranked first.

**FR-3.3** Employers shall view the full profile of any candidate returned in search results.

---

### 3.4 Candidate — Profile & Preferences (Module 4)

**FR-4.1** Authenticated candidates shall view their full profile including all personal, academic, experience, salary, skills, and preference data.

**FR-4.2** Authenticated candidates shall update their profile via a PUT request. The update is a partial merge — only non-null fields in the request body are applied to the candidate record.

**FR-4.3** Skills, location preferences, and role preferences are fully replaced on each update. The service calls `deleteByCandidate_CandidateId` on each preference repository then re-inserts. Passing an empty list clears all entries.

**FR-4.4** Candidates shall specify multiple skills, each with proficiency `Beginner` | `Intermediate` | `Expert` (default: `Intermediate`).

**FR-4.5** Candidates shall specify multiple preferred locations and multiple preferred job roles.

**FR-4.6** `updateProfile` runs within a `@Transactional` boundary — if any step fails, the entire update rolls back.

---

### 3.5 Candidate — Job Search & Apply (Module 5) *(Planned — Fassi)*

**FR-5.1** Authenticated candidates shall view all vacancies with status `Open`.

**FR-5.2** Candidates shall filter vacancies by location, salary range, employment type, and required qualification.

**FR-5.3** Candidates shall apply for a vacancy with one action. The candidate's registered profile is auto-submitted. An optional cover note may be included.

**FR-5.4** Duplicate applications are prevented by `UNIQUE KEY uq_application (vacancy_id, candidate_id)`. A second apply attempt shall return HTTP 409 Conflict.

**FR-5.5** Vacancies matching the candidate's stored role and location preferences shall be ranked higher or highlighted.

**FR-5.6** A new application defaults to status `Applied`.

---

### 3.6 Interview Scheduling & Outcome (Module 6) *(Planned — Nimisha)*

**FR-6.1** Authenticated employers shall schedule an interview for any candidate who applied to one of their vacancies.

**FR-6.2** Interview details: `interviewDatetime` *(required)*, `mode` *(required)*: `In-Person` | `Online` | `Telephonic`; optional: `venue`, `roundNumber` (default 1), `interviewerName`, `remarks`.

**FR-6.3** Scheduling an interview shall trigger an email to the candidate with full details.

**FR-6.4** The linked application status shall update to `Interview Scheduled` when an interview is created.

**FR-6.5** Employers shall update interview outcome: `Scheduled` | `Completed` | `Cancelled` | `Selected` | `Rejected`.

**FR-6.6** Outcomes of `Selected` or `Rejected` shall update the linked application status and send an email notification to the candidate.

---

### 3.7 Reports (Module 7) *(Planned — Nimisha)*

**FR-7.1** Authenticated employers shall generate:
- All their vacancies with applicant count per vacancy
- Interview schedule for a date range
- Candidates selected/rejected per vacancy

**FR-7.2** Authenticated candidates shall view:
- All applications submitted with current status
- Interview history per application

---

### 3.8 Email Notifications (Module 8) *(Planned — Nimisha)*

**FR-8.1** The system shall email candidates for: successful registration, interview scheduled (with full details), status change (Selected / Offered / Recruited / Rejected).

**FR-8.2** The system shall email employers for: successful registration, new application received on any of their vacancies.

**FR-8.3** All email attempts shall be logged in the `notifications` table with `event_type`, `recipient_email`, `subject`, `body`, `sent_at`, `status` (`Sent` | `Failed`).

**FR-8.4** Email failure shall not prevent the primary operation (registration, interview scheduling, etc.) from completing. Failure is logged; the primary response still succeeds.

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Performance | All standard API responses shall complete under 2 seconds on a local development machine |
| NFR-2 | Security | Passwords stored using BCryptPasswordEncoder (Spring Security default, cost 10) — never in plaintext |
| NFR-3 | Security | JWTs signed with HMAC-SHA256; secret key at least 32 characters; externalized via `application.properties` |
| NFR-4 | Security | Session policy is `STATELESS` — no server-side session; token validated per request via `JwtAuthFilter` |
| NFR-5 | Security | Route-level RBAC: `/api/employer/**` requires `ROLE_EMPLOYER`, `/api/candidate/**` requires `ROLE_CANDIDATE`; cross-role returns HTTP 403 |
| NFR-6 | Security | CORS restricted to `http://localhost:3000` by default; configurable via `app.cors.allowed-origins` |
| NFR-7 | Data Integrity | All FK constraints enforced at database level (MySQL InnoDB) |
| NFR-8 | Data Integrity | Duplicate application prevented by `UNIQUE KEY uq_application (vacancy_id, candidate_id)` in the database |
| NFR-9 | Reliability | All API error responses are structured JSON — never raw HTML or stack traces |
| NFR-10 | Reliability | Bean Validation errors return HTTP 400 with a map of `{fieldName: errorMessage}` |
| NFR-11 | Scalability | Stateless backend supports horizontal scaling; no server-side session state |
| NFR-12 | Usability | React frontend shall be responsive on desktop (≥1280px) and tablet (≥768px) |
| NFR-13 | Compatibility | Frontend shall work in Chrome, Firefox, Edge (latest 2 versions each) |
| NFR-14 | Maintainability | All entities and DTOs use explicit getters/setters — no Lombok annotations in any source file — ensuring compatibility with Java 21 and Java 25 |
| NFR-15 | Portability | Backend runs on any OS with Java 21+ and Maven 3.9+; frontend runs on any OS with Node.js 18+ |

---

## 5. System Architecture

### 5.1 Layered Backend Architecture

The backend follows a strict four-layer architecture. Data flows strictly downward; each layer depends only on the one below it.

```
HTTP Request
     │
     ▼
Controller Layer       — receives HTTP, validates input via @Valid, delegates to service
     │                   (AuthController, VacancyController, CandidateController)
     ▼
Service Layer          — business logic, transactions (@Transactional), throws exceptions
     │                   (AuthService, VacancyService, CandidateService)
     ▼
Repository Layer       — Spring Data JPA interfaces; derived queries + JPQL
     │                   (EmployerRepository, CandidateRepository, VacancyRepository,
     │                    CandidateSkillRepository, CandidateLocationPrefRepository,
     │                    CandidateRolePrefRepository)
     ▼
Database               — MySQL 8.0 via HikariCP connection pool
```

**DTOs** are the contract between Controller and Service. Entities are never serialized directly into API responses.

**Exception Handling** (`GlobalExceptionHandler` — `@RestControllerAdvice`):

| Exception | HTTP Status | Response Body |
|-----------|------------|---------------|
| `IllegalArgumentException` | 400 Bad Request | `{"error": "<message>"}` |
| `SecurityException` | 403 Forbidden | `{"error": "<message>"}` |
| `MethodArgumentNotValidException` | 400 Bad Request | `{"fieldName": "errorMessage", ...}` |

### 5.2 Security Architecture

```
Incoming Request
      │
      ▼
JwtAuthFilter  (OncePerRequestFilter)
  ├─ Reads "Authorization: Bearer <token>" header
  ├─ Calls jwtUtil.isTokenValid(token)  →  HMAC-SHA256 verify + expiry check
  ├─ Extracts subject (email) and "role" claim from token payload
  ├─ Creates UsernamePasswordAuthenticationToken
  │    principal = email  (available via @AuthenticationPrincipal)
  │    authorities = [ "ROLE_EMPLOYER" ]  OR  [ "ROLE_CANDIDATE" ]
  └─ Sets authentication in SecurityContextHolder
      │
      ▼
Spring Security Authorization (SecurityConfig)
  ├─ /api/auth/**          → permitAll()
  ├─ /api/employer/**      → hasRole("EMPLOYER")
  ├─ /api/candidate/**     → hasRole("CANDIDATE")
  └─ anything else         → authenticated()
```

### 5.3 JWT Token Structure

```
Header:   { "alg": "HS256", "typ": "JWT" }

Payload:  {
  "sub":    "user@email.com",        ← email; used as @AuthenticationPrincipal
  "role":   "EMPLOYER",              ← custom claim; used to build GrantedAuthority
  "userId": 1,                       ← integer PK of employer/candidate row
  "iat":    <unix timestamp>,
  "exp":    <iat + 86400>            ← 24-hour expiry
}

Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), secret)
```

Token secret is set in `application.properties` as `app.jwt.secret` (must be ≥32 chars for HS256).

---

## 6. Module Descriptions

| # | Module | Status | Owner | Backend Classes | Frontend Pages |
|---|--------|--------|-------|-----------------|----------------|
| 1 | Registration & Login | ✅ Done | Fassi | `AuthController`, `AuthService`, `AuthDTOs`, `JwtUtil`, `JwtAuthFilter`, `SecurityConfig` | `Login.jsx`, `RegisterEmployer.jsx`, `RegisterCandidate.jsx` *(upcoming)* |
| 2 | Vacancy Management | ✅ Done | Nimisha | `VacancyController`, `VacancyService`, `VacancyDTOs`, `Vacancy`, `VacancyRepository` | `PostJob.jsx`, `MyVacancies.jsx`, `EditVacancy.jsx` *(upcoming)* |
| 3 | Candidate Search | 🔲 Planned | Fassi | `CandidateSearchController`, `CandidateSearchService` | `CandidateSearch.jsx` *(upcoming)* |
| 4 | Candidate Profile & Preferences | ✅ Done | Nimisha | `CandidateController`, `CandidateService`, `CandidateDTOs`, `CandidateSkillRepository`, `CandidateLocationPrefRepository`, `CandidateRolePrefRepository` | `Profile.jsx` *(upcoming)* |
| 5 | Job Search & Apply | 🔲 Planned | Fassi | `JobController`, `ApplicationService` | `JobList.jsx`, `MyApplications.jsx` *(upcoming)* |
| 6 | Interview Scheduling | 🔲 Planned | Nimisha | `InterviewController`, `InterviewService` | `ScheduleInterview.jsx` *(upcoming)* |
| 7 | Reports | 🔲 Planned | Nimisha | `ReportController`, `ReportService` | `EmployerReport.jsx`, `CandidateReport.jsx` *(upcoming)* |
| 8 | Email Notifications | 🔲 Planned | Nimisha | `NotificationService` (Spring Mail) | — (backend only) |

---

## 7. API Specification

### 7.1 Authentication Endpoints — Public (no token required)

| Method | URL | Request Body | Response | HTTP |
|--------|-----|-------------|----------|------|
| POST | `/api/auth/register/employer` | `EmployerRegisterRequest` | `AuthResponse` | 200 |
| POST | `/api/auth/register/candidate` | `CandidateRegisterRequest` | `AuthResponse` | 200 |
| POST | `/api/auth/login` | `LoginRequest` | `AuthResponse` | 200 |

**`EmployerRegisterRequest`** (required fields marked `*`):
`orgName*`, `contactName*`, `email*`, `password*` (min 6), `establishedYr`, `numEmployees`, `annualTurnover`, `phone`, `address`, `website`

**`CandidateRegisterRequest`** (required fields marked `*`):
`fullName*`, `email*`, `password*` (min 6), `phone`, `dob` (string `YYYY-MM-DD`), `gender`, `address`, `degree`, `institution`, `yearOfPassing`, `percentage`, `totalExpYrs`, `expectedSalMin`, `expectedSalMax`

**`LoginRequest`** (all required):
`email*`, `password*`, `role*` (`"EMPLOYER"` or `"CANDIDATE"`)

**`AuthResponse`**:
`token` (JWT string), `role` (string), `userId` (integer), `name` (string)

---

### 7.2 Employer — Vacancy Endpoints (requires `ROLE_EMPLOYER` JWT)

| Method | URL | Request | Response | HTTP |
|--------|-----|---------|----------|------|
| POST | `/api/employer/vacancies` | `VacancyCreateRequest` | `VacancyResponse` | 201 Created |
| GET | `/api/employer/vacancies` | — | `List<VacancyResponse>` | 200 |
| GET | `/api/employer/vacancies/{id}` | — | `VacancyResponse` | 200 / 400 / 403 |
| PUT | `/api/employer/vacancies/{id}` | `VacancyUpdateRequest` (partial) | `VacancyResponse` | 200 / 400 / 403 |
| PATCH | `/api/employer/vacancies/{id}/close` | — | `VacancyResponse` | 200 / 400 / 403 |

**`VacancyCreateRequest`** (required fields marked `*`):
`designation*`, `employmentType*` (`Permanent`/`Temporary`/`Contract`), `department`, `jobDescription`, `requiredQual`, `requiredExpYrs`, `salaryMin`, `salaryMax`, `numOpenings`, `location`, `applicationDeadline` (string `YYYY-MM-DD`)

**`VacancyUpdateRequest`** (all optional — partial update):
Same fields as create, plus `status` (`Open`/`Closed`/`On_Hold`)

**`VacancyResponse`** fields:
`vacancyId`, `employerId`, `orgName`, `designation`, `department`, `jobDescription`, `requiredQual`, `requiredExpYrs`, `salaryMin`, `salaryMax`, `employmentType`, `numOpenings`, `location`, `applicationDeadline`, `status`, `postedAt`

**Enums:**
- `employmentType`: `Permanent` | `Temporary` | `Contract`
- `status`: `Open` | `Closed` | `On_Hold`

---

### 7.3 Candidate — Profile Endpoints (requires `ROLE_CANDIDATE` JWT)

| Method | URL | Request | Response | HTTP |
|--------|-----|---------|----------|------|
| GET | `/api/candidate/profile` | — | `ProfileResponse` | 200 / 400 |
| PUT | `/api/candidate/profile` | `ProfileUpdateRequest` (partial) | `ProfileResponse` | 200 / 400 |

**`ProfileUpdateRequest`** (all optional — partial update):
`fullName`, `phone`, `dob` (string `YYYY-MM-DD`), `gender` (`Male`/`Female`/`Other`), `address`, `degree`, `institution`, `yearOfPassing`, `percentage`, `totalExpYrs`, `expectedSalMin`, `expectedSalMax`, `skills` (list of `{skillName, proficiency}`), `locationPrefs` (list of strings), `rolePrefs` (list of strings)

**`ProfileResponse`** fields:
All `ProfileUpdateRequest` fields plus `candidateId`, `email`, `createdAt`, and resolved collections: `skills` (list of `{skillId, skillName, proficiency}`), `locationPrefs` (list of strings), `rolePrefs` (list of strings)

**Skill proficiency enum:** `Beginner` | `Intermediate` | `Expert`

---

### 7.4 Employer — Candidate Search (requires `ROLE_EMPLOYER`) *(Module 3 — Planned)*

| Method | URL | Query Params | Response | HTTP |
|--------|-----|-------------|----------|------|
| GET | `/api/employer/candidates/search` | `role`, `location`, `salaryMin`, `salaryMax`, `qualification`, `minPercentage` | `List<CandidateSummaryResponse>` | 200 |
| GET | `/api/employer/candidates/{id}` | — | `ProfileResponse` | 200 |

---

### 7.5 Candidate — Job Search & Apply (requires `ROLE_CANDIDATE`) *(Module 5 — Planned)*

| Method | URL | Request | Response | HTTP |
|--------|-----|---------|----------|------|
| GET | `/api/candidate/vacancies` | Query: `location`, `salaryMin`, `salaryMax`, `type`, `qualification` | `List<VacancyResponse>` | 200 |
| POST | `/api/candidate/vacancies/{id}/apply` | `{coverNote}` (optional) | `ApplicationResponse` | 201 / 409 |
| GET | `/api/candidate/applications` | — | `List<ApplicationResponse>` | 200 |

---

### 7.6 Employer — Interview Endpoints (requires `ROLE_EMPLOYER`) *(Module 6 — Planned)*

| Method | URL | Request | Response | HTTP |
|--------|-----|---------|----------|------|
| POST | `/api/employer/interviews` | `InterviewCreateRequest` | `InterviewResponse` | 201 |
| PUT | `/api/employer/interviews/{id}/outcome` | `{outcome}` | `InterviewResponse` | 200 |
| GET | `/api/employer/interviews` | Query: `from`, `to` (date range) | `List<InterviewResponse>` | 200 |

---

### 7.7 Report Endpoints *(Module 7 — Planned)*

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/employer/reports/vacancies` | `ROLE_EMPLOYER` | Vacancies with applicant counts |
| GET | `/api/employer/reports/interviews` | `ROLE_EMPLOYER` | Interview schedule with outcomes |
| GET | `/api/candidate/reports/applications` | `ROLE_CANDIDATE` | Application history with interview details |

---

### 7.8 HTTP Status Code Reference

| Status | When Used |
|--------|-----------|
| 200 OK | Successful GET, PUT, PATCH |
| 201 Created | Successful POST that creates a resource |
| 400 Bad Request | Business rule violation (`IllegalArgumentException`) or Bean Validation failure |
| 401 Unauthorized | Missing or expired JWT token |
| 403 Forbidden | Valid token but wrong role, or accessing another employer's resource (`SecurityException`) |
| 409 Conflict | Duplicate application (same candidate + vacancy) — Module 5 |
| 500 Internal Server Error | Unhandled server-side exception |

---

## 8. Database Design

### 8.1 Entity Relationship Overview

```
employers ──< vacancies ──< applications >── candidates
                                │                 │
                            interviews      candidate_skills
                                           candidate_location_prefs
                                           candidate_role_prefs

notifications  (standalone email audit log — no FK dependencies)
```

**Cardinalities:**
- One employer → many vacancies (1:M)
- One vacancy → many applications (1:M)
- One candidate → many applications (1:M)
- One application → many interviews (1:M — multiple rounds)
- One candidate → many skills (1:M)
- One candidate → many location preferences (1:M)
- One candidate → many role preferences (1:M)
- One candidate cannot apply to the same vacancy twice (`UNIQUE KEY uq_application`)

### 8.2 Table Definitions

#### Table: `employers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| employer_id | INT AUTO_INCREMENT | PK | Unique employer identifier |
| org_name | VARCHAR(150) | NOT NULL | Organization name |
| established_yr | INT | — | Year founded |
| num_employees | INT | — | Approximate headcount |
| annual_turnover | DECIMAL(15,2) | — | Annual turnover in INR |
| contact_name | VARCHAR(100) | NOT NULL | HR contact person's name |
| email | VARCHAR(150) | NOT NULL UNIQUE | Login email |
| phone | VARCHAR(15) | — | Contact phone |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt-hashed password |
| address | VARCHAR(255) | — | Office address |
| website | VARCHAR(150) | — | Company website URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| is_active | BOOLEAN | DEFAULT TRUE | Soft-delete flag |

#### Table: `candidates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| candidate_id | INT AUTO_INCREMENT | PK | Unique candidate identifier |
| full_name | VARCHAR(100) | NOT NULL | Full legal name |
| email | VARCHAR(150) | NOT NULL UNIQUE | Login email |
| phone | VARCHAR(15) | — | Mobile number |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt-hashed password |
| dob | DATE | — | Date of birth |
| gender | ENUM('Male','Female','Other') | — | Gender |
| address | VARCHAR(255) | — | Residential address |
| degree | VARCHAR(100) | — | Highest degree (e.g., B.Tech CSE) |
| institution | VARCHAR(150) | — | Institution name |
| year_of_passing | INT | — | Graduation year |
| percentage | DECIMAL(5,2) | — | Academic score (e.g., 82.50) |
| total_exp_yrs | DECIMAL(4,1) | DEFAULT 0 | Total work experience in years |
| expected_sal_min | DECIMAL(12,2) | — | Minimum expected annual salary (INR) |
| expected_sal_max | DECIMAL(12,2) | — | Maximum expected annual salary (INR) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| is_active | BOOLEAN | DEFAULT TRUE | Soft-delete flag |

#### Table: `candidate_skills`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| skill_id | INT AUTO_INCREMENT | PK | Unique skill entry |
| candidate_id | INT | NOT NULL, FK → candidates ON DELETE CASCADE | Owning candidate |
| skill_name | VARCHAR(80) | NOT NULL | Skill name (e.g., Java) |
| proficiency | ENUM('Beginner','Intermediate','Expert') | DEFAULT 'Intermediate' | Skill level |

#### Table: `candidate_location_prefs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| pref_id | INT AUTO_INCREMENT | PK | Unique preference entry |
| candidate_id | INT | NOT NULL, FK → candidates ON DELETE CASCADE | Owning candidate |
| location | VARCHAR(100) | NOT NULL | Preferred city (e.g., Bangalore) |

#### Table: `candidate_role_prefs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| pref_id | INT AUTO_INCREMENT | PK | Unique preference entry |
| candidate_id | INT | NOT NULL, FK → candidates ON DELETE CASCADE | Owning candidate |
| preferred_role | VARCHAR(100) | NOT NULL | Preferred job role (e.g., Software Engineer) |

#### Table: `vacancies`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vacancy_id | INT AUTO_INCREMENT | PK | Unique vacancy identifier |
| employer_id | INT | NOT NULL, FK → employers ON DELETE CASCADE | Posting employer |
| designation | VARCHAR(100) | NOT NULL | Job title |
| department | VARCHAR(100) | — | Department |
| job_description | TEXT | — | Full job description |
| required_qual | VARCHAR(150) | — | Required qualification |
| required_exp_yrs | DECIMAL(4,1) | DEFAULT 0 | Min years of experience |
| salary_min | DECIMAL(12,2) | — | Minimum offered salary (INR) |
| salary_max | DECIMAL(12,2) | — | Maximum offered salary (INR) |
| employment_type | ENUM('Permanent','Temporary','Contract') | NOT NULL | Employment type |
| num_openings | INT | DEFAULT 1 | Number of positions |
| location | VARCHAR(100) | — | Job location city |
| application_deadline | DATE | — | Last date to apply |
| status | ENUM('Open','Closed','On_Hold') | DEFAULT 'Open' | Vacancy state |
| posted_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Posting timestamp |

#### Table: `applications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| application_id | INT AUTO_INCREMENT | PK | Unique application identifier |
| vacancy_id | INT | NOT NULL, FK → vacancies ON DELETE CASCADE | Applied vacancy |
| candidate_id | INT | NOT NULL, FK → candidates ON DELETE CASCADE | Applying candidate |
| applied_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| status | ENUM('Applied','Shortlisted','Interview Scheduled','Interview Completed','Selected','Offered','Recruited','Rejected','Withdrawn') | DEFAULT 'Applied' | Current status |
| cover_note | TEXT | — | Optional cover letter |

*UNIQUE KEY `uq_application` (vacancy_id, candidate_id) — prevents duplicate applications.*

#### Table: `interviews`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| interview_id | INT AUTO_INCREMENT | PK | Unique interview identifier |
| application_id | INT | NOT NULL, FK → applications ON DELETE CASCADE | Associated application |
| round_number | INT | DEFAULT 1 | Interview round number |
| interview_datetime | DATETIME | NOT NULL | Scheduled date and time |
| mode | ENUM('In-Person','Online','Telephonic') | DEFAULT 'In-Person' | Interview format |
| venue | VARCHAR(200) | — | Office address or meeting link |
| interviewer_name | VARCHAR(100) | — | Interviewer's name |
| outcome | ENUM('Scheduled','Completed','Cancelled','Selected','Rejected') | DEFAULT 'Scheduled' | Interview outcome |
| remarks | TEXT | — | Notes or feedback |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When scheduled |

#### Table: `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | INT AUTO_INCREMENT | PK | Unique notification entry |
| recipient_email | VARCHAR(150) | NOT NULL | Recipient email address |
| recipient_type | ENUM('Candidate','Employer') | — | Type of recipient |
| subject | VARCHAR(255) | — | Email subject line |
| body | TEXT | — | Full email body |
| event_type | VARCHAR(80) | — | Triggering event (e.g., `INTERVIEW_SCHEDULED`) |
| sent_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Attempt timestamp |
| status | ENUM('Sent','Failed') | DEFAULT 'Sent' | Send outcome |

*No FK to `candidates` or `employers` — notifications are an immutable audit log retained even if users are deleted.*

### 8.3 Database Indexes

| Index | Table | Column(s) | Purpose |
|-------|-------|-----------|---------|
| `idx_candidates_degree` | candidates | degree | Filter by qualification in candidate search |
| `idx_candidates_percentage` | candidates | percentage | Filter by merit score |
| `idx_candidates_exp` | candidates | total_exp_yrs | Filter by experience |
| `idx_vacancies_location` | vacancies | location | Candidate job search by location |
| `idx_vacancies_salary` | vacancies | (salary_min, salary_max) | Candidate salary range filter |
| `idx_vacancies_status` | vacancies | status | List only Open vacancies |
| `idx_vacancies_employer` | vacancies | employer_id | Employer's own vacancy list |
| `idx_applications_candidate` | applications | candidate_id | Candidate's application history |
| `idx_applications_status` | applications | status | Filter applications by status |
| `idx_interviews_datetime` | interviews | interview_datetime | Date-range interview reports |

### 8.4 JPA Entity Details

All entities use:
- `@GeneratedValue(strategy = GenerationType.IDENTITY)` — auto-increment PKs
- `@Enumerated(EnumType.STRING)` — enums stored as strings (not ordinals)
- Explicit getters and setters — no Lombok annotations; compatible with Java 21 and Java 25

`Candidate` uses `@OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)` for skills, location prefs, and role prefs.

`Vacancy` uses `@ManyToOne(fetch = FetchType.LAZY)` with `@JoinColumn(name = "employer_id")` to link to its `Employer`.

`CandidateService.updateProfile` is `@Transactional` — the delete-then-reinsert of skills/prefs runs atomically.

### 8.5 Sample Data

`docs/db-schema.sql` includes pre-seeded test accounts (BCrypt of `Test@1234`):
- Employer: `hr@techcorp.com` / `Test@1234`
- Candidate: `priya@example.com` / `Test@1234`

The schema file is **idempotent** — drops and recreates all tables and data on each run:
```bash
mysql -u root < docs/db-schema.sql
```

---

## 9. Security Design

### 9.1 Authentication Flow

```
1. Client  POST /api/auth/login  { email, password, role }
2. AuthService looks up employer or candidate table by email
3. passwordEncoder.matches(rawPassword, passwordHash)  → validates BCrypt
4. jwtUtil.generateToken(email, role, userId)  → HMAC-SHA256 signed JWT
5. Returns  { token, role, userId, name }
6. Client stores token (localStorage in React SPA)
7. Every subsequent request:  Authorization: Bearer <token>
8. JwtAuthFilter validates token, sets SecurityContext with email + ROLE_*
9. @AuthenticationPrincipal String email  → resolves to token subject in controllers
```

### 9.2 Authorization Rules

| Route | Allowed | Unauthorized Response |
|-------|---------|----------------------|
| `/api/auth/**` | Any request (no token) | — |
| `/api/employer/**` | `ROLE_EMPLOYER` only | HTTP 403 |
| `/api/candidate/**` | `ROLE_CANDIDATE` only | HTTP 403 |
| Anything else | Any authenticated | HTTP 401 if no token |

### 9.3 Resource Ownership Enforcement

Beyond role-level routing, vacancy operations enforce per-employer ownership in `VacancyService`:

```java
private void assertOwner(String employerEmail, Vacancy v) {
    if (!v.getEmployer().getEmail().equals(employerEmail)) {
        throw new SecurityException("Access denied");
    }
}
// GlobalExceptionHandler maps SecurityException → HTTP 403
```

### 9.4 CORS Configuration

Configured in `SecurityConfig.corsConfigurationSource()`:
- Allowed origins: value of `app.cors.allowed-origins` property (default: `http://localhost:3000`)
- Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed headers: `*`
- Credentials: allowed

---

## 10. Frontend Architecture

The frontend is designed as a React 18 SPA under the `frontend/` directory and is currently in active development. The architecture below captures the agreed design that guides its implementation.

### 10.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 (functional components + hooks) |
| Build Tool | Vite (HMR + proxy to backend port 8080) |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios with Bearer token request interceptor |
| Auth State | React Context API + localStorage |

### 10.2 Authentication and Token Management

The `AuthContext` (`src/context/AuthContext.jsx`) will:
- Store JWT token, role, userId, and name in `localStorage` on login
- Read from `localStorage` on app load to restore auth state across refreshes
- Expose a `logout()` function that clears `localStorage` and resets context state

The Axios instance (`src/api/api.js`) attaches the token automatically:
```js
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### 10.3 Route Protection

`PrivateRoute` will wrap all protected pages — checks both token presence and role:
```jsx
function PrivateRoute({ children, role }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/login" replace />
  return children
}
```

### 10.4 Development Proxy

Vite will proxy `/api` calls from port 3000 to port 8080 — no CORS issues during development:
```js
// vite.config.js
proxy: { '/api': 'http://localhost:8080' }
```

### 10.5 Planned Page Inventory

| Page | Route | Role Guard | Module |
|------|-------|-----------|--------|
| Login | `/login` | Public | 1 |
| Register Employer | `/register/employer` | Public | 1 |
| Register Candidate | `/register/candidate` | Public | 1 |
| My Vacancies | `/employer/vacancies` | EMPLOYER | 2 |
| Post Job | `/employer/vacancies/new` | EMPLOYER | 2 |
| Edit Vacancy | `/employer/vacancies/:id/edit` | EMPLOYER | 2 |
| Candidate Search | `/employer/candidates/search` | EMPLOYER | 3 |
| Candidate Profile | `/candidate/profile` | CANDIDATE | 4 |
| Job List | `/candidate/vacancies` | CANDIDATE | 5 |
| My Applications | `/candidate/applications` | CANDIDATE | 5 |
| Schedule Interview | `/employer/interviews/new` | EMPLOYER | 6 |
| Employer Reports | `/employer/reports` | EMPLOYER | 7 |
| Candidate Reports | `/candidate/reports` | CANDIDATE | 7 |

---

## 11. Use Cases

### UC-01: Employer Registers and Posts a Vacancy

- **Actor:** Employer
- **Precondition:** Email not previously registered
- **Flow:**
  1. `POST /api/auth/register/employer` with org + contact details → receives JWT
  2. `POST /api/employer/vacancies` with vacancy fields → 201, vacancy created (status: Open)
- **Postcondition:** Vacancy visible to candidates in job search

### UC-02: Candidate Registers, Builds Profile, Applies

- **Actor:** Candidate
- **Precondition:** Email not previously registered
- **Flow:**
  1. `POST /api/auth/register/candidate` → receives JWT
  2. `PUT /api/candidate/profile` with skills, location prefs, role prefs → profile updated
  3. `POST /api/candidate/vacancies/{id}/apply` → 201, application created (status: Applied)
- **Postcondition:** Application appears in employer's applicant list

### UC-03: Employer Searches Candidates, Schedules Interview

- **Actor:** Employer
- **Flow:**
  1. `GET /api/employer/candidates/search?role=Java+Developer&location=Bangalore&minPercentage=70` → ranked list
  2. `POST /api/employer/interviews` with application_id, datetime, mode, venue → interview created
  3. Application status auto-updates to "Interview Scheduled"; email sent to candidate
- **Postcondition:** Interview record created; candidate notified

### UC-04: Employer Records Interview Outcome

- **Actor:** Employer
- **Flow:**
  1. `PUT /api/employer/interviews/{id}/outcome` with `outcome: "Selected"`
  2. Application status updates to "Selected"; email sent to candidate
- **Postcondition:** Candidate receives selection notification

### UC-05: Candidate Tracks Application Status

- **Actor:** Candidate
- **Flow:**
  1. `GET /api/candidate/applications` → list with current status per application
- **Postcondition:** Candidate sees latest status for all applications

---

## 12. Implementation Status

### 12.1 Backend — What Exists in the Repository Today

| Module | # | Implemented Endpoints | Files in Repository |
|--------|---|-----------------------|-------------------|
| Registration & Login | 1 | `POST /api/auth/register/employer`, `POST /api/auth/register/candidate`, `POST /api/auth/login` | `AuthController.java`, `AuthService.java`, `AuthDTOs.java`, `JwtUtil.java`, `JwtAuthFilter.java`, `SecurityConfig.java` |
| Vacancy Management | 2 | `POST /api/employer/vacancies` (201), `GET /api/employer/vacancies`, `GET /api/employer/vacancies/{id}`, `PUT /api/employer/vacancies/{id}`, `PATCH /api/employer/vacancies/{id}/close` | `VacancyController.java`, `VacancyService.java`, `VacancyDTOs.java`, `Vacancy.java`, `VacancyRepository.java` |
| Candidate Profile | 4 | `GET /api/candidate/profile`, `PUT /api/candidate/profile` | `CandidateController.java`, `CandidateService.java`, `CandidateDTOs.java`, `CandidateSkillRepository.java`, `CandidateLocationPrefRepository.java`, `CandidateRolePrefRepository.java` |

All implemented modules compile and run. Verified via `mvn compile` (BUILD SUCCESS).

### 12.2 Backend — Upcoming Modules

| Module | # | Owner | Depends On |
|--------|---|-------|-----------|
| Candidate Search | 3 | Fassi | Modules 1, 4 (candidates + prefs tables populated) |
| Job Search & Apply | 5 | Fassi | Modules 1, 2, 4 (vacancies + candidates exist) |
| Interview Scheduling | 6 | Nimisha | Module 5 (applications must exist) |
| Reports | 7 | Nimisha | Modules 2–6 |
| Email Notifications | 8 | Nimisha | Modules 1, 5, 6 (trigger events exist) |

### 12.3 Frontend — In Development

The React frontend is being built under the `frontend/` directory as part of the current development sprint. Member 2 (Nimisha) owns the frontend. The full page inventory, routing strategy, and component architecture are documented in Section 10.

### 12.4 Fixes Applied to This Branch

| Version | Fix | Detail |
|---------|-----|--------|
| v0.3.0 | DB schema: vacancy status enum | `'On Hold'` → `'On_Hold'` to match Java enum naming (spaces not valid in Java enum identifiers) |
| v0.4.1 | Lombok annotations removed | `@Data` removed from all entities and DTOs; replaced with explicit getters/setters. Lombok dependency remains in `pom.xml` (declared but unused). This ensures the project compiles on both Java 21 and Java 25 without switching JVMs. |
| v0.4.2 | 403 for ownership violations | `GlobalExceptionHandler` now catches `SecurityException` → HTTP 403. Previously `VacancyService.assertOwner` threw `SecurityException` which went unhandled → HTTP 500. |

---

## 13. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Java (SapMachine LTS) | 21 (also compatible with Java 25) |
| Framework | Spring Boot | 3.3.4 |
| REST | Spring MVC | Bundled with Spring Boot 3.3.4 |
| ORM | Spring Data JPA + Hibernate | 6.x (bundled with Spring Boot 3.3.4) |
| Security | Spring Security | 6.x (bundled with Spring Boot 3.3.4) |
| JWT | jjwt (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) | 0.12.6 |
| Database | MySQL | 8.0 |
| DB Driver | mysql-connector-j | Managed by Spring Boot BOM |
| Validation | Spring Starter Validation (Jakarta Validation) | Bundled |
| Email | Spring Mail (JavaMail) | Bundled |
| Build | Maven | 3.9+ |
| Frontend Framework | React | 18.x |
| Frontend Build | Vite | Latest |
| Frontend Routing | React Router | v6 |
| HTTP Client | Axios | Latest |
| CSS Framework | Tailwind CSS | 3.x |
| CSS Processing | PostCSS + Autoprefixer | Latest |
| Package Manager | npm | Latest (Node.js 18+) |

---

## 14. Appendix

### 14.1 Team Responsibility Split

| Member | Modules Owned | Backend | Frontend |
|--------|--------------|---------|----------|
| **Fassi** | 1 (Auth), 3 (Candidate Search), 5 (Job Search & Apply) | `AuthController`, `AuthService`, `AuthDTOs`, `JwtUtil`, `JwtAuthFilter`, `SecurityConfig`; future: `CandidateSearchController`, `JobController`, `ApplicationService` | Login, Register pages, `CandidateSearch.jsx`, `JobList.jsx`, `MyApplications.jsx` |
| **Nimisha** | 2 (Vacancy Mgmt), 4 (Candidate Profile), 6 (Interview), 7 (Reports), 8 (Email) + Frontend overall | `VacancyController`, `CandidateController` + services; future: `InterviewController`, `ReportController`, `NotificationService` | All frontend pages |

### 14.2 Running the Project

**Prerequisites:** Java 21+, Maven 3.9+, MySQL 8.0, Node.js 18+ (for frontend when added)

**Step 1 — Set up the database (run once, or whenever schema changes):**
```bash
mysql -u root < docs/db-schema.sql
```

**Step 2 — Configure `backend/src/main/resources/application.properties`:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/recruitment_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=           # leave blank if no password
app.jwt.secret=recruitment-system-secret-key-change-in-prod-2026
app.jwt.expiration-ms=86400000
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
app.cors.allowed-origins=http://localhost:3000
```

**Step 3 — Start the backend:**
```bash
cd backend
mvn spring-boot:run
# OR open in IntelliJ and run RecruitmentSystemApplication.java
```
API available at `http://localhost:8080`

**Step 4 — Quick smoke test:**
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

**Pre-seeded test accounts** (from `docs/db-schema.sql`):
- Employer: `hr@techcorp.com` / `Test@1234`
- Candidate: `priya@example.com` / `Test@1234`

### 14.3 Project File Structure (Current State)

```
recruitment-processing-system/
├── backend/
│   ├── pom.xml                         # Spring Boot 3.3.4, Java 21, jjwt 0.12.6
│   │                                   # Lombok declared (unused — no @Data in source)
│   └── src/main/
│       ├── java/com/recruitment/
│       │   ├── RecruitmentSystemApplication.java
│       │   ├── controller/
│       │   │   ├── AuthController.java         # POST /api/auth/**
│       │   │   ├── VacancyController.java      # /api/employer/vacancies
│       │   │   └── CandidateController.java    # /api/candidate/profile
│       │   ├── service/
│       │   │   ├── AuthService.java            # register + login logic
│       │   │   ├── VacancyService.java         # CRUD + assertOwner
│       │   │   └── CandidateService.java       # get + @Transactional update
│       │   ├── entity/
│       │   │   ├── Employer.java               # → employers table
│       │   │   ├── Candidate.java              # → candidates table
│       │   │   ├── CandidateSkill.java         # → candidate_skills table
│       │   │   ├── CandidateLocationPref.java  # → candidate_location_prefs table
│       │   │   ├── CandidateRolePref.java      # → candidate_role_prefs table
│       │   │   └── Vacancy.java                # → vacancies table
│       │   ├── repository/
│       │   │   ├── EmployerRepository.java           # findByEmail, existsByEmail
│       │   │   ├── CandidateRepository.java          # findByEmail, existsByEmail
│       │   │   ├── VacancyRepository.java            # findByEmployer_EmployerIdOrderByPostedAtDesc
│       │   │   ├── CandidateSkillRepository.java     # findBy..., deleteByCandidate_CandidateId
│       │   │   ├── CandidateLocationPrefRepository.java  # same pattern
│       │   │   └── CandidateRolePrefRepository.java      # same pattern
│       │   ├── dto/
│       │   │   ├── AuthDTOs.java           # EmployerRegisterRequest, CandidateRegisterRequest,
│       │   │   │                           #   LoginRequest, AuthResponse
│       │   │   ├── VacancyDTOs.java        # VacancyCreateRequest, VacancyUpdateRequest,
│       │   │   │                           #   VacancyResponse
│       │   │   └── CandidateDTOs.java      # ProfileUpdateRequest, ProfileResponse,
│       │   │                               #   SkillRequest, SkillResponse
│       │   ├── security/
│       │   │   ├── SecurityConfig.java     # STATELESS, JWT filter, CORS, RBAC routes
│       │   │   ├── JwtUtil.java            # generateToken, extractClaims, isTokenValid
│       │   │   └── JwtAuthFilter.java      # OncePerRequestFilter → SecurityContext
│       │   └── exception/
│       │       └── GlobalExceptionHandler.java  # 400 (Illegal/Validation), 403 (Security)
│       └── resources/
│           └── application.properties      # DB, JWT, mail, CORS config
├── docs/
│   ├── SRS.md                              # This document
│   ├── db-schema.sql                       # MySQL DDL — 9 tables, indexes, sample data
│   ├── abstract.md                         # Project abstract
│   └── superpowers/plans/
│       └── 2026-10-29-vacancy-management-candidate-profile.md
├── CHANGELOG.md                            # Per-version log
└── README.md                               # Setup and API reference
```

### 14.4 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | October 2026 | Initial SRS — functional requirements, use cases, module breakdown, tech stack |
| 2.0 | November 2026 | Full rewrite aligned to codebase — exact versions, real API endpoints, JWT structure, Spring Security config, full DB schema with constraints, frontend architecture plan, implementation status per module, team split, Lombok note |
| 2.1 | November 2026 | Re-verified against every source file — corrected: `MethodArgumentNotValidException` returns 400 (not 422); repository methods use `deleteByCandidate_CandidateId` (not `deleteAllBy`); frontend directory does not yet exist in repo; Lombok declared in pom.xml but not used in any source file; Maven version 3.9; Java noted as SapMachine LTS |
| 2.2 | November 2026 | Tone and framing revised to be positive and professional throughout — "pending" replaced with "planned/upcoming/in development"; all technical content from v2.1 preserved unchanged |

---

*Prepared by: Nimisha Gupta & Fassi | BITS Pilani WILP | FSAD | November 2026*
