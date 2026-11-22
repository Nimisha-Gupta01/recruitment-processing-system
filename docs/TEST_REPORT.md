# Online Recruitment Processing System — Test Report
**Date:** 22 November 2026  
**Tester:** Playwright UI Automation (Claude Code)  
**Stack:** Spring Boot 3.3.4 + React 18 + Vite + MySQL 8  
**Credentials used:** employer: `techcorp@example.com / Test@1234`, candidate: `priya@example.com / Test@1234`

---

## Summary

| Category | Tests | Pass | Fail |
|---|---|---|---|
| Auth & Security | 4 | 4 | 0 |
| Employer — Vacancy Management | 4 | 4 | 0 |
| Employer — Applications | 3 | 3 | 0 |
| Employer — Interviews | 2 | 2 | 0 |
| Employer — Candidate Search | 1 | 1 | 0 |
| Candidate — Job Search & Apply | 3 | 3 | 0 |
| Candidate — My Applications | 1 | 1 | 0 |
| Candidate — Profile | 1 | 1 | 0 |
| **Total** | **19** | **19** | **0** |

---

## Bugs Found and Fixed During Testing

| # | Bug | Root Cause | Fix Applied |
|---|---|---|---|
| 1 | **Hibernate startup error** — `applications.status` ENUM vs VARCHAR mismatch | `@Column(length=50)` does not map to MySQL ENUM | Changed to `@Column(columnDefinition="ENUM(...)")` on `Application.status`, `Interview.mode`, `Interview.outcome` |
| 2 | **CORS rejected** — Vite frontend on :5173 blocked | `app.cors.allowed-origins` only had `localhost:3000` | Added `http://localhost:5173` to allowed origins |
| 3 | **Login invalid credentials** — bcrypt hash mismatch | Seed hash `$2a$10$N9qo8u...` did not match "Test@1234" | Generated fresh hash and updated `candidates` and `employers` tables |
| 4 | **Status update 403 Forbidden** — PATCH blocked by CORS | `SecurityConfig.corsConfigurationSource()` only listed `GET,POST,PUT,DELETE,OPTIONS` | Added `PATCH` to allowed methods |
| 5 | **"You have already applied" shows generic error** | `err.response?.data` is `{error:"..."}` object, not string | Extract `.error` or `.message` field before comparing |
| 6 | **ProtectedRoute redirected to `/`** | Navigate target was `/` | Changed to `/login` |
| 7 | **ApplicationsPage missing status values** | Only 5 of 9 statuses in select | Added all 9 ENUM values |

---

## Test Results (Detailed)

### TC-01: Employer Login
**URL:** `/login`  
**Input:** `techcorp@example.com`, `Test@1234`, Role: Employer  
**Expected:** Redirect to `/employer/dashboard`  
**Result:** ✅ PASS — Redirected, dashboard shows "Welcome, Alice Johnson"

---

### TC-02: Employer Dashboard
**URL:** `/employer/dashboard`  
**Expected:** Dashboard with links to Vacancies, Applications, Interviews, Candidate Search  
**Result:** ✅ PASS — All nav links present

---

### TC-03: Vacancy List
**URL:** `/employer/vacancies`  
**Expected:** Table showing all employer vacancies with Edit/Close actions  
**Result:** ✅ PASS — 4 vacancies shown (React Developer, Data Analyst, Full Stack Developer, Software Engineer), all with Open badge

---

### TC-04: Post New Vacancy
**Action:** Click "+ Post New Vacancy" → fill form → submit  
**Input:** Designation: Full Stack Developer, Dept: Technology, Location: Pune, Qual: B.Tech/MCA, Desc: "Full stack role using React + Spring Boot.", Type: Permanent, Exp: 2, Salary: 600000–1100000, Openings: 2, Deadline: 2026-12-31  
**Expected:** New row appears in table  
**Result:** ✅ PASS — "Full Stack Developer / Technology / Pune / Open / 2 / 2026-12-31" row visible

---

### TC-05: Close Vacancy
**Action:** Click "Close" on Full Stack Developer → confirm dialog  
**Expected:** Row status changes to "Closed", Close button disappears  
**Result:** ✅ PASS — Status badge shows "Closed" (gray), only "Edit" button remains

---

### TC-06: View Applications for Vacancy
**URL:** `/employer/applications`  
**Action:** Select "Software Engineer — Bangalore" from dropdown  
**Expected:** Table showing Priya Sharma's application, Applied status, Schedule Interview button  
**Result:** ✅ PASS — Application loaded from backend

---

### TC-07: Update Application Status
**Action:** Change status dropdown from "Applied" to "Shortlisted"  
**Expected:** PATCH `/api/employer/applications/1/status` succeeds, row reflects new status  
**Result:** ✅ PASS (after adding PATCH to CORS allowed methods)

---

### TC-08: Schedule Interview
**Action:** Click "Schedule Interview" for Priya Sharma → fill modal (Round 1, 2026-12-01 10:00, Online, Venue: Conference Room A, Interviewer: John Smith) → Schedule  
**Expected:** Modal closes, interview saved, application status updated to "Interview Scheduled"  
**Result:** ✅ PASS — Modal closed, Interviews page confirms "Interview Scheduled" status

---

### TC-09: Interviews Page — View & Update Outcome
**URL:** `/employer/interviews`  
**Action:** Select "Software Engineer — Bangalore", click "Update Outcome", set ID=1, Outcome=Completed, Remarks="Good performance" → Save  
**Expected:** Outcome saved  
**Result:** ✅ PASS — Modal closed cleanly, no error

---

### TC-10: Candidate Search (no filters)
**URL:** `/employer/search`  
**Action:** Click "Search" with empty filters  
**Expected:** All candidates returned, sorted by percentage DESC  
**Result:** ✅ PASS — 4 candidates: Anita Rao (85.2%), Test User (85%), Priya Sharma (82.5%), Rahul Mehta (78%) with degree, institution, skills, location prefs

---

### TC-11: Candidate Login
**URL:** `/login`  
**Input:** `priya@example.com`, `Test@1234`, Role: Candidate  
**Expected:** Redirect to `/candidate/dashboard`  
**Result:** ✅ PASS — "Welcome, Priya Sharma!" shown

---

### TC-12: Job Search Page
**URL:** `/candidate/jobs`  
**Expected:** Only "Open" vacancies shown (3), not the closed Full Stack Developer  
**Result:** ✅ PASS — React Developer, Data Analyst, Software Engineer displayed. Full Stack Developer (Closed) correctly excluded.

---

### TC-13: Apply for Job (duplicate prevention)
**Action:** Click Apply on "React Developer" → Submit Application  
**Expected:** Since Priya already applied (from seed data), show "You have already applied for this position."  
**Result:** ✅ PASS — Yellow warning alert shown (after fix to extract `error` field from response object)

---

### TC-14: My Applications
**URL:** `/candidate/applications`  
**Expected:** Table showing Priya's 2 applications with colored status badges  
**Result:** ✅ PASS — Software Engineer (Interview Completed, amber badge), React Developer (Applied, gray badge)

---

### TC-15: Candidate Profile
**URL:** `/candidate/profile`  
**Expected:** Profile form pre-filled from backend data  
**Result:** ✅ PASS — Name: Priya Sharma, Phone: 9123456780, DOB: 1998-05-12, Degree: B.Tech CSE, Institution: NIT Warangal, Year: 2020, Percentage: 82.5

---

### TC-16: Protected Route Guard — No Token
**Action:** Clear localStorage, navigate to `/candidate/dashboard`  
**Expected:** Redirect to `/login`  
**Result:** ✅ PASS — URL immediately changed to `http://localhost:5173/login`

---

### TC-17: Protected Route Guard — Wrong Role
**Action:** Log in as employer, navigate to `/candidate/dashboard`  
**Expected:** Redirect to `/login`  
**Result:** ✅ PASS — ProtectedRoute role check blocks access

---

### TC-18: Candidate Registration
**URL:** `/register`  
**Input:** Name: New Test User, Email: newtest@example.com, Phone: 9900000001, Password: Test@1234, Degree: B.Tech IT, Institution: IIT Delhi, Year: 2025, Percentage: 88  
**Expected:** Account created, redirect to `/login`  
**Result:** ✅ PASS — Page redirected to login

---

### TC-19: Login with New Account
**Action:** Login with newtest@example.com / Test@1234 as Candidate  
**Expected:** Successful login → `/candidate/dashboard`  
**Result:** ✅ PASS — "Welcome, New Test User!" shown

---

## Notes

- The "Interview ID" field on the Update Outcome modal requires the user to know the interview ID. This is a UX limitation noted for future enhancement — could auto-populate from the interviews table.
- `package-lock.json` changes (npm dependency resolutions) were not committed as they are build artifacts.
- Email notifications are configured in `application.properties` but require real SMTP credentials for demo — not tested.
- The `docs/seed-data.sql` can be re-run safely (uses `INSERT IGNORE`) to reset data to initial state before demo.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Employer | techcorp@example.com | Test@1234 |
| Candidate | priya@example.com | Test@1234 |
| Candidate (secondary) | rahul@example.com | Test@1234 |

---

## Application URLs

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Spring Boot) | http://localhost:8080 |
| Login | http://localhost:5173/login |
| Register | http://localhost:5173/register |
| Employer Dashboard | http://localhost:5173/employer/dashboard |
| Candidate Dashboard | http://localhost:5173/candidate/dashboard |
