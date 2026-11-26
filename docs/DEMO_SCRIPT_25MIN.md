# RecPro — 25-Minute Demo Script
**Total time:** 25 min live demo + 5 min PPT = 30 min  
**Password for all accounts:** `Test@1234`  
**Keep this open in a second window during demo**

---

## ACCOUNTS — QUICK REFERENCE

| Role | Email | Notes |
|---|---|---|
| Employer (main) | `hr@technova.com` | 7 vacancies, 8 applicants on Java Backend role |
| Candidate (selected) | `priya@demo.com` | AI score 91, Selected |
| Candidate (new) | `nisha@demo.com` | No applications — use for live apply |
| Admin | `admin@recpro.com` | Platform oversight |

---

## SECTION 1 — PUBLIC LANDING PAGE (2 min)

**Start:** http://localhost:5173 — not logged in

- Point out: 25 job openings, 5 companies, 10 candidates in stats bar
- Show job cards — company name in blue, job description preview
- Click "Apply Now" on any card → redirected to login
- **Say:** *"Unauthenticated users can browse but cannot apply — clicking Apply Now sends them to login."*

> **Code if asked:** `frontend/src/pages/LandingPage.jsx` → `onClick` on Apply Now button checks `isLoggedInCandidate`, else calls `navigate('/login')`

---

## SECTION 2 — CANDIDATE: APPLY FOR A JOB (5 min)

**Login as:** `nisha@demo.com` / Test@1234 → go to `/candidate/jobs`

**2a — Job detail modal**
- Click "Apply" on **AWS Trainee Engineer** (CloudEdge, Pune)
- Detail modal opens — point out: company name in blue header, full job description, salary, qualifications
- **Say:** *"Candidates read the full job description before committing to apply — reduces mismatched applications."*
- Click "Apply Now" in the modal footer

> **Code if asked:** `frontend/src/pages/candidate/JobSearchPage.jsx` — card `onClick` sets `setDetailVacancy(v)`, not the apply form. The "Apply Now" in the modal footer does `setDetailVacancy(null); openModal(detailVacancy)`

**2b — Submit application with resume**
- Upload any PDF → write a short cover note → Submit
- **Say:** *"Resume is mandatory — PDF only, 5 MB max. It's a two-step API call: first POST /applications, then POST /applications/{id}/resume."*

> **Code if asked:** `backend/src/main/java/com/recruitment/controller/ResumeController.java` — validates content-type, saves as `{applicationId}_{filename}`, updates `resume_path` on the application

**2c — Applied job sinks to bottom**
- Stay on Job Search — AWS Trainee now shows "Applied ✓" at the bottom of the list
- **Say:** *"Applied jobs de-prioritise automatically so unapplied ones stay visible."*

> **Code if asked:** `frontend/src/pages/candidate/JobSearchPage.jsx` → `.sort((a,b) => appliedIds.has(a.vacancyId)?1:0 - appliedIds.has(b.vacancyId)?1:0)` — `appliedIds` loaded from `/api/applications/my` on mount so it persists across reloads

---

## SECTION 3 — EMPLOYER WORKFLOW (12 min — the core)

**Logout → go to** http://localhost:5173/employer/login  
**Login as:** `hr@technova.com` / Test@1234

**3a — Vacancy Management (2 min)**
- Click "Vacancies" → show 7 open positions
- Click Edit on **Senior Java Backend Developer** → scroll through the full job description textarea
- **Say:** *"Rich job descriptions are stored as TEXT in MySQL — no length limit. This is what candidates see before applying."*
- Close without saving

> **Code if asked:** `frontend/src/pages/employer/VacancyManagementPage.jsx` → `jobDescription` textarea with 6 rows. `backend/src/main/java/com/recruitment/entity/Vacancy.java` → `@Column(columnDefinition = "TEXT")`. Scheduler at `backend/.../scheduler/VacancyExpiryScheduler.java` auto-closes past-deadline vacancies nightly via `@Scheduled`

**3b — Applications: the main demo (8 min)**
- Click "Applications" → select **Senior Java Backend Developer** from the list
- **Say:** *"This one vacancy has 8 applicants — every status in the lifecycle is represented."*

Walk the left panel (click each, narrate the right panel):

| Click this card | Status | Say this |
|---|---|---|
| Amit Kulkarni | Interview Scheduled | "AI score 95 — highest. Interview already scheduled." |
| Priya Sharma | Selected | "AI score 91 — selected. The AI correctly ranked her second overall." |
| Arun Nambiar | Rejected | "Score 85 but rejected — salary expectation exceeded budget. AI score is a guide, not the decision." |
| Vikram Singh | Shortlisted | "Score 73 — shortlisted for discussion." |
| Rahul Mehta | Interview Completed | "Interview done — remarks show he struggled with Java specifics." |
| Deepa Krishnan | Applied | "Score 28 — fresher applying for a senior role. AI correctly flagged low match." |
| Anita Rao | Withdrawn | "Candidate withdrew — acknowledged it was a mismatch." |

- With **Amit Kulkarni** selected, point to the right panel:
  - Blue AI summary callout
  - Cover note
  - Resume download → click it → PDF opens
  - Update Status pills at the bottom

- **Say:** *"Everything in one panel — AI summary, cover note, resume, and all actions. No page navigation needed."*

> **Code if asked:** `frontend/src/pages/employer/ApplicationsPage.jsx` — two-panel layout, `selectedApp` state drives the right panel. `STATUS_COLORS` map for coloured pills. **Why two-panel instead of a table?** Tables can only show a few columns; this layout shows the full application detail without leaving the page — same pattern as Gmail and Jira.

**3c — Update Status + notification (1 min)**
- Click on **Sneha Joshi** (Applied, score 55)
- In the right panel, click the **Shortlist** pill
- **Say:** *"One click updates the status and instantly notifies the candidate."*

> **Code if asked:** `backend/src/main/java/com/recruitment/service/ApplicationService.java` → `updateStatus()` calls `notificationService.notify()` after saving — custom message per status (Shortlisted gets congratulations, Rejected gets a polite decline)

**3d — Schedule Interview (1 min)**
- Vikram Singh is Shortlisted — click his card
- Fill Schedule Interview form: date = day after tomorrow, Mode = Online, Interviewer = "Arjun Kapoor"
- Click Schedule
- **Say:** *"Scheduling auto-updates status to 'Interview Scheduled' and notifies the candidate with date, mode, and interviewer details."*

> **Code if asked:** `backend/src/main/java/com/recruitment/service/InterviewService.java` — creates `interviews` row linked by `application_id` FK, then calls `applicationService.updateStatus()` to set "Interview Scheduled"

---

## SECTION 4 — CANDIDATE: MY APPLICATIONS (3 min)

**Logout → login as:** `priya@demo.com` / Test@1234 → `/candidate/applications`

- Show **Selected** status — green "Congratulations" banner at top of card
- Show the **Status Journey** tracker — 5 steps, Selected is fully lit
- Click "View Details" → show cover note and Resume download
- **Say:** *"The candidate sees their full application history with a visual progress tracker. Terminal states like Selected, Rejected, and Withdrawn are greyed out — no further actions possible."*

- Show the **🚩 Report** button on the card
- **Say:** *"The Report button appears only on this page — only after the candidate has applied. We don't show it on the job search page because a candidate who hasn't interacted with the employer has no basis for a report."*

> **Code if asked:** `frontend/src/pages/candidate/MyApplicationsPage.jsx` — `showReport` state, button only rendered if `employerId` is truthy. `employerId` is returned from the backend in `ApplicationResponse` DTO. `backend/.../dto/ApplicationDTOs.java` → `private Integer employerId`. `backend/.../service/ApplicationService.java` → `toResponse()` sets `r.setEmployerId(app.getVacancy().getEmployer().getEmployerId())`

---

## SECTION 5 — ADMIN DASHBOARD (2 min)

**Logout → go to** http://localhost:5173/admin/login  
**Login as:** `admin@recpro.com` / Test@1234

- Show Employers list — Active pills, report bell icons
- Show Candidates list — Active/Inactive pills
- **Say:** *"The admin sees all employers and candidates across the platform. Any report filed by a candidate against an employer lands here for review. The admin can deactivate accounts."*

> **Code if asked:** `backend/src/main/java/com/recruitment/controller/AdminController.java` → `PATCH /api/admin/employers/{id}/deactivate`. **Why is admin stored in the candidates table?** Avoids a separate one-row table — the `role` column (`CANDIDATE` / `ADMIN`) distinguishes the type. `AuthService.login()` checks the role before issuing an admin-scoped JWT.

---

## SECTION 6 — SECURITY (1 min — only if asked)

> **JWT flow:** `security/JwtUtil.java` generates a 24-hour signed token on login. `security/JwtAuthFilter.java` intercepts every request, validates the token, and sets the Spring Security principal to the user's email.
>
> **Route protection:** `frontend/src/components/ProtectedRoute.jsx` reads `role` from localStorage — wrong-role users are redirected. Backend double-checks ownership on every service call (e.g. employer cannot access another employer's applications — IDOR prevention).
>
> **Why JWT over sessions?** Stateless — no server-side session store needed. Scales horizontally without sticky sessions.

---

## IF THE DEMO BREAKS — RESET IN 5 SECONDS

```bash
mysql -u root recruitment_db < docs/seed-demo.sql
```

Truncates and reloads everything cleanly. Then restart the backend.

---

## LIKELY QUESTIONS (30-second answers)

**Why Spring Boot?** Strong typing, built-in security, JPA ORM, production-ready — right choice for an enterprise data-heavy system.

**Why MySQL?** Recruitment data is highly relational — candidates, vacancies, applications, interviews all reference each other with foreign keys. ACID transactions matter here.

**Why two-panel layout on Applications page?** Tables force horizontal scrolling and can't show deep detail. Two-panel shows everything about one application without navigating away — same UX pattern as Gmail, Jira, and Outlook.

**What does the AI actually do?** Sends the job description + cover note to an AI API, gets back a 1–100 score and plain-English summary. Stored on the `applications` table. Fully automated on submission.

**What prevents double-applying?** `ApplicationService.apply()` queries `existsByVacancy_VacancyIdAndCandidate_CandidateIdAndStatusNot(vacancyId, candidateId, "Withdrawn")` — throws if a non-withdrawn application already exists.

**What is the 3-month cooldown?** After withdrawal, `withdrawnAt.plusMonths(3)` is compared to now in `apply()`. Prevents candidates from gaming the system by repeatedly applying and withdrawing.
