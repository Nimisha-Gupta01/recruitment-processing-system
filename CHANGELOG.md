# Changelog

All notable changes to this project are documented here.
Each entry maps to one commit or PR. Format: **what was done**, **why**, **how to verify**.

---

## What's Still Pending

### Member 1 — Fassi (Modules 1, 3, 5)

| Module | What's needed | Status |
|--------|--------------|--------|
| **Module 3 — Candidate Search** | `GET /api/employer/candidates/search` with filters: qualification, location, salary, merit/percentage. Returns ranked candidate list. Queries `candidates`, `candidate_skills`, `candidate_location_prefs` tables (populated by Module 4). | 🔲 Not started |
| **Module 5 — Job Search & Apply** | `GET /api/candidate/vacancies` (list open vacancies, filterable by location/salary/type), `POST /api/candidate/vacancies/{id}/apply` (create application, prevent duplicate). References `vacancies` (Module 2) and `candidates` (Module 4). | 🔲 Not started |

### Member 2 — Nimisha (Frontend + remaining backend)

| Item | What's needed | Status |
|------|--------------|--------|
| **Frontend — React app** | Vite + React 18 scaffold under `frontend/`. Pages: Login, Register (Employer + Candidate), Employer Dashboard (vacancies CRUD), Candidate Dashboard (profile, job search, applications). Calls existing backend APIs. | 🔲 Not started |
| **Module 6 — Interview Scheduling** | `POST /api/employer/interviews`, `PUT /api/employer/interviews/{id}/outcome`. Updates `applications.status` automatically. Triggers email via Module 8. | 🔲 Not started |
| **Module 7 — Reports** | `GET /api/employer/reports/vacancies` (vacancies + applicant counts), `GET /api/employer/reports/interviews`, `GET /api/candidate/reports/applications` | 🔲 Not started |
| **Module 8 — Email Notifications** | Spring Mail integration. Trigger emails on: registration, interview scheduled, status change (Selected/Rejected/Offered/Recruited). Logs to `notifications` table. | 🔲 Not started |

### Assignment Artifacts Still Due

| # | Artifact | Status |
|---|----------|--------|
| 2 | Architecture Diagram | 🔲 Pending |
| 4 | UI Design / Wireframes | 🔲 Pending |
| 6 | PPT Presentation | 🔲 Pending |

---

## What's Done So Far

| Version | Module | Owner | Status |
|---------|--------|-------|--------|
| v0.1.0 | Project init + all docs (SRS, schema, abstract) | Both | ✅ |
| v0.2.0 | Module 1 — Registration & Login (JWT auth) | Fassi | ✅ |
| v0.3.0 | Module 2 — Vacancy Management CRUD | Nimisha | ✅ |
| v0.4.0 | Module 4 — Candidate Profile & Preferences | Nimisha | ✅ |
| v0.4.1 | Fix — Lombok removed, compiles on Java 25 + Java 21 | Nimisha | ✅ |
| v0.4.2 | Fix — SecurityException returns 403 not 500 | Nimisha | ✅ |

---

## [v0.4.2] — 2026-10-30 — Fix: SecurityException → 403 for unauthorised vacancy access

### What was done
- `GlobalExceptionHandler` now catches `SecurityException` and returns **403 Forbidden** with `{"error": "Access denied"}`
- Previously, `VacancyService.assertOwner` threw `SecurityException` which was unhandled → returned 500

### Files modified
| File | Change |
|------|--------|
| `exception/GlobalExceptionHandler.java` | Added `@ExceptionHandler(SecurityException.class)` returning 403 |

### How to verify
```bash
# Login as employer A, create a vacancy, then login as employer B and try GET /api/employer/vacancies/{id}
# Should return 403 {"error":"Access denied"}, not 500
```

---

## [v0.4.1] — 2026-10-30 — Fix: Remove Lombok for Java 25 compatibility across all entities and DTOs

### What was done
- Removed `@Data` (Lombok) from **all** entity and DTO classes — replaced with explicit getters/setters
- Lombok's annotation processor crashes on Java 25 (`TypeTag::UNKNOWN` error), breaking compilation
- Project now compiles cleanly on **Java 25** (default on dev machine) and **Java 21** — no JVM switching needed
- **Zero behaviour change** — same method names, same logic, same API responses

### Files modified
| File | Change |
|------|--------|
| `entity/Candidate.java` | Removed `@Data` + `import lombok.Data`, added explicit getters/setters |
| `entity/CandidateSkill.java` | Same |
| `entity/CandidateLocationPref.java` | Same |
| `entity/CandidateRolePref.java` | Same |
| `entity/Employer.java` | Same |
| `dto/AuthDTOs.java` | Removed `@Data` from all four inner classes, added explicit getters/setters |

### How to verify
```bash
cd backend && mvn compile    # must print BUILD SUCCESS on Java 25
```

---

## [v0.4.0] — 2026-10-30 — Backend Module 4: Candidate Profile & Preferences API

### What was done
- Implemented **Module 4: Candidate Profile & Preferences** — GET + PUT `/api/candidate/profile`
- Skills, location preferences, and role preferences are replaced on each update (delete + re-insert)
- All new files use explicit getters/setters (no Lombok) for Java 25 compatibility on dev machines

### Files added
| File | Purpose |
|------|---------|
| `repository/CandidateSkillRepository.java` | `findByCandidate_CandidateId`, `deleteByCandidate_CandidateId` |
| `repository/CandidateLocationPrefRepository.java` | Same pattern for location prefs |
| `repository/CandidateRolePrefRepository.java` | Same pattern for role prefs |
| `dto/CandidateDTOs.java` | `ProfileUpdateRequest`, `ProfileResponse`, `SkillRequest`, `SkillResponse` |
| `service/CandidateService.java` | `getProfile`, `updateProfile` (with transactional delete-reinsert) |
| `controller/CandidateController.java` | `GET /api/candidate/profile`, `PUT /api/candidate/profile` |

### API endpoints added
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/candidate/profile` | Get logged-in candidate's full profile including skills + preferences |
| PUT | `/api/candidate/profile` | Update profile fields + replace skills/location prefs/role prefs |

### Alignment with teammate's modules
- Module 3 (Candidate Search): can now query `candidates` + `candidate_skills` + `candidate_location_prefs` tables populated via this API
- Module 5 (Job Search & Apply): the `candidate_id` FK in `applications` table references candidates registered and profiled via Modules 1 + 4

### How to run after pulling this
```bash
cd backend && mvn spring-boot:run
# GET /api/candidate/profile  — requires ROLE_CANDIDATE JWT token from /api/auth/login
# PUT /api/candidate/profile  — send JSON body with any subset of profile fields
```

---

## [v0.3.0] — 2026-10-30 — Backend Module 2: Vacancy Management API

### What was done
- Implemented **Module 2: Vacancy Management** — full CRUD + close for employer vacancies
- `Vacancy` entity written without Lombok (`@Data`) for Java 25 compatibility; uses explicit getters/setters
- Fixed DB schema `vacancies.status` enum: `'On Hold'` → `'On_Hold'` to match Java enum naming

### Files added
| File | Purpose |
|------|---------|
| `entity/Vacancy.java` | JPA entity for `vacancies` table — no Lombok, explicit getters/setters |
| `repository/VacancyRepository.java` | `findByEmployer_EmployerIdOrderByPostedAtDesc` |
| `dto/VacancyDTOs.java` | `VacancyCreateRequest`, `VacancyUpdateRequest`, `VacancyResponse` |
| `service/VacancyService.java` | `create`, `listByEmployer`, `getOne`, `update`, `close` with owner check |
| `controller/VacancyController.java` | POST/GET/PUT/PATCH under `/api/employer/vacancies` |

### Files modified
| File | Change |
|------|--------|
| `docs/db-schema.sql` | `status ENUM('Open','Closed','On Hold')` → `ENUM('Open','Closed','On_Hold')` |

### API endpoints added
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/employer/vacancies` | Post new vacancy (returns 201) |
| GET | `/api/employer/vacancies` | List all vacancies for authenticated employer (ordered newest first) |
| GET | `/api/employer/vacancies/{id}` | Get single vacancy (owner-only) |
| PUT | `/api/employer/vacancies/{id}` | Edit vacancy fields (owner-only, partial update) |
| PATCH | `/api/employer/vacancies/{id}/close` | Set status to Closed (owner-only) |

### Alignment with teammate's modules
- Module 3 (Candidate Search): employer has vacancies to associate candidates with
- Module 5 (Job Search & Apply): the `vacancy_id` FK in `applications` table references vacancies created via this API

### How to run after pulling this
```bash
cd backend && mvn spring-boot:run
# POST /api/employer/vacancies   — requires ROLE_EMPLOYER JWT token from /api/auth/login
```

---

## [v0.2.0] — 2026-10-14 — Backend Module 1: Authentication & Project Scaffold

### What was done
- Scaffolded the full Spring Boot 3 project structure under `backend/`
- Implemented **Module 1: Registration & Login** — complete end-to-end

### Files added
| File | Purpose |
|------|---------|
| `backend/pom.xml` | Maven project config — Spring Boot 3.3.4, Java 21, JWT, JPA, Security, Mail, Lombok |
| `backend/src/main/resources/application.properties` | DB, JWT, mail, CORS config |
| `RecruitmentSystemApplication.java` | Spring Boot entry point |
| `entity/Employer.java` | JPA entity for employers table |
| `entity/Candidate.java` | JPA entity for candidates table (with skills, prefs relationships) |
| `entity/CandidateSkill.java` | Skills linked to a candidate |
| `entity/CandidateLocationPref.java` | Location preferences per candidate |
| `entity/CandidateRolePref.java` | Job role preferences per candidate |
| `repository/EmployerRepository.java` | Spring Data JPA repo for employers |
| `repository/CandidateRepository.java` | Spring Data JPA repo for candidates |
| `dto/AuthDTOs.java` | Request/response DTOs: EmployerRegisterRequest, CandidateRegisterRequest, LoginRequest, AuthResponse |
| `security/JwtUtil.java` | JWT generate / validate / extract claims using jjwt 0.12.6 |
| `security/JwtAuthFilter.java` | OncePerRequestFilter — reads Bearer token, sets SecurityContext |
| `security/SecurityConfig.java` | Spring Security config — stateless, JWT filter, CORS, role-based route protection |
| `service/AuthService.java` | Business logic: register employer, register candidate, login (both roles) |
| `controller/AuthController.java` | REST endpoints: POST /api/auth/register/employer, /register/candidate, /login |
| `exception/GlobalExceptionHandler.java` | Handles IllegalArgumentException + validation errors with clean JSON responses |

### Files modified
| File | Change |
|------|--------|
| `docs/db-schema.sql` | Fixed `YEAR` → `INT` for `year_of_passing` and `established_yr` (Hibernate validation mismatch). Added DROP TABLE IF EXISTS block for safe re-runs. Fixed sample data bcrypt hashes. |
| `README.md` | Replaced placeholder with full project documentation |

### API endpoints added
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register/employer` | Registers employer, returns JWT |
| POST | `/api/auth/register/candidate` | Registers candidate, returns JWT |
| POST | `/api/auth/login` | Validates credentials, returns JWT + role |

### Tested & verified
- `mvn compile` — clean, zero errors
- App starts in 2.5s, connects to MySQL `recruitment_db`
- Register candidate API returns JWT token ✅
- Login API returns JWT token ✅

### How to run after pulling this
```bash
# 1. Start MySQL
brew services start mysql

# 2. Set up DB (run once)
mysql -u root < docs/db-schema.sql

# 3. Run backend
cd backend && mvn spring-boot:run
```

---

## [v0.1.0] — 2026-10-11 — Project Initialization & Documentation

### What was done
- Initialized git repository
- Created all project documentation artifacts for Assignment 1 presentation

### Files added
| File | Purpose |
|------|---------|
| `docs/abstract.md` | One-page project abstract (Assignment Artifact #5) |
| `docs/SRS.md` | Full Software Requirements Specification — functional reqs, non-functional reqs, use cases, module breakdown, tech stack (Assignment Artifact #3) |
| `docs/db-schema.sql` | Complete MySQL DDL — 9 tables with indexes and sample data (Assignment Artifact #1) |

### Decisions made
- **Tech stack chosen:** Spring Boot 3 + ReactJS 18 + MySQL 8 + Spring Data JPA
- **Prototype scope:** Registration/Login + Candidate Profile + Job Search & Apply (3 core modules)
- **Team split:** Feature-by-feature (each member owns full stack for their assigned modules)

---

## How to update this file

Every time you commit or raise a PR, add a new entry at the **top** of this file (above the previous entry) using this format:

```markdown
## [vX.Y.Z] — YYYY-MM-DD — <short title>

### What was done
- ...

### Files added / modified
| File | Change |
|------|--------|
| ... | ... |

### API endpoints added (if any)
...

### How to run after pulling this
...
```

**Version numbering:**
- `v0.X.0` — new module or major feature
- `v0.X.Y` — bug fix or small change within a module
