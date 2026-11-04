"""
gen_srs.py  —  generates Artifact3_SRS.docx
Run: python3 docs/scripts/gen_srs.py
"""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

NAVY  = RGBColor(0x1F, 0x38, 0x64)
BLUE  = RGBColor(0x2E, 0x75, 0xB6)
GRAY  = RGBColor(0x40, 0x40, 0x40)

BASE  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT   = os.path.join(BASE, "Artifact3_SRS.docx")


# ── helpers ────────────────────────────────────────────────────────────────
def shade_cell(cell, hex_color):
    tc = cell._tc; tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def add_page_number(doc):
    footer = doc.sections[0].footer
    p = footer.paragraphs[0]; p.clear(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run("Page ")
    fB = OxmlElement('w:fldChar'); fB.set(qn('w:fldCharType'), 'begin')
    iT = OxmlElement('w:instrText'); iT.text = 'PAGE'
    fE = OxmlElement('w:fldChar'); fE.set(qn('w:fldCharType'), 'end')
    run._r.append(fB); run._r.append(iT); run._r.append(fE)


def h(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for run in p.runs: run.font.color.rgb = NAVY
    return p


def body(doc, text, size=11):
    p = doc.add_paragraph()
    run = p.add_run(text); run.font.size = Pt(size)
    return p


def code_block(doc, text):
    tbl = doc.add_table(rows=1, cols=1); tbl.style = "Table Grid"
    cell = tbl.rows[0].cells[0]; shade_cell(cell, "F2F2F2")
    para = cell.paragraphs[0]; run = para.add_run(text)
    run.font.name = "Courier New"; run.font.size = Pt(8.5)
    doc.add_paragraph()


def table(doc, headers, rows, col_widths=None):
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.style = "Table Grid"
    hdr_cells = tbl.rows[0].cells
    for i, hdr in enumerate(headers):
        run = hdr_cells[i].paragraphs[0].add_run(hdr)
        run.bold = True; run.font.size = Pt(10)
        shade_cell(hdr_cells[i], "BDD7EE")
    for row_data in rows:
        row = tbl.add_row().cells
        for i, val in enumerate(row_data):
            row[i].text = str(val)
            for para in row[i].paragraphs:
                for r in para.runs: r.font.size = Pt(9.5)
    if col_widths:
        from docx.shared import Inches as I
        for i, width in enumerate(col_widths):
            for row in tbl.rows:
                row.cells[i].width = I(width)
    doc.add_paragraph()
    return tbl


def numbered_fr(doc, fr_id, text):
    p = doc.add_paragraph()
    run = p.add_run(f"{fr_id}  "); run.bold = True; run.font.size = Pt(11); run.font.color.rgb = NAVY
    run2 = p.add_run(text); run2.font.size = Pt(11)


def build():
    doc = Document()
    for sec in doc.sections:
        sec.top_margin = Inches(1.0); sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.25); sec.right_margin = Inches(1.25)
    add_page_number(doc)

    # ── cover page ─────────────────────────────────────────────────
    for text, size, bold, color in [
        ("BITS Pilani — Work Integrated Learning Programmes (WILP)", 13, True,  NAVY),
        ("Full Stack Application Development (FSAD)",                11, False, GRAY),
        ("Assignment Reference: KT_RecruitmentProcessing System_009",10, False, GRAY),
        ("",                                                           0, False, GRAY),
        ("Software Requirements Specification (SRS)",                18, True,  NAVY),
        ("Online Recruitment Processing System",                      16, True,  NAVY),
        ("",                                                           0, False, GRAY),
        ("Document Version: 2.2   |   Standard: IEEE 830-1998",      11, False, GRAY),
        ("Team: Nimisha Gupta (2025SL70050)  &  Fasi Ahmed Khan J R (2025SL70017)   |   M.Tech — BITS Pilani",   11, False, GRAY),
        ("November 2026",                                             11, False, GRAY),
    ]:
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if text and size:
            r = p.add_run(text); r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color

    div = doc.add_paragraph(); div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = div.add_run("━" * 72); r.font.color.rgb = BLUE; r.font.size = Pt(10)

    doc.add_page_break()

    # ── 1. Introduction ────────────────────────────────────────────
    h(doc, "1. Introduction")

    h(doc, "1.1 Purpose", 2)
    body(doc,
         "This Software Requirements Specification (SRS) defines the complete functional and "
         "non-functional requirements for the Online Recruitment Processing System — a full-stack "
         "web application that automates end-to-end recruitment operations for HR departments and "
         "enables candidates to search, apply, and track job applications online. "
         "This document reflects the actual implemented state of the codebase as verified from "
         "source files, and clearly maps each feature to its implementation phase. "
         "It serves as the authoritative reference for all team members, evaluators, and the "
         "project examiner, structured per IEEE 830-1998.")

    h(doc, "1.2 Scope", 2)
    body(doc,
         "System Name: Online Recruitment Processing System\n"
         "Repository: recruitment-processing-system (GitHub, main branch)\n\n"
         "The system covers the full recruitment lifecycle:\n"
         "Vacancy Posted → Candidate Applies → Employer Searches & Shortlists "
         "→ Interview Scheduled → Outcome Updated → Candidate Notified\n\n"
         "Two primary user types:\n"
         "Employers — register their organisation, post job vacancies, search and filter candidates "
         "by skills and preferences, schedule interviews, and record hiring outcomes.\n"
         "Candidates — register profiles with academic background, skills, and job preferences; "
         "search and apply for vacancies; track application status.")

    h(doc, "1.3 Definitions, Acronyms, and Abbreviations", 2)
    table(doc,
          ["Term", "Definition"],
          [
              ("Employer",   "An HR representative of an organisation using the system to hire candidates"),
              ("Candidate",  "A job seeker who registers and applies through the system"),
              ("Vacancy",    "A job opening posted by an employer"),
              ("Application","A candidate's submission record for a specific vacancy"),
              ("Interview",  "A scheduled meeting between an employer and a candidate"),
              ("JWT",        "JSON Web Token — stateless authentication token"),
              ("SPA",        "Single-Page Application — the React frontend"),
              ("JPA",        "Java Persistence API — ORM layer (Hibernate 6)"),
              ("RBAC",       "Role-Based Access Control"),
              ("DTO",        "Data Transfer Object — input/output contract for API endpoints"),
              ("REST",       "Representational State Transfer"),
              ("SMTP",       "Simple Mail Transfer Protocol — used for email notifications"),
              ("FSAD",       "Full Stack Application Development"),
              ("MTECH",      "Master of Technology"),
          ])

    # ── 2. Overall Description ─────────────────────────────────────
    h(doc, "2. Overall Description")

    h(doc, "2.1 Product Perspective", 2)
    body(doc,
         "The Online Recruitment Processing System is a three-tier web application comprising: "
         "a React 18 SPA frontend (Presentation Tier, Port 3000), a Spring Boot 3.3.4 REST API "
         "backend (Application Tier, Port 8080), and a MySQL 8.0 database (Data Tier, Port 3306). "
         "Email notifications are delivered via Spring Mail using an external SMTP service (Port 587).")

    ARCH_DIAG = """\
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│            React 18 SPA  (Vite — Port 3000)                  │
│  Login · Register · Employer Dashboard · Candidate Profile   │
│  Job Search · Interview Schedule · Reports                   │
│  AuthContext (JWT in localStorage) · Axios Bearer interceptor│
│  React Router v6 · Tailwind CSS · PrivateRoute guards        │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/REST (JSON)
                       │ Authorization: Bearer <JWT>
┌──────────────────────▼───────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│          Spring Boot 3.3.4  REST API  (Port 8080)            │
│  AuthController     /api/auth/**       (public)              │
│  VacancyController  /api/employer/**   (ROLE_EMPLOYER only)  │
│  CandidateController /api/candidate/** (ROLE_CANDIDATE only) │
│  Spring Security 6 (STATELESS) · JwtAuthFilter (jjwt 0.12.6)│
│  Spring Data JPA + Hibernate 6 · Bean Validation            │
│  GlobalExceptionHandler  (400 / 403 / 500)                   │
└──────────────────────┬───────────────────────────────────────┘
                       │ JDBC (HikariCP)
┌──────────────────────▼───────────────────────────────────────┐
│                      DATA LAYER                              │
│                  MySQL 8.0  (Port 3306)                      │
│  employers · candidates · candidate_skills                   │
│  candidate_location_prefs · candidate_role_prefs             │
│  vacancies · applications · interviews · notifications       │
└──────────────────────┬───────────────────────────────────────┘
                       │ SMTP (TLS, Port 587)
┌──────────────────────▼───────────────────────────────────────┐
│                   EXTERNAL SERVICE                           │
│            Spring Mail / JavaMail (smtp.gmail.com)           │
└──────────────────────────────────────────────────────────────┘"""
    code_block(doc, ARCH_DIAG)

    h(doc, "2.2 Product Functions (Summary)", 2)
    table(doc,
          ["#", "Function", "Description"],
          [
              ("1",  "Employer Registration & Login",     "Register org + contact details; JWT login returning ROLE_EMPLOYER"),
              ("2",  "Candidate Registration & Login",    "Register personal/academic details; JWT login returning ROLE_CANDIDATE"),
              ("3",  "Vacancy Management",                "Create, read, update, close job vacancies (employer-owned)"),
              ("4",  "Candidate Profile Management",      "Candidates maintain personal info, academic record, skills, location/role preferences"),
              ("5",  "Candidate Search",                  "Employers filter candidates by qualification, skills, location, salary, merit"),
              ("6",  "Job Search & Apply",                "Candidates view open vacancies, filter, apply (one application per vacancy enforced)"),
              ("7",  "Interview Scheduling",              "Schedule interviews for applicants; date, mode, venue, round, interviewer"),
              ("8",  "Interview Outcome Tracking",        "Record outcomes; application status auto-updates; candidate notified"),
              ("9",  "Email Notifications",               "Emails on registration, interview scheduled, status changes"),
              ("10", "Reports",                           "Employer: vacancy + interview reports; Candidate: application history"),
          ])

    h(doc, "2.3 User Classes", 2)
    table(doc,
          ["User Class", "Description", "Enforced Route Prefix"],
          [
              ("Employer",              "HR representative — posts jobs, manages candidates, schedules interviews", "/api/employer/** (ROLE_EMPLOYER)"),
              ("Candidate",             "Job seeker — manages profile, applies for jobs, tracks applications",     "/api/candidate/** (ROLE_CANDIDATE)"),
              ("Public (unauthenticated)", "Registration and login only",                                          "/api/auth/**"),
          ])

    h(doc, "2.4 Assumptions and Constraints", 2)
    CONSTRAINTS = [
        "Internet connectivity required for SMTP email notifications.",
        "One employer account per contact email (UNIQUE constraint on employers.email).",
        "One candidate account per email (UNIQUE constraint on candidates.email).",
        "One application per candidate per vacancy (UNIQUE KEY uq_application).",
        "JWT tokens expire after 24 hours. No refresh token mechanism in v1.",
        "Schema changes require manually re-running docs/db-schema.sql (ddl-auto=validate).",
        "Passwords stored as BCrypt hashes — never in plaintext, never returned in any API response.",
        "Lombok is declared as a dependency in pom.xml but no Lombok annotations are used in any source file — all entities and DTOs use explicit getters/setters. This ensures compatibility with Java 21 and Java 25.",
    ]
    for c in CONSTRAINTS:
        p = doc.add_paragraph(style="List Bullet"); p.add_run(c).font.size = Pt(11)
    doc.add_paragraph()

    # ── 3. Functional Requirements ─────────────────────────────────
    h(doc, "3. Functional Requirements")

    h(doc, "3.1 Registration & Login (Module 1)", 2)
    FRS_1 = [
        ("FR-1.1", "Employers register with: orgName*, contactName*, email*, password* (min 6 chars); optional: establishedYr, numEmployees, annualTurnover, phone, address, website."),
        ("FR-1.2", "Candidates register with: fullName*, email*, password* (min 6 chars); optional: phone, dob (YYYY-MM-DD), gender, address, degree, institution, yearOfPassing, percentage, totalExpYrs, expectedSalMin, expectedSalMax."),
        ("FR-1.3", "Both registration endpoints return an AuthResponse immediately — no separate login step needed after registration."),
        ("FR-1.4", "Login requires email, password, and role (EMPLOYER or CANDIDATE). Validates BCrypt-hashed passwords and returns an AuthResponse."),
        ("FR-1.5", "AuthResponse contains: token (signed JWT), role, userId (integer PK), name."),
        ("FR-1.6", "Duplicate email registration for the same role returns HTTP 400 with {\"error\": \"Email already registered\"}."),
        ("FR-1.7", "All /api/employer/** and /api/candidate/** endpoints require a valid Bearer token. Requests without a valid token receive HTTP 401. Cross-role access receives HTTP 403."),
    ]
    for fr_id, text in FRS_1: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.2 Vacancy Management (Module 2)", 2)
    FRS_2 = [
        ("FR-2.1", "Employers post vacancies with: designation*, employmentType* (Permanent|Temporary|Contract); optional: department, jobDescription, requiredQual, requiredExpYrs, salaryMin, salaryMax, numOpenings, location, applicationDeadline."),
        ("FR-2.2", "Newly posted vacancies default to status Open."),
        ("FR-2.3", "Employers list only their own vacancies, ordered by postedAt descending."),
        ("FR-2.4", "Employers fetch a single vacancy by ID. If the vacancy belongs to a different employer, HTTP 403 is returned."),
        ("FR-2.5", "Employers update any subset of vacancy fields (partial update). Status can be set to Open, Closed, or On_Hold."),
        ("FR-2.6", "A dedicated PATCH endpoint closes a vacancy by setting its status to Closed."),
        ("FR-2.7", "All vacancy mutation operations enforce ownership: VacancyService.assertOwner throws SecurityException('Access denied') if the email does not match — mapped to HTTP 403."),
    ]
    for fr_id, text in FRS_2: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.3 Candidate Search (Module 3) — Planned", 2)
    FRS_3 = [
        ("FR-3.1", "Employers search candidates using query parameters: role, location, salaryMin, salaryMax, qualification, minPercentage."),
        ("FR-3.2", "Search results are a ranked list of matching candidates — higher merit and closer preference match ranked first."),
        ("FR-3.3", "Employers view the full profile of any candidate returned in search results."),
    ]
    for fr_id, text in FRS_3: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.4 Candidate Profile & Preferences (Module 4)", 2)
    FRS_4 = [
        ("FR-4.1", "Authenticated candidates view their full profile including personal, academic, experience, salary, skills, and preference data."),
        ("FR-4.2", "Candidates update their profile via PUT. Only non-null fields in the request body are applied (partial merge)."),
        ("FR-4.3", "Skills, location preferences, and role preferences are fully replaced on each update: deleteByCandidate_CandidateId is called then entries are re-inserted. Passing an empty list clears all entries."),
        ("FR-4.4", "Candidates specify multiple skills, each with proficiency: Beginner | Intermediate | Expert."),
        ("FR-4.5", "Candidates specify multiple preferred locations and multiple preferred job roles."),
        ("FR-4.6", "updateProfile runs within a @Transactional boundary — if any step fails, the entire update rolls back."),
    ]
    for fr_id, text in FRS_4: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.5 Job Search & Apply (Module 5) — Planned", 2)
    FRS_5 = [
        ("FR-5.1", "Authenticated candidates view all vacancies with status Open."),
        ("FR-5.2", "Candidates filter vacancies by location, salary range, employment type, and required qualification."),
        ("FR-5.3", "Candidates apply for a vacancy with one action; an optional cover note may be included."),
        ("FR-5.4", "Duplicate applications are prevented by UNIQUE KEY uq_application (vacancy_id, candidate_id). A second apply attempt returns HTTP 409 Conflict."),
        ("FR-5.5", "Vacancies matching the candidate's stored role and location preferences are ranked higher."),
        ("FR-5.6", "A new application defaults to status Applied."),
    ]
    for fr_id, text in FRS_5: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.6 Interview Scheduling & Outcome (Module 6) — Planned", 2)
    FRS_6 = [
        ("FR-6.1", "Employers schedule an interview for any candidate who applied to one of their vacancies."),
        ("FR-6.2", "Interview details: interviewDatetime* (required), mode* (In-Person|Online|Telephonic); optional: venue, roundNumber, interviewerName, remarks."),
        ("FR-6.3", "Scheduling an interview triggers an email to the candidate with full details."),
        ("FR-6.4", "The linked application status updates to 'Interview Scheduled' when an interview is created."),
        ("FR-6.5", "Employers update interview outcome: Scheduled | Completed | Cancelled | Selected | Rejected."),
        ("FR-6.6", "Outcomes of Selected or Rejected update the linked application status and send an email to the candidate."),
    ]
    for fr_id, text in FRS_6: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.7 Reports (Module 7) — Planned", 2)
    FRS_7 = [
        ("FR-7.1", "Employers generate: all vacancies with applicant count; interview schedule for a date range; candidates selected/rejected per vacancy."),
        ("FR-7.2", "Candidates view: all applications submitted with current status; interview history per application."),
    ]
    for fr_id, text in FRS_7: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    h(doc, "3.8 Email Notifications (Module 8) — Planned", 2)
    FRS_8 = [
        ("FR-8.1", "The system emails candidates on: successful registration, interview scheduled (with full details), status change (Selected/Offered/Recruited/Rejected)."),
        ("FR-8.2", "The system emails employers on: successful registration, new application received on any of their vacancies."),
        ("FR-8.3", "All email attempts are logged in the notifications table with event_type, recipient_email, subject, body, sent_at, status (Sent|Failed)."),
        ("FR-8.4", "Email failure does not prevent the primary operation from completing. Failure is logged; the primary response still succeeds."),
    ]
    for fr_id, text in FRS_8: numbered_fr(doc, fr_id, text)
    doc.add_paragraph()

    # ── 4. Non-Functional Requirements ────────────────────────────
    h(doc, "4. Non-Functional Requirements")
    table(doc,
          ["ID", "Category", "Requirement"],
          [
              ("NFR-1",  "Performance",    "All standard API responses complete under 2 seconds on a local development machine"),
              ("NFR-2",  "Security",       "Passwords stored using BCryptPasswordEncoder (cost 10) — never in plaintext"),
              ("NFR-3",  "Security",       "JWTs signed with HMAC-SHA256; secret key at least 32 characters; externalized via application.properties"),
              ("NFR-4",  "Security",       "Session policy is STATELESS — no server-side session; token validated per request via JwtAuthFilter"),
              ("NFR-5",  "Security",       "Route-level RBAC: /api/employer/** requires ROLE_EMPLOYER; /api/candidate/** requires ROLE_CANDIDATE; cross-role returns HTTP 403"),
              ("NFR-6",  "Security",       "CORS restricted to http://localhost:3000 by default; configurable via app.cors.allowed-origins"),
              ("NFR-7",  "Data Integrity", "All FK constraints enforced at database level (MySQL InnoDB)"),
              ("NFR-8",  "Data Integrity", "Duplicate application prevented by UNIQUE KEY uq_application (vacancy_id, candidate_id)"),
              ("NFR-9",  "Reliability",    "All API error responses are structured JSON — never raw HTML or stack traces"),
              ("NFR-10", "Reliability",    "Bean Validation errors return HTTP 400 with a map of {fieldName: errorMessage}"),
              ("NFR-11", "Scalability",    "Stateless backend supports horizontal scaling; no server-side session state"),
              ("NFR-12", "Usability",      "React frontend is responsive on desktop (>=1280px) and tablet (>=768px)"),
              ("NFR-13", "Compatibility",  "Frontend works in Chrome, Firefox, Edge (latest 2 versions each)"),
              ("NFR-14", "Maintainability","All entities and DTOs use explicit getters/setters — no Lombok annotations — compatible with Java 21 and Java 25"),
              ("NFR-15", "Portability",    "Backend runs on any OS with Java 21+ and Maven 3.9+; frontend on any OS with Node.js 18+"),
          ])

    # ── 5. System Architecture ─────────────────────────────────────
    h(doc, "5. System Architecture")

    h(doc, "5.1 Layered Backend Architecture", 2)
    body(doc,
         "The backend follows a strict four-layer architecture. Data flows strictly downward; "
         "each layer depends only on the one below it.")
    LAYERS = """\
HTTP Request
     │
     ▼
Controller Layer   — receives HTTP, validates input via @Valid, delegates to service
     │               (AuthController, VacancyController, CandidateController)
     ▼
Service Layer      — business logic, transactions (@Transactional), throws exceptions
     │               (AuthService, VacancyService, CandidateService)
     ▼
Repository Layer   — Spring Data JPA interfaces; derived queries + JPQL
     │               (EmployerRepository, CandidateRepository, VacancyRepository,
     │                CandidateSkillRepository, CandidateLocationPrefRepository,
     │                CandidateRolePrefRepository)
     ▼
Database           — MySQL 8.0 via HikariCP connection pool"""
    code_block(doc, LAYERS)

    h(doc, "5.2 Exception Handling", 2)
    table(doc,
          ["Exception", "HTTP Status", "Response Body"],
          [
              ("IllegalArgumentException",       "400 Bad Request",  '{"error": "<message>"}'),
              ("SecurityException",              "403 Forbidden",    '{"error": "<message>"}'),
              ("MethodArgumentNotValidException", "400 Bad Request",  '{"fieldName": "errorMessage", ...}'),
          ])

    h(doc, "5.3 Security Architecture", 2)
    SEC_DIAG = """\
Incoming Request
      │
      ▼
JwtAuthFilter  (OncePerRequestFilter)
  ├─ Reads "Authorization: Bearer <token>" header
  ├─ Calls jwtUtil.isTokenValid(token) — HMAC-SHA256 verify + expiry check
  ├─ Extracts subject (email) and "role" claim from token payload
  ├─ Creates UsernamePasswordAuthenticationToken
  │    principal = email
  │    authorities = [ "ROLE_EMPLOYER" ]  OR  [ "ROLE_CANDIDATE" ]
  └─ Sets authentication in SecurityContextHolder
      │
      ▼
Spring Security Authorization (SecurityConfig)
  ├─ /api/auth/**          → permitAll()
  ├─ /api/employer/**      → hasRole("EMPLOYER")
  ├─ /api/candidate/**     → hasRole("CANDIDATE")
  └─ anything else         → authenticated()"""
    code_block(doc, SEC_DIAG)

    h(doc, "5.4 JWT Token Structure", 2)
    JWT_DIAG = """\
Header:   { "alg": "HS256", "typ": "JWT" }

Payload:  {
  "sub":    "user@email.com",   ← email; used as @AuthenticationPrincipal
  "role":   "EMPLOYER",         ← custom claim; used to build GrantedAuthority
  "userId": 1,                  ← integer PK
  "iat":    <unix timestamp>,
  "exp":    <iat + 86400>       ← 24-hour expiry
}

Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), secret)"""
    code_block(doc, JWT_DIAG)

    # ── 6. Module Descriptions ─────────────────────────────────────
    h(doc, "6. Module Descriptions")
    table(doc,
          ["#", "Module", "Status", "Owner", "Key Backend Classes"],
          [
              ("1", "Registration & Login",           "Done",    "Fasi Ahmed Khan J R (2025SL70017)",   "AuthController, AuthService, AuthDTOs, JwtUtil, JwtAuthFilter, SecurityConfig"),
              ("2", "Vacancy Management",              "Done",    "Nimisha Gupta (2025SL70050)", "VacancyController, VacancyService, VacancyDTOs, Vacancy, VacancyRepository"),
              ("3", "Candidate Search",                "Planned", "Fasi Ahmed Khan J R (2025SL70017)",   "CandidateSearchController, CandidateSearchService"),
              ("4", "Candidate Profile & Preferences", "Done",    "Nimisha Gupta (2025SL70050)", "CandidateController, CandidateService, CandidateDTOs, 3x Pref Repositories"),
              ("5", "Job Search & Apply",              "Planned", "Fasi Ahmed Khan J R (2025SL70017)",   "JobController, ApplicationService"),
              ("6", "Interview Scheduling",            "Planned", "Nimisha Gupta (2025SL70050)", "InterviewController, InterviewService"),
              ("7", "Reports",                         "Planned", "Nimisha Gupta (2025SL70050)", "ReportController, ReportService"),
              ("8", "Email Notifications",             "Planned", "Nimisha Gupta (2025SL70050)", "NotificationService (Spring Mail)"),
          ])

    # ── 7. API Specification ───────────────────────────────────────
    h(doc, "7. API Specification")

    h(doc, "7.1 Authentication Endpoints — Public", 2)
    table(doc,
          ["Method", "URL", "Request Body", "Response", "HTTP"],
          [
              ("POST", "/api/auth/register/employer",  "EmployerRegisterRequest", "AuthResponse", "200"),
              ("POST", "/api/auth/register/candidate", "CandidateRegisterRequest","AuthResponse", "200"),
              ("POST", "/api/auth/login",              "LoginRequest",            "AuthResponse", "200"),
          ])

    h(doc, "7.2 Employer — Vacancy Endpoints (ROLE_EMPLOYER)", 2)
    table(doc,
          ["Method", "URL", "Request", "Response", "HTTP"],
          [
              ("POST",  "/api/employer/vacancies",         "VacancyCreateRequest",  "VacancyResponse",       "201 Created"),
              ("GET",   "/api/employer/vacancies",         "—",                     "List<VacancyResponse>", "200"),
              ("GET",   "/api/employer/vacancies/{id}",    "—",                     "VacancyResponse",       "200 / 403"),
              ("PUT",   "/api/employer/vacancies/{id}",    "VacancyUpdateRequest",  "VacancyResponse",       "200 / 403"),
              ("PATCH", "/api/employer/vacancies/{id}/close", "—",                 "VacancyResponse",       "200 / 403"),
          ])

    h(doc, "7.3 Candidate — Profile Endpoints (ROLE_CANDIDATE)", 2)
    table(doc,
          ["Method", "URL", "Request", "Response", "HTTP"],
          [
              ("GET", "/api/candidate/profile", "—",                    "ProfileResponse", "200"),
              ("PUT", "/api/candidate/profile", "ProfileUpdateRequest", "ProfileResponse", "200 / 400"),
          ])

    h(doc, "7.4 Employer — Candidate Search (ROLE_EMPLOYER) — Planned", 2)
    table(doc,
          ["Method", "URL", "Query Params", "Response", "HTTP"],
          [
              ("GET", "/api/employer/candidates/search", "role, location, salaryMin, salaryMax, qualification, minPercentage", "List<CandidateSummaryResponse>", "200"),
              ("GET", "/api/employer/candidates/{id}",   "—", "ProfileResponse", "200"),
          ])

    h(doc, "7.5 Candidate — Job Search & Apply (ROLE_CANDIDATE) — Planned", 2)
    table(doc,
          ["Method", "URL", "Request", "Response", "HTTP"],
          [
              ("GET",  "/api/candidate/vacancies",          "Query: location, salaryMin, salaryMax, type, qualification", "List<VacancyResponse>", "200"),
              ("POST", "/api/candidate/vacancies/{id}/apply","{ coverNote } (optional)",                                   "ApplicationResponse",   "201 / 409"),
              ("GET",  "/api/candidate/applications",       "—",                                                           "List<ApplicationResponse>", "200"),
          ])

    h(doc, "7.6 HTTP Status Code Reference", 2)
    table(doc,
          ["Status", "When Used"],
          [
              ("200 OK",              "Successful GET, PUT, PATCH"),
              ("201 Created",         "Successful POST that creates a resource"),
              ("400 Bad Request",     "Business rule violation or Bean Validation failure"),
              ("401 Unauthorized",    "Missing or expired JWT token"),
              ("403 Forbidden",       "Valid token but wrong role, or accessing another employer's resource"),
              ("409 Conflict",        "Duplicate application (same candidate + vacancy)"),
              ("500 Internal Server Error", "Unhandled server-side exception"),
          ])

    # ── 8. Database Design ─────────────────────────────────────────
    h(doc, "8. Database Design")

    h(doc, "8.1 Entity Relationship Overview", 2)
    ER = """\
employers ──< vacancies ──< applications >── candidates
                                │                 │
                            interviews      candidate_skills
                                           candidate_location_prefs
                                           candidate_role_prefs

notifications  (standalone email audit log — no FK dependencies)

Cardinalities:
  employers   1:M  vacancies
  vacancies   1:M  applications
  candidates  1:M  applications  (UNIQUE constraint prevents duplicates)
  applications 1:M interviews    (multiple interview rounds)
  candidates  1:M  candidate_skills / location_prefs / role_prefs"""
    code_block(doc, ER)

    h(doc, "8.2 Table Definitions", 2)

    # employers
    h(doc, "Table: employers", 3)
    table(doc,
          ["Column", "Type", "Constraints", "Description"],
          [
              ("employer_id",    "INT AUTO_INCREMENT", "PK",             "Unique employer identifier"),
              ("org_name",       "VARCHAR(150)",        "NOT NULL",       "Organisation name"),
              ("established_yr", "INT",                 "—",             "Year founded"),
              ("num_employees",  "INT",                 "—",             "Approximate headcount"),
              ("annual_turnover","DECIMAL(15,2)",       "—",             "Annual turnover (INR)"),
              ("contact_name",   "VARCHAR(100)",        "NOT NULL",       "HR contact person's name"),
              ("email",          "VARCHAR(150)",        "NOT NULL UNIQUE","Login email"),
              ("phone",          "VARCHAR(15)",         "—",             "Contact phone"),
              ("password_hash",  "VARCHAR(255)",        "NOT NULL",       "BCrypt-hashed password"),
              ("address",        "VARCHAR(255)",        "—",             "Office address"),
              ("website",        "VARCHAR(150)",        "—",             "Company website URL"),
              ("created_at",     "DATETIME",            "DEFAULT NOW()", "Account creation time"),
              ("is_active",      "BOOLEAN",             "DEFAULT TRUE",  "Soft-delete flag"),
          ])

    # candidates
    h(doc, "Table: candidates", 3)
    table(doc,
          ["Column", "Type", "Constraints", "Description"],
          [
              ("candidate_id",    "INT AUTO_INCREMENT", "PK",            "Unique candidate identifier"),
              ("full_name",       "VARCHAR(100)",        "NOT NULL",      "Full legal name"),
              ("email",           "VARCHAR(150)",        "NOT NULL UNIQUE","Login email"),
              ("phone",           "VARCHAR(15)",         "—",            "Mobile number"),
              ("password_hash",   "VARCHAR(255)",        "NOT NULL",      "BCrypt-hashed password"),
              ("dob",             "DATE",                "—",            "Date of birth"),
              ("gender",          "ENUM",                "—",            "Male / Female / Other"),
              ("address",         "VARCHAR(255)",        "—",            "Residential address"),
              ("degree",          "VARCHAR(100)",        "—",            "Highest degree"),
              ("institution",     "VARCHAR(150)",        "—",            "Institution name"),
              ("year_of_passing", "INT",                 "—",            "Graduation year"),
              ("percentage",      "DECIMAL(5,2)",        "—",            "Academic score"),
              ("total_exp_yrs",   "DECIMAL(4,1)",        "DEFAULT 0",    "Total work experience (years)"),
              ("expected_sal_min","DECIMAL(12,2)",       "—",            "Minimum expected salary (INR)"),
              ("expected_sal_max","DECIMAL(12,2)",       "—",            "Maximum expected salary (INR)"),
              ("created_at",      "DATETIME",            "DEFAULT NOW()","Account creation time"),
              ("is_active",       "BOOLEAN",             "DEFAULT TRUE", "Soft-delete flag"),
          ])

    # vacancies
    h(doc, "Table: vacancies", 3)
    table(doc,
          ["Column", "Type", "Constraints", "Description"],
          [
              ("vacancy_id",         "INT AUTO_INCREMENT","PK",          "Unique vacancy identifier"),
              ("employer_id",        "INT",               "NOT NULL, FK","Posting employer"),
              ("designation",        "VARCHAR(100)",      "NOT NULL",    "Job title"),
              ("department",         "VARCHAR(100)",      "—",          "Department"),
              ("job_description",    "TEXT",              "—",          "Full job description"),
              ("required_qual",      "VARCHAR(150)",      "—",          "Required qualification"),
              ("required_exp_yrs",   "DECIMAL(4,1)",      "DEFAULT 0",  "Minimum years experience"),
              ("salary_min",         "DECIMAL(12,2)",     "—",          "Minimum offered salary"),
              ("salary_max",         "DECIMAL(12,2)",     "—",          "Maximum offered salary"),
              ("employment_type",    "ENUM",              "NOT NULL",   "Permanent / Temporary / Contract"),
              ("num_openings",       "INT",               "DEFAULT 1",  "Number of positions"),
              ("location",           "VARCHAR(100)",      "—",          "Job location city"),
              ("application_deadline","DATE",             "—",          "Last date to apply"),
              ("status",             "ENUM",              "DEFAULT Open","Open / Closed / On_Hold"),
              ("posted_at",          "DATETIME",          "DEFAULT NOW()","Posting timestamp"),
          ])

    # applications
    h(doc, "Table: applications", 3)
    table(doc,
          ["Column", "Type", "Constraints", "Description"],
          [
              ("application_id", "INT AUTO_INCREMENT","PK",              "Unique application identifier"),
              ("vacancy_id",     "INT",               "NOT NULL, FK",    "Applied vacancy"),
              ("candidate_id",   "INT",               "NOT NULL, FK",    "Applying candidate"),
              ("applied_at",     "DATETIME",          "DEFAULT NOW()",   "Submission timestamp"),
              ("status",         "ENUM",              "DEFAULT Applied", "Applied/Shortlisted/Interview Scheduled/..."),
              ("cover_note",     "TEXT",              "—",              "Optional cover letter"),
          ])
    body(doc, "UNIQUE KEY uq_application (vacancy_id, candidate_id) — prevents duplicate applications.")
    doc.add_paragraph()

    # interviews
    h(doc, "Table: interviews", 3)
    table(doc,
          ["Column", "Type", "Constraints", "Description"],
          [
              ("interview_id",       "INT AUTO_INCREMENT","PK",                   "Unique interview identifier"),
              ("application_id",     "INT",               "NOT NULL, FK",         "Associated application"),
              ("round_number",       "INT",               "DEFAULT 1",            "Interview round number"),
              ("interview_datetime", "DATETIME",          "NOT NULL",             "Scheduled date and time"),
              ("mode",               "ENUM",              "DEFAULT In-Person",    "In-Person / Online / Telephonic"),
              ("venue",              "VARCHAR(200)",      "—",                   "Office address or meeting link"),
              ("interviewer_name",   "VARCHAR(100)",      "—",                   "Interviewer's name"),
              ("outcome",            "ENUM",              "DEFAULT Scheduled",    "Scheduled/Completed/Cancelled/Selected/Rejected"),
              ("remarks",            "TEXT",              "—",                   "Notes or feedback"),
              ("created_at",         "DATETIME",          "DEFAULT NOW()",        "When scheduled"),
          ])

    # notifications
    h(doc, "Table: notifications", 3)
    table(doc,
          ["Column", "Type", "Constraints", "Description"],
          [
              ("notification_id", "INT AUTO_INCREMENT","PK",           "Unique notification entry"),
              ("recipient_email", "VARCHAR(150)",      "NOT NULL",     "Recipient email address"),
              ("recipient_type",  "ENUM",              "—",           "Candidate / Employer"),
              ("subject",         "VARCHAR(255)",      "—",           "Email subject line"),
              ("body",            "TEXT",              "—",           "Full email body"),
              ("event_type",      "VARCHAR(80)",       "—",           "Triggering event (e.g. INTERVIEW_SCHEDULED)"),
              ("sent_at",         "DATETIME",          "DEFAULT NOW()","Attempt timestamp"),
              ("status",          "ENUM",              "DEFAULT Sent", "Sent / Failed"),
          ])
    body(doc, "No FK to candidates or employers — notifications are an immutable audit log retained even if users are deleted.")
    doc.add_paragraph()

    h(doc, "8.3 Database Indexes", 2)
    table(doc,
          ["Index", "Table", "Column(s)", "Purpose"],
          [
              ("idx_candidates_degree",      "candidates",   "degree",                "Filter by qualification"),
              ("idx_candidates_percentage",  "candidates",   "percentage",            "Filter by merit score"),
              ("idx_candidates_exp",         "candidates",   "total_exp_yrs",         "Filter by experience"),
              ("idx_vacancies_location",     "vacancies",    "location",              "Candidate job search by location"),
              ("idx_vacancies_salary",       "vacancies",    "(salary_min, salary_max)","Candidate salary range filter"),
              ("idx_vacancies_status",       "vacancies",    "status",                "List only Open vacancies"),
              ("idx_vacancies_employer",     "vacancies",    "employer_id",           "Employer's own vacancy list"),
              ("idx_applications_candidate", "applications", "candidate_id",          "Candidate's application history"),
              ("idx_applications_status",    "applications", "status",                "Filter applications by status"),
              ("idx_interviews_datetime",    "interviews",   "interview_datetime",    "Date-range interview reports"),
          ])

    # ── 9. Security Design ─────────────────────────────────────────
    h(doc, "9. Security Design")

    h(doc, "9.1 Authentication Flow", 2)
    AUTH_STEPS = [
        "Client POST /api/auth/login { email, password, role }",
        "AuthService looks up employer or candidate table by email",
        "passwordEncoder.matches(rawPassword, passwordHash) — validates BCrypt",
        "jwtUtil.generateToken(email, role, userId) — HMAC-SHA256 signed JWT",
        "Returns { token, role, userId, name }",
        "Client stores token in localStorage (React SPA)",
        "Every subsequent request: Authorization: Bearer <token>",
        "JwtAuthFilter validates token, sets SecurityContext with email + ROLE_*",
        "@AuthenticationPrincipal String email resolves to token subject in controllers",
    ]
    for i, step in enumerate(AUTH_STEPS, 1):
        p = doc.add_paragraph(style="List Number"); p.add_run(step).font.size = Pt(11)
    doc.add_paragraph()

    h(doc, "9.2 Authorization Rules", 2)
    table(doc,
          ["Route", "Allowed", "Unauthorized Response"],
          [
              ("/api/auth/**",      "Any request (no token)", "—"),
              ("/api/employer/**",  "ROLE_EMPLOYER only",     "HTTP 403"),
              ("/api/candidate/**", "ROLE_CANDIDATE only",    "HTTP 403"),
              ("Anything else",     "Any authenticated user", "HTTP 401 if no token"),
          ])

    h(doc, "9.3 Resource Ownership Enforcement", 2)
    body(doc,
         "Beyond role-level routing, vacancy operations enforce per-employer ownership. "
         "VacancyService.assertOwner checks the authenticated employer's email against the vacancy owner. "
         "If they do not match, it throws SecurityException('Access denied'), which GlobalExceptionHandler "
         "maps to HTTP 403 Forbidden.")

    # ── 10. Frontend Architecture ──────────────────────────────────
    h(doc, "10. Frontend Architecture")
    body(doc,
         "The frontend is designed as a React 18 SPA under the frontend/ directory and is currently "
         "in active development. Member 2 (Nimisha Gupta, 2025SL70050) owns the frontend.")

    h(doc, "10.1 Technology Stack", 2)
    table(doc,
          ["Component", "Technology"],
          [
              ("Framework",    "React 18 (functional components + hooks)"),
              ("Build Tool",   "Vite (HMR + proxy to backend port 8080)"),
              ("Routing",      "React Router v6"),
              ("Styling",      "Tailwind CSS 3"),
              ("HTTP Client",  "Axios with Bearer token request interceptor"),
              ("Auth State",   "React Context API + localStorage"),
          ])

    h(doc, "10.2 Planned Page Inventory", 2)
    table(doc,
          ["Page", "Route", "Role Guard", "Module"],
          [
              ("Login",               "/login",                       "Public",    "1"),
              ("Register Employer",   "/register/employer",           "Public",    "1"),
              ("Register Candidate",  "/register/candidate",          "Public",    "1"),
              ("My Vacancies",        "/employer/vacancies",          "EMPLOYER",  "2"),
              ("Post Job",            "/employer/vacancies/new",      "EMPLOYER",  "2"),
              ("Edit Vacancy",        "/employer/vacancies/:id/edit", "EMPLOYER",  "2"),
              ("Candidate Search",    "/employer/candidates/search",  "EMPLOYER",  "3"),
              ("Candidate Profile",   "/candidate/profile",           "CANDIDATE", "4"),
              ("Job List",            "/candidate/vacancies",         "CANDIDATE", "5"),
              ("My Applications",     "/candidate/applications",      "CANDIDATE", "5"),
              ("Schedule Interview",  "/employer/interviews/new",     "EMPLOYER",  "6"),
              ("Employer Reports",    "/employer/reports",            "EMPLOYER",  "7"),
              ("Candidate Reports",   "/candidate/reports",           "CANDIDATE", "7"),
          ])

    # ── 11. Use Cases ──────────────────────────────────────────────
    h(doc, "11. Use Cases")

    UCS = [
        {
            "title": "UC-01: Employer Registers and Posts a Vacancy",
            "actor": "Employer",
            "pre": "Email not previously registered",
            "steps": [
                "POST /api/auth/register/employer with org + contact details → receives JWT",
                "POST /api/employer/vacancies with vacancy fields → 201, vacancy created (status: Open)",
            ],
            "post": "Vacancy visible to candidates in job search",
        },
        {
            "title": "UC-02: Candidate Registers, Builds Profile, Applies",
            "actor": "Candidate",
            "pre": "Email not previously registered",
            "steps": [
                "POST /api/auth/register/candidate → receives JWT",
                "PUT /api/candidate/profile with skills, location prefs, role prefs → profile updated",
                "POST /api/candidate/vacancies/{id}/apply → 201, application created (status: Applied)",
            ],
            "post": "Application appears in employer's applicant list",
        },
        {
            "title": "UC-03: Employer Searches Candidates, Schedules Interview",
            "actor": "Employer",
            "pre": "Employer authenticated; candidates with matching profiles exist",
            "steps": [
                "GET /api/employer/candidates/search?role=...&location=...&minPercentage=70 → ranked list",
                "POST /api/employer/interviews with application_id, datetime, mode, venue → interview created",
                "Application status auto-updates to 'Interview Scheduled'; email sent to candidate",
            ],
            "post": "Interview record created; candidate notified via email",
        },
        {
            "title": "UC-04: Employer Records Interview Outcome",
            "actor": "Employer",
            "pre": "Interview exists in Scheduled state",
            "steps": [
                "PUT /api/employer/interviews/{id}/outcome with outcome: 'Selected'",
                "Application status updates to 'Selected'; email sent to candidate",
            ],
            "post": "Candidate receives selection notification",
        },
        {
            "title": "UC-05: Candidate Tracks Application Status",
            "actor": "Candidate",
            "pre": "Candidate has submitted at least one application",
            "steps": [
                "GET /api/candidate/applications → list with current status per application",
            ],
            "post": "Candidate sees latest status for all applications",
        },
    ]

    for uc in UCS:
        h(doc, uc["title"], 2)
        p = doc.add_paragraph()
        p.add_run("Actor: ").bold = True; p.add_run(uc["actor"] + "\n")
        p.add_run("Precondition: ").bold = True; p.add_run(uc["pre"])
        p.runs[-1].font.size = Pt(11)
        for run in p.runs: run.font.size = Pt(11)
        h(doc, "Flow", 3)
        for i, step in enumerate(uc["steps"], 1):
            sp = doc.add_paragraph(style="List Number"); sp.add_run(step).font.size = Pt(11)
        p2 = doc.add_paragraph(); p2.add_run("Postcondition: ").bold = True
        p2.add_run(uc["post"])
        for run in p2.runs: run.font.size = Pt(11)
        doc.add_paragraph()

    # ── 12. Implementation Status ──────────────────────────────────
    h(doc, "12. Implementation Status")

    h(doc, "12.1 Backend — Implemented", 2)
    table(doc,
          ["Module", "#", "Implemented Endpoints", "Status"],
          [
              ("Registration & Login", "1",
               "POST /api/auth/register/employer, POST /api/auth/register/candidate, POST /api/auth/login",
               "Done"),
              ("Vacancy Management", "2",
               "POST /api/employer/vacancies (201), GET all, GET {id}, PUT {id}, PATCH {id}/close",
               "Done"),
              ("Candidate Profile", "4",
               "GET /api/candidate/profile, PUT /api/candidate/profile",
               "Done"),
          ])

    h(doc, "12.2 Backend — Upcoming Modules", 2)
    table(doc,
          ["Module", "#", "Owner", "Depends On"],
          [
              ("Candidate Search",     "3", "Fasi Ahmed Khan J R (2025SL70017)",   "Modules 1, 4 (candidates + prefs populated)"),
              ("Job Search & Apply",   "5", "Fasi Ahmed Khan J R (2025SL70017)",   "Modules 1, 2, 4"),
              ("Interview Scheduling", "6", "Nimisha Gupta (2025SL70050)", "Module 5 (applications must exist)"),
              ("Reports",              "7", "Nimisha Gupta (2025SL70050)", "Modules 2–6"),
              ("Email Notifications",  "8", "Nimisha Gupta (2025SL70050)", "Modules 1, 5, 6"),
          ])

    h(doc, "12.3 Frontend — In Development", 2)
    body(doc,
         "The React frontend is being built under the frontend/ directory as part of the current "
         "development sprint. Member 2 (Nimisha Gupta, 2025SL70050) owns the frontend. The full page inventory, "
         "routing strategy, and component architecture are documented in Section 10.")
    doc.add_paragraph()

    # ── 13. Appendix ───────────────────────────────────────────────
    h(doc, "13. Appendix")

    h(doc, "13.1 Team Responsibility Split", 2)
    table(doc,
          ["Member", "Modules Owned", "Backend", "Frontend"],
          [
              ("Fasi Ahmed Khan J R (2025SL70017)",   "1 (Auth), 3 (Candidate Search), 5 (Job Search & Apply)",
               "AuthController, AuthService, AuthDTOs, JwtUtil, JwtAuthFilter, SecurityConfig; future: CandidateSearchController, JobController, ApplicationService",
               "Login, Register pages, CandidateSearch.jsx, JobList.jsx, MyApplications.jsx"),
              ("Nimisha Gupta (2025SL70050)", "2 (Vacancy Mgmt), 4 (Candidate Profile), 6 (Interview), 7 (Reports), 8 (Email) + Frontend overall",
               "VacancyController, CandidateController + services; future: InterviewController, ReportController, NotificationService",
               "All frontend pages"),
          ])

    h(doc, "13.2 How to Run", 2)
    STEPS_RUN = [
        "Start MySQL:  brew services start mysql",
        "Set up database (run once):  mysql -u root < docs/db-schema.sql",
        "Configure backend/src/main/resources/application.properties  (DB credentials, JWT secret, SMTP settings)",
        "Start backend:  cd backend && mvn spring-boot:run",
        "API available at http://localhost:8080",
        "Pre-seeded test accounts: Employer hr@techcorp.com / Test@1234, Candidate priya@example.com / Test@1234",
    ]
    for i, step in enumerate(STEPS_RUN, 1):
        p = doc.add_paragraph(style="List Number"); p.add_run(step).font.size = Pt(11)
    doc.add_paragraph()

    h(doc, "13.3 Document History", 2)
    table(doc,
          ["Version", "Date", "Changes"],
          [
              ("1.0", "October 2026",  "Initial SRS — functional requirements, use cases, module breakdown, tech stack"),
              ("2.0", "November 2026", "Full rewrite aligned to codebase — exact versions, real API endpoints, JWT structure, Spring Security config, full DB schema, frontend architecture plan"),
              ("2.1", "November 2026", "Re-verified against every source file — corrected exception HTTP codes, repository method names, Lombok note, Maven version"),
              ("2.2", "November 2026", "Tone revised to be positive and professional — 'pending' replaced with 'planned/upcoming/in development'; all technical content preserved"),
          ])

    doc.save(OUT)
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    build()
