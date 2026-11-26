# RecPro — Demo Script & Code Walkthrough Guide
**Presentation duration:** ~60–70 minutes  
**Password for all accounts:** `Test@1234`  
**URLs:** Frontend → http://localhost:5173 | Backend → http://localhost:8080

---

## Before You Start — Checklist

- [ ] Backend running (`mvn spring-boot:run` inside `backend/`)
- [ ] Frontend running (`npm run dev` inside `frontend/`)
- [ ] Browser open at http://localhost:5173 — **not logged in**
- [ ] MySQL running with seed data loaded (`docs/seed-demo.sql`)
- [ ] Browser zoom at ~90% so more content is visible
- [ ] Open VS Code / IDE with the project — lecturer will ask to see code
- [ ] Keep this script open in a second window or printed

---

## ACCOUNTS CHEAT SHEET

| Role | Email | Password | Purpose |
|---|---|---|---|
| Employer (main) | `hr@technova.com` | Test@1234 | TechNova — 7 vacancies, 8 applicants |
| Employer 2 | `hr@infosysbpm.com` | Test@1234 | Infosys BPM — 5 vacancies |
| Employer 3 | `hr@databridge.com` | Test@1234 | DataBridge — 4 vacancies |
| Employer 4 | `hr@cloudedge.com` | Test@1234 | CloudEdge — 4 vacancies |
| Employer 5 | `hr@finserv.com` | Test@1234 | FinServ Capital — 5 vacancies |
| Candidate (selected) | `priya@demo.com` | Test@1234 | 91 AI score, Selected status |
| Candidate (interview) | `amit@demo.com` | Test@1234 | 95 AI score, Interview Scheduled |
| Candidate (new apply) | `nisha@demo.com` | Test@1234 | No applications — good for live demo |
| Admin | `admin@recpro.com` | Test@1234 | Full platform oversight |

---

## PART 1 — LANDING PAGE & CANDIDATE REGISTRATION
**~8 minutes**

### 1.1 — Show the public landing page
- Navigate to http://localhost:5173
- **Say:** "This is the public landing page — anyone can browse open positions without logging in."
- Point out: stats bar (25 openings, 5 companies, 10 candidates), job cards, location search
- Click "Apply Now" on any card → it redirects to login → **say:** "If a visitor tries to apply, they're sent to the login page — unauthenticated users cannot submit applications."

### 1.2 — Show job detail modal
- Log in as `nisha@demo.com`
- Come back to landing page
- Click "Apply Now" on "Senior Java Backend Developer" (TechNova)
- **Say:** "Instead of immediately going to the apply form, the candidate first sees the full job details — description, salary, location, qualifications — so they can make an informed decision."
- Point out the company name in blue at the top of the modal, the full job description section

> **If asked to show code:**
> File: `frontend/src/pages/LandingPage.jsx`
> - `detailVacancy` state — clicking Apply Now sets `setDetailVacancy(v)` (not the apply modal)
> - Detail modal JSX around line 414 — dark header with company name in `#60a5fa`
> - Footer "Apply Now" button: `setDetailVacancy(null); handleApplyClick(detailVacancy)`
> - **Why not show apply form directly?** Candidates must read the JD before applying to reduce mismatched applications

### 1.3 — Live registration (optional — shows the flow)
- Click "Register" in navbar
- Register as a new candidate (or skip and log in as `nisha@demo.com`)
- **Say:** "Registration captures personal details, education, skills, location preferences, and role preferences — this profile data powers the employer's candidate search."

> **If asked to show code:**
> File: `frontend/src/pages/RegisterPage.jsx`
> File: `backend/src/main/java/com/recruitment/controller/AuthController.java` → `POST /api/auth/register`
> File: `backend/src/main/java/com/recruitment/service/AuthService.java` → `registerCandidate()`
> - **Why BCrypt?** Passwords never stored plain text — `passwordEncoder.encode(req.getPassword())` at line 59

---

## PART 2 — CANDIDATE APPLIES FOR A JOB
**~8 minutes**

### 2.1 — Apply as Nisha (fresh candidate, no prior applications)
- Logged in as `nisha@demo.com`
- Go to http://localhost:5173/candidate/jobs (Job Search page)
- **Say:** "The Job Search page shows all open vacancies. Candidates can filter by location and salary."
- Click "Apply" on "AWS Trainee Engineer" (CloudEdge)
- Detail modal opens → click "Apply Now"
- Upload a PDF resume → write a cover note → Submit
- **Say:** "Resume upload is mandatory — PDF only, 5 MB max. The application is submitted in two steps: first the application record, then the resume file, linked by application ID."

> **If asked to show code:**
> File: `frontend/src/pages/candidate/JobSearchPage.jsx` → `handleApply()` function
> - Two-step API call: `POST /api/applications` then `POST /api/applications/{id}/resume`
> File: `backend/src/main/java/com/recruitment/controller/ResumeController.java`
> - Validates PDF content-type and 5 MB limit before saving
> - Filename format: `{applicationId}_{originalFilename}` — prevents collisions
> File: `backend/src/main/java/com/recruitment/service/ApplicationService.java` → `apply()`
> - **Why ddl-auto=validate?** Schema is managed manually via ALTER TABLE — Hibernate only validates, never auto-creates or drops tables in production

### 2.2 — Show applied jobs sink to bottom
- After applying, stay on Job Search page
- **Say:** "Notice the job Nisha just applied to has moved to the bottom of the list and shows 'Applied ✓' — applied jobs are deprioritised so unapplied ones are always shown first."

> **If asked to show code:**
> File: `frontend/src/pages/candidate/JobSearchPage.jsx`
> - `appliedIds` Set populated from `GET /api/applications/my` on mount
> - `.sort((a,b) => appliedIds.has(a.vacancyId)?1:0 - appliedIds.has(b.vacancyId)?1:0)`
> - **Why load on mount?** Persists applied state across page reloads — not just in-memory

### 2.3 — Show My Applications page
- Navigate to My Applications (`/candidate/applications`)
- **Say:** "The My Applications page shows the full application lifecycle with a visual status journey — Applied → Shortlisted → Interview Scheduled → Interview Completed → Selected."
- Log out, log in as `priya@demo.com`
- Show Priya's applications — **Selected** status on Senior Java Backend Developer
- Show `amit@demo.com` — Interview Scheduled with interview date/time visible

> **If asked to show code:**
> File: `frontend/src/pages/candidate/MyApplicationsPage.jsx`
> - `StatusJourney` component — step tracker with coloured circles
> - Terminal states (Rejected/Withdrawn) shown in red banner, greyed out, no further actions
> - `ApplicationCard` expanded view shows interview details when status is 'Interview Scheduled' / 'Interview Completed'

---

## PART 3 — EMPLOYER WORKFLOW (MAIN DEMO SECTION)
**~20 minutes — this is the core demo**

### 3.1 — Employer Login & Dashboard
- Log out, navigate to http://localhost:5173/employer/login
- Log in as `hr@technova.com` / Test@1234
- **Say:** "TechNova Solutions is a software product company. They have 7 open positions posted on RecPro."
- Show the Employer Dashboard — notification bell, quick stats

> **If asked to show code:**
> File: `frontend/src/pages/employer/EmployerDashboard.jsx`
> File: `backend/src/main/java/com/recruitment/security/JwtUtil.java` — JWT generation
> File: `backend/src/main/java/com/recruitment/security/JwtAuthFilter.java` — JWT validation on every request
> - **Why JWT?** Stateless authentication — no server-side session storage needed, scales horizontally
> - JWT stored in httpOnly cookie — prevents XSS-based token theft

### 3.2 — Vacancy Management
- Click "Vacancies" in navbar → `VacancyManagementPage`
- **Say:** "TechNova has posted 7 positions. Each vacancy has a full job description, salary range, number of openings, deadline, and department."
- Click "Edit" on "Senior Java Backend Developer"
- Show the job description textarea — scroll through the real JD
- **Say:** "Employers write detailed job descriptions. This is what candidates see in the detail modal before applying."
- Close without saving

> **If asked to show code:**
> File: `frontend/src/pages/employer/VacancyManagementPage.jsx`
> File: `backend/src/main/java/com/recruitment/controller/VacancyController.java`
> File: `backend/src/main/java/com/recruitment/entity/Vacancy.java`
> - `jobDescription` field is `TEXT` in MySQL — no length limit for real JDs
> - `status` enum: Open / Closed / On Hold
> - **Why not auto-close on deadline?** `VacancyExpiryScheduler.java` runs nightly at midnight and auto-closes expired vacancies via `@Scheduled(cron = "0 0 0 * * *")`

> **If asked to show VacancyExpiryScheduler:**
> File: `backend/src/main/java/com/recruitment/scheduler/VacancyExpiryScheduler.java`
> - `@EnableScheduling` on main app class
> - Finds all Open vacancies past their deadline, sets status = Closed

### 3.3 — Applications Page (THE KEY DEMO — spend the most time here)
- Click "Applications" in navbar
- **Say:** "This is the core employer workflow — managing all applications across all vacancies."
- **Say:** "Let me show you the Senior Java Backend Developer vacancy — it has 8 applicants at different stages."
- Click on that vacancy in the left panel (or filter to it)
- Walk through each applicant card:

**Left panel — click each card and narrate:**

| Candidate | Status | AI Score | What to say |
|---|---|---|---|
| Amit Kulkarni | Interview Scheduled | 95 | "Highest AI score — 95. Interview is scheduled." |
| Priya Sharma | Selected | 91 | "Selected — the best outcome. AI correctly identified her as top candidate." |
| Arun Nambiar | Rejected | 85 | "High score but rejected — salary expectation mismatch. AI score alone doesn't determine outcome." |
| Vikram Singh | Shortlisted | 73 | "Shortlisted — DevOps background, wants to pivot to Java." |
| Rahul Mehta | Interview Completed | 62 | "Interview done — struggled with Java-specific questions per the interview remarks." |
| Sneha Joshi | Applied | 55 | "New application — JS developer learning Java." |
| Deepa Krishnan | Applied | 28 | "Fresher applying for a senior role — very low match." |
| Anita Rao | Withdrawn | 38 | "Candidate withdrew — she acknowledged it was a mismatch." |

- **Say:** "Every status in the application lifecycle is covered in this single vacancy."

**Show the right-hand detail panel:**
- Click on Amit Kulkarni's card
- Point out: AI summary callout (blue box), cover note, resume download link, Update Status pill buttons, Schedule Interview form
- Click "Download Resume" — PDF opens
- **Say:** "The employer can read the AI summary, review the cover note, download the resume, and take action — all in one panel."

> **If asked to show code:**
> File: `frontend/src/pages/employer/ApplicationsPage.jsx`
> - Two-panel layout: left = card list, right = detail panel
> - `StatusBadge` component with `STATUS_COLORS` map — coloured pills instead of Bootstrap badges
> - `selectedApp` state drives the right panel
> - Resume download: `GET /api/resumes/{filename}`
> **Why two-panel instead of a table?**
> - Tables require horizontal scrolling on small screens
> - Two-panel lets employer see the full application detail without navigating away
> - Status pills are more scannable than dropdown text

### 3.4 — AI Analysis
- With Amit Kulkarni selected in the detail panel, point to the blue AI summary box
- **Say:** "RecPro uses AI to automatically score and summarise every application. The AI reads the cover note, cross-references it with the job description, and produces a 1–100 score and a plain-English recommendation."

> **If asked to show code:**
> File: `backend/src/main/java/com/recruitment/service/AiAnalysisService.java`
> File: `backend/src/main/java/com/recruitment/controller/AiAnalysisController.java`
> - Calls OpenAI / AI API with the JD + cover note as context
> - Returns `aiScore` (int) and `aiSummary` (text) stored on the `applications` table
> File: `backend/src/main/java/com/recruitment/entity/Application.java` — `aiScore`, `aiSummary` fields
> - **Why AI scoring?** Removes unconscious bias from initial screening — employer sees the score before reading the name. Also reduces screening time from hours to seconds for high-volume roles.

### 3.5 — Update Application Status
- With any "Applied" candidate selected, click "Shortlist" in the Update Status pills
- **Say:** "Status update is a single click. The candidate receives an instant notification."
- Show the notification modal/bell

> **If asked to show code:**
> File: `backend/src/main/java/com/recruitment/service/ApplicationService.java` → `updateStatus()`
> File: `backend/src/main/java/com/recruitment/service/NotificationService.java`
> - Every status change triggers `notificationService.notify()` — sends to both candidate and employer
> - Custom messages per status: Shortlisted gets congratulations, Rejected gets a polite decline message
> - **Why not email?** Notifications stored in DB and shown in-app — email is infrastructure-dependent; in-app always works

### 3.6 — Schedule Interview
- Select Vikram Singh (Shortlisted)
- In the detail panel, fill in the Schedule Interview form:
  - Date: pick a date 2 days from now
  - Mode: Online
  - Interviewer: "Arjun Kapoor"
- Click "Schedule Interview"
- **Say:** "Scheduling an interview automatically updates the application status to 'Interview Scheduled' and notifies the candidate with the date, mode, and interviewer details."

> **If asked to show code:**
> File: `frontend/src/pages/employer/ApplicationsPage.jsx` → interview form section in right panel
> File: `backend/src/main/java/com/recruitment/controller/InterviewController.java`
> File: `backend/src/main/java/com/recruitment/service/InterviewService.java`
> File: `backend/src/main/java/com/recruitment/entity/Interview.java`
> - Interview entity linked to Application by `application_id` FK
> - Scheduling auto-sets application status to "Interview Scheduled"

---

## PART 4 — CANDIDATE SEARCH (EMPLOYER SIDE)
**~5 minutes**

### 4.1 — Search Candidates
- Click "Search Candidates" in employer navbar
- **Say:** "Employers can proactively search the candidate pool — they don't have to wait for applications."
- Filter by skill: type "Java" → results show Java-skilled candidates with proficiency levels
- Filter by location: "Bangalore"
- **Say:** "Skills appear as coloured tags. Employers can see experience years, expected salary range, and contact details."

> **If asked to show code:**
> File: `frontend/src/pages/employer/CandidateSearchPage.jsx`
> File: `backend/src/main/java/com/recruitment/controller/EmployerSearchController.java`
> File: `backend/src/main/java/com/recruitment/service/EmployerSearchService.java`
> - JPQL query with optional skill/location/experience filters
> - `candidate_skills` join — searches across all skills for a candidate
> - **Why not full-text search?** Skill-based filtering is more precise for recruitment than keyword search

---

## PART 5 — INTERVIEW MANAGEMENT
**~5 minutes**

### 5.1 — Interviews Page
- Click "Interviews" in employer navbar
- **Say:** "All scheduled interviews in one view — candidate name, vacancy, date/time, mode, and interviewer."
- Show Amit Kulkarni's upcoming interview (3 days from now, Online with Arjun Kapoor)
- Show Rahul Mehta's completed interview with remarks
- Click "Update Outcome" on a Scheduled interview → select "Completed" → add remarks → Save
- **Say:** "After the interview, the employer records the outcome. If selected or rejected here, the application status updates automatically."

> **If asked to show code:**
> File: `frontend/src/pages/employer/InterviewsPage.jsx`
> File: `backend/src/main/java/com/recruitment/controller/InterviewController.java`
> File: `backend/src/main/java/com/recruitment/service/InterviewService.java` → `updateOutcome()`
> - Outcome enum: Scheduled / Completed / Cancelled / Selected / Rejected
> - Updates both `interviews.outcome` and `applications.status` in a single transaction

---

## PART 6 — NOTIFICATIONS
**~3 minutes**

### 6.1 — Employer Notifications
- Click the bell icon in TechNova's navbar
- **Say:** "Employers receive notifications when candidates apply, withdraw, or when status changes."
- Show the 2 unread notifications (new application from Deepa, withdrawal from Anita)

### 6.2 — Candidate Notifications
- Log out → log in as `priya@demo.com`
- Click notifications in candidate navbar
- **Say:** "Priya has two notifications — one confirming her application submission, one confirming she was selected."

> **If asked to show code:**
> File: `backend/src/main/java/com/recruitment/service/NotificationService.java`
> File: `backend/src/main/java/com/recruitment/entity/Notification.java`
> File: `backend/src/main/java/com/recruitment/controller/NotificationController.java`
> - `GET /api/notifications/my` — filtered by authenticated user's email
> - `PATCH /api/notifications/{id}/read` — mark as read
> - Stored in `notifications` table — `recipient_email`, `recipient_type`, `subject`, `body`, `event_type`

---

## PART 7 — CANDIDATE: MY APPLICATIONS & WITHDRAW
**~5 minutes**

### 7.1 — My Applications deep dive (as Priya)
- Already logged in as `priya@demo.com`
- Navigate to My Applications
- **Show:** Selected status — green banner "Congratulations! You have been selected"
- **Show:** Status Journey tracker — all steps visible, Selected is the last step lit green
- Click "View Details" on the application → show cover note, AI score visible (from employer side — not shown to candidate, but resume download works)

### 7.2 — Withdraw an application (as Nisha, the one you just applied)
- Log out → log in as `nisha@demo.com`
- My Applications → find the AWS Trainee Engineer application
- Click "Withdraw"
- A modal asks for a reason → type "Accepted another offer"
- Confirm withdrawal
- **Say:** "Withdrawal requires a reason — the employer is notified with the reason. A 3-month cooldown prevents candidates from repeatedly applying and withdrawing to game the system."

> **If asked to show code:**
> File: `frontend/src/pages/candidate/MyApplicationsPage.jsx` → `ConfirmModal`, `handleWithdraw()`
> File: `backend/src/main/java/com/recruitment/service/ApplicationService.java` → `withdrawApplication()`
> - Sets `status = Withdrawn`, records `withdrawn_at` timestamp
> - 3-month cooldown check in `apply()`: `withdrawnAt.plusMonths(3)` — throws `IllegalArgumentException` if too soon
> - **Why 3-month cooldown?** Prevents application spam and signals to employers that candidates are serious

### 7.3 — Report button (after applying)
- While on My Applications with a valid application
- **Say:** "The Report button appears only after a candidate has applied. We deliberately don't show it on the job search page — a candidate can only report an employer they've actually interacted with."
- Click "🚩 Report" → show the inline form: star rating, issue category pills, details text
- **Say:** "Reports go to the admin for review — employers can be deactivated if patterns emerge."

> **If asked to show code:**
> File: `frontend/src/pages/candidate/MyApplicationsPage.jsx`
> - `showReport` state per card, only rendered if `employerId` is truthy
> - `employerId` comes from `ApplicationResponse` DTO — added specifically to enable this feature
> File: `backend/src/main/java/com/recruitment/dto/ApplicationDTOs.java` → `employerId` field in `ApplicationResponse`
> File: `backend/src/main/java/com/recruitment/service/ApplicationService.java` → `toResponse()`: `r.setEmployerId(app.getVacancy().getEmployer().getEmployerId())`
> File: `backend/src/main/java/com/recruitment/controller/ReportController.java`
> - **Why move report to My Applications, not job cards?** A candidate who hasn't applied has no basis for a conduct report. Placing it after application ensures the interaction actually happened.

---

## PART 8 — ADMIN DASHBOARD
**~5 minutes**

### 8.1 — Admin login
- Log out → navigate to http://localhost:5173/admin/login
- Log in as `admin@recpro.com` / Test@1234
- **Say:** "The admin has a bird's-eye view of the entire platform."

### 8.2 — Show Employers list
- **Say:** "Admin can see all registered employers with their activation status."
- Show Active / Pending pills
- Click "View" on TechNova — see their details
- Show the report bell icon — if TechNova had reports, the bell would be highlighted

### 8.3 — Show Candidates list
- **Say:** "Same for candidates — admin can see who is active, deactivate suspicious accounts, and see any reports filed against them."
- Point out the Admin pill on `admin@recpro.com`

### 8.4 — Reports (if time allows)
- **Say:** "Every report filed by a candidate against an employer, or by an employer against a candidate, lands here for admin review. The admin can deactivate the reported party."

> **If asked to show code:**
> File: `frontend/src/pages/admin/AdminDashboard.jsx`
> File: `backend/src/main/java/com/recruitment/controller/AdminController.java`
> File: `backend/src/main/java/com/recruitment/service/AdminService.java`
> - `PATCH /api/admin/employers/{id}/deactivate` — sets `is_active = false`
> - Deactivated employer's JWT is still valid until expiry, but their vacancies are hidden from public listing
> - **Why store admin in candidates table?** Avoids a separate admin table — `role` column distinguishes: CANDIDATE / ADMIN. Auth logic checks role before granting admin routes.

---

## PART 9 — SECURITY & ARCHITECTURE (CODE-FOCUSED)
**~5 minutes — only if lecturer asks**

### JWT Authentication Flow
> File: `backend/src/main/java/com/recruitment/security/SecurityConfig.java`
> - `permitAll()` on `/api/auth/**` and `/api/vacancies/open` — public endpoints
> - Everything else requires a valid JWT
> File: `backend/src/main/java/com/recruitment/security/JwtAuthFilter.java`
> - Extracts JWT from `Authorization: Bearer` header
> - Calls `JwtUtil.validateToken()` → sets `SecurityContextHolder` with the user's email as principal
> File: `backend/src/main/java/com/recruitment/security/JwtUtil.java`
> - `generateToken(email, role)` — 24-hour expiry
> - `validateToken()` — checks signature + expiry

### Database Design
> File: `backend/src/main/java/com/recruitment/entity/` — all JPA entities
> File: `docs/db-schema.sql` — full schema with FKs and indexes
> Key design decisions:
> - `application_id` FK in `interviews` — one interview record per round per application
> - `candidate_skills` separate table — allows multiple skills with proficiency levels
> - `status` as MySQL ENUM — prevents invalid status values at DB level
> - `ddl-auto=validate` — schema immutable in production, only Hibernate validation

### Role-Based Access Control
> File: `frontend/src/components/ProtectedRoute.jsx`
> - Reads `role` from localStorage (set at login)
> - Redirects wrong-role users: employer trying to access `/candidate/*` → `/employer/dashboard`
> File: `backend/src/main/java/com/recruitment/service/ApplicationService.java`
> - Every service method verifies ownership: `if (!app.getVacancy().getEmployer().getEmail().equals(employerEmail)) throw new SecurityException("Access denied")`
> - **Why check ownership in service, not just JWT?** Prevents an authenticated employer from accessing another employer's applications by guessing IDs (IDOR — Insecure Direct Object Reference)

---

## LIKELY QUESTIONS & ANSWERS

**Q: Why Spring Boot and not Node.js or Django?**
> Spring Boot gives us strong typing, built-in dependency injection, JPA/Hibernate ORM, and production-grade security via Spring Security — all out of the box. For an enterprise recruitment system where data integrity matters, Java's type safety reduces runtime errors.

**Q: Why MySQL and not PostgreSQL or MongoDB?**
> Recruitment data is highly relational — candidates, vacancies, applications, interviews all reference each other with FKs. MySQL 8 supports full ACID transactions, window functions, and JSON columns if needed later. MongoDB would require manual join logic.

**Q: Why not use a table for the Applications page?**
> Tables require horizontal scrolling on smaller screens and can only show a few columns. The two-panel layout lets the employer see a full application detail — cover note, resume, AI summary, action buttons — without a separate page navigation. It's the pattern used by Gmail, Outlook, and Jira.

**Q: What is the AI actually doing?**
> `AiAnalysisService` sends the job description and the candidate's cover note to an AI API. The prompt asks it to score the candidate 1–100 and write a plain-English summary explaining the score. The score and summary are stored on the `applications` table. This is fully automated on application submission.

**Q: How is the resume securely served?**
> `ResumeController.downloadResume()` resolves the filename against the upload directory path and calls `.normalize()` to prevent path traversal attacks (e.g. `../../etc/passwd`). The file is served as `application/pdf` with a `Content-Disposition: attachment` header.

**Q: What prevents a candidate from applying to the same job twice?**
> `ApplicationService.apply()` calls `applicationRepository.existsByVacancy_VacancyIdAndCandidate_CandidateIdAndStatusNot(vacancyId, candidateId, "Withdrawn")` — if a non-withdrawn application exists, it throws `IllegalArgumentException("Already applied")`.

**Q: What is the 3-month cooldown about?**
> After withdrawal, the same candidate cannot re-apply for the same vacancy for 3 months. The check in `apply()` finds any prior withdrawn application and compares `withdrawnAt.plusMonths(3)` to now. If the cooldown hasn't passed, an `IllegalArgumentException` is thrown with the exact re-apply date.

**Q: How does the notification system work?**
> `NotificationService.notify()` saves a row to the `notifications` table with the recipient email, type, subject, body, and event type. The frontend polls `GET /api/notifications/my` on page load and shows unread count on the bell. There's no WebSocket — polling is sufficient for a demo; production would use SSE or WebSocket.

**Q: Why is the admin stored in the candidates table?**
> To avoid a third table that would only ever have one or two rows. The `role` column (`CANDIDATE` / `ADMIN`) distinguishes the type. Auth logic in `AuthService.login()` checks the role before issuing an admin-scoped JWT. This is a common pattern in smaller systems.

---

## RESET DATA (if demo goes wrong mid-session)

If the database gets into a bad state, run:
```bash
mysql -u root recruitment_db < docs/seed-demo.sql
```
This truncates all tables and reloads clean data in ~2 seconds.

---

## FILE QUICK-REFERENCE (for when lecturer asks "show me the code")

| Feature | Frontend file | Backend file |
|---|---|---|
| Landing / job cards | `pages/LandingPage.jsx` | `controller/PublicVacancyController.java` |
| Job detail modal | `pages/LandingPage.jsx` (line ~414) | — |
| Candidate login | `pages/LoginPage.jsx` | `service/AuthService.java` |
| Candidate register | `pages/RegisterPage.jsx` | `controller/AuthController.java` |
| Job search | `pages/candidate/JobSearchPage.jsx` | `controller/PublicVacancyController.java` |
| Apply for job | `pages/candidate/JobSearchPage.jsx` → `handleApply()` | `service/ApplicationService.java` → `apply()` |
| Resume upload | `pages/candidate/JobSearchPage.jsx` | `controller/ResumeController.java` |
| My Applications | `pages/candidate/MyApplicationsPage.jsx` | `service/ApplicationService.java` → `getCandidateApplications()` |
| Withdraw | `pages/candidate/MyApplicationsPage.jsx` → `handleWithdraw()` | `service/ApplicationService.java` → `withdrawApplication()` |
| Report employer | `pages/candidate/MyApplicationsPage.jsx` → `handleReport()` | `controller/ReportController.java` |
| Employer login | `pages/employer/EmployerLoginPage.jsx` | `service/AuthService.java` → `login()` |
| Vacancy management | `pages/employer/VacancyManagementPage.jsx` | `service/VacancyService.java` |
| Applications (two-panel) | `pages/employer/ApplicationsPage.jsx` | `service/ApplicationService.java` |
| Update status | `pages/employer/ApplicationsPage.jsx` | `service/ApplicationService.java` → `updateStatus()` |
| AI score | `pages/employer/ApplicationsPage.jsx` (displayed) | `service/AiAnalysisService.java` |
| Schedule interview | `pages/employer/ApplicationsPage.jsx` | `service/InterviewService.java` |
| Interviews page | `pages/employer/InterviewsPage.jsx` | `controller/InterviewController.java` |
| Candidate search | `pages/employer/CandidateSearchPage.jsx` | `service/EmployerSearchService.java` |
| Notifications | `pages/employer/EmployerNotificationsPage.jsx` | `service/NotificationService.java` |
| Admin dashboard | `pages/admin/AdminDashboard.jsx` | `service/AdminService.java` |
| JWT auth | `api/axios.js` (interceptor) | `security/JwtAuthFilter.java`, `JwtUtil.java` |
| Route protection | `components/ProtectedRoute.jsx` | `security/SecurityConfig.java` |
| Vacancy auto-close | — | `scheduler/VacancyExpiryScheduler.java` |
