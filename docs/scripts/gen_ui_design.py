"""
gen_ui_design.py  —  generates Artifact4_UI_Design.docx
Run: python3 docs/scripts/gen_ui_design.py
"""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

NAVY = RGBColor(0x1F, 0x38, 0x64)
BLUE = RGBColor(0x2E, 0x75, 0xB6)
GRAY = RGBColor(0x40, 0x40, 0x40)

BASE     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT      = os.path.join(BASE, "Artifact4_UI_Design.docx")
IMG_PATH = "/Users/I578445/Downloads/UI.drawio (1) (1).png"


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


def heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for r in p.runs: r.font.color.rgb = NAVY
    return p


def add_code_block(doc, text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.style = "Table Grid"
    cell = tbl.rows[0].cells[0]
    shade_cell(cell, "F2F2F2")
    para = cell.paragraphs[0]
    run  = para.add_run(text)
    run.font.name = "Courier New"; run.font.size = Pt(8)
    doc.add_paragraph()


def hdr_row(tbl, *labels):
    cells = tbl.rows[0].cells
    for i, lbl in enumerate(labels):
        run = cells[i].paragraphs[0].add_run(lbl)
        run.bold = True; run.font.size = Pt(10)
        shade_cell(cells[i], "BDD7EE")


def add_row(tbl, *values):
    row = tbl.add_row().cells
    for i, v in enumerate(values):
        row[i].text = str(v)
        for para in row[i].paragraphs:
            for r in para.runs: r.font.size = Pt(10)


def build():
    doc = Document()
    for sec in doc.sections:
        sec.top_margin = Inches(1.0); sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.25); sec.right_margin = Inches(1.25)
    add_page_number(doc)

    # ── title block ────────────────────────────────────────────────
    for text, size, bold, color in [
        ("BITS Pilani — Work Integrated Learning Programmes (WILP)", 13, True,  NAVY),
        ("Full Stack Application Development (FSAD)",                11, False, GRAY),
        ("",                                                          0,  False, GRAY),
        ("Online Recruitment Processing System",                      16, True,  NAVY),
        ("Artifact 4 — UI Design & Flow",                            13, True,  NAVY),
        ("",                                                          0,  False, GRAY),
        ("Team: Nimisha Gupta (2025SL70050)  &  Fasi Ahmed Khan J R (2025SL70017)   |   M.Tech — BITS Pilani", 11, False, GRAY),
        ("November 2026",                                             11, False, GRAY),
    ]:
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if text and size:
            r = p.add_run(text); r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color

    div = doc.add_paragraph(); div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = div.add_run("━" * 72); r.font.color.rgb = BLUE; r.font.size = Pt(10)
    doc.add_paragraph()

    # ── 1. Introduction ────────────────────────────────────────────
    heading(doc, "1. Introduction")
    p = doc.add_paragraph()
    p.add_run(
        "This document describes the User Interface design for the Online Recruitment Processing "
        "System — a React 18 Single-Page Application (SPA). It covers the complete application "
        "navigation flow showing how Shared, Employer, and Candidate screens connect, the full "
        "inventory of planned pages with role-based access guards, and detailed descriptions of "
        "each screen including form fields, user actions, decision points, and backend API calls.\n\n"
        "The UI is divided into three swim lanes: Shared screens (Landing, Login, Register), "
        "Employer screens (Dashboard, Vacancy Management, Candidate Search, View Applications, "
        "Schedule Interview, Reports), and Candidate screens (Dashboard, My Profile, Job Search, "
        "My Applications). Email notifications are triggered automatically at key events."
    ).font.size = Pt(11)
    doc.add_paragraph()

    # ── 2. Application Navigation Flow ────────────────────────────
    heading(doc, "2. Application Navigation Flow")
    p = doc.add_paragraph()
    p.add_run(
        "The diagram below is the full UI flow for the Online Recruitment Processing System. "
        "It is organised into three swim lanes — Shared, Employer, and Candidate — and shows "
        "all screens, decision points, and email notification triggers."
    ).font.size = Pt(11)
    doc.add_paragraph()

    # ── Embed the actual UI flow image ────────────────────────────
    if os.path.exists(IMG_PATH):
        doc.add_picture(IMG_PATH, width=Inches(6.5))
        cap = doc.add_paragraph("Figure 1: Online Recruitment Processing System — UI Flow Diagram")
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in cap.runs:
            run.font.size = Pt(9); run.font.italic = True
            run.font.color.rgb = RGBColor(0x60, 0x60, 0x60)
    else:
        doc.add_paragraph(f"[Image not found at: {IMG_PATH}]")

    doc.add_paragraph()

    # ── 3. Planned Pages Inventory ─────────────────────────────────
    heading(doc, "3. Planned Pages Inventory")
    p = doc.add_paragraph()
    p.add_run(
        "The table below lists all planned pages in the React SPA, mapped to swim lanes, "
        "routes, role guards, owning modules, and primary user actions."
    ).font.size = Pt(11)
    doc.add_paragraph()

    PAGES = [
        ("Shared",    "Landing Page",         "/",                            "Public",    "—", "Entry point — links to Login and Register"),
        ("Shared",    "Login",                "/login",                       "Public",    "1",  "Email + password + role; Valid Credentials decision; Show Error on failure"),
        ("Shared",    "Register Employer",    "/register/employer",           "Public",    "1",  "Org + contact details; triggers Email: Registration"),
        ("Shared",    "Register Candidate",   "/register/candidate",          "Public",    "1",  "Personal + academic details; triggers Email: Registration"),
        ("Employer",  "Employer Dashboard",   "/employer/dashboard",          "EMPLOYER",  "1",  "Hub — links to all employer screens"),
        ("Employer",  "Vacancy Management",   "/employer/vacancies",          "EMPLOYER",  "2",  "Post New Vacancy; Edit / Close Vacancy"),
        ("Employer",  "Search Candidates",    "/employer/candidates/search",  "EMPLOYER",  "3",  "Filter; Ranked Results; View Candidate Profile"),
        ("Employer",  "View Applications",    "/employer/applications",       "EMPLOYER",  "5",  "Shortlist / Reject; triggers Email: New Application"),
        ("Employer",  "Schedule Interview",   "/employer/interviews/new",     "EMPLOYER",  "6",  "Interview Form; Update Outcome; triggers Email: Interview Scheduled / Status Change"),
        ("Employer",  "Reports",              "/employer/reports",            "EMPLOYER",  "7",  "Vacancies + Applicant Count; Interview Schedule; Selected/Rejected per Vacancy"),
        ("Candidate", "Candidate Dashboard",  "/candidate/dashboard",         "CANDIDATE", "1",  "Hub — links to all candidate screens"),
        ("Candidate", "My Profile",           "/candidate/profile",           "CANDIDATE", "4",  "Personal/Academic/Experience; Skills & Preferences"),
        ("Candidate", "Job Search",           "/candidate/vacancies",         "CANDIDATE", "5",  "Filter; Ranked Vacancy List; Apply (1-click); Already Applied check"),
        ("Candidate", "My Applications",      "/candidate/applications",      "CANDIDATE", "5",  "Track Application Status; Interview History"),
    ]

    tbl = doc.add_table(rows=1, cols=6)
    tbl.style = "Table Grid"
    hdr_row(tbl, "Lane", "Page", "Route", "Guard", "Mod.", "Primary Action")
    for row in PAGES:
        add_row(tbl, *row)

    doc.add_paragraph()

    # ── 4. Screen Descriptions ─────────────────────────────────────
    heading(doc, "4. Screen Descriptions")
    p = doc.add_paragraph()
    p.add_run(
        "Each screen is described with its swim lane, route, role guard, form fields, "
        "decision points, actions, and backend API calls."
    ).font.size = Pt(11)
    doc.add_paragraph()

    SCREENS = [
        {
            "name": "4.1  Landing Page",
            "lane": "Shared", "route": "/", "guard": "Public",
            "fields": ["Navigation links: Login, Register as Employer, Register as Candidate"],
            "actions": ["Click Login → /login",
                        "Click Register → /register/employer  or  /register/candidate"],
            "api": [],
        },
        {
            "name": "4.2  Login Page",
            "lane": "Shared", "route": "/login", "guard": "Public — redirects to dashboard if already authenticated",
            "fields": ["Email (text input)", "Password (password input)",
                       "Role selector — Employer / Candidate", "Submit button"],
            "actions": ["Submit → POST /api/auth/login",
                        "[Valid Credentials?] decision point:",
                        "  Yes + EMPLOYER → redirect /employer/dashboard",
                        "  Yes + CANDIDATE → redirect /candidate/dashboard",
                        "  No → Show Error message inline (Go to Login link shown)"],
            "api": ["POST /api/auth/login → returns { token, role, userId, name }"],
        },
        {
            "name": "4.3  Register Employer",
            "lane": "Shared", "route": "/register/employer", "guard": "Public",
            "fields": ["Organisation Name* (required)", "Contact Name* (required)",
                       "Email* (required)", "Password* (min 6 chars)",
                       "Phone, Address, Website, Established Year, Num Employees, Annual Turnover (optional)"],
            "actions": ["Submit → POST /api/auth/register/employer",
                        "On success → JWT stored; redirect /employer/dashboard",
                        "Triggers: Email: Registration sent to employer"],
            "api": ["POST /api/auth/register/employer → AuthResponse"],
        },
        {
            "name": "4.4  Register Candidate",
            "lane": "Shared", "route": "/register/candidate", "guard": "Public",
            "fields": ["Full Name* (required)", "Email* (required)", "Password* (min 6 chars)",
                       "Phone, Date of Birth, Gender, Address (optional)",
                       "Degree, Institution, Year of Passing, Percentage (optional)",
                       "Total Experience Years, Expected Salary Min/Max (optional)"],
            "actions": ["Submit → POST /api/auth/register/candidate",
                        "On success → JWT stored; redirect /candidate/dashboard",
                        "Triggers: Email: Registration sent to candidate"],
            "api": ["POST /api/auth/register/candidate → AuthResponse"],
        },
        {
            "name": "4.5  Employer Dashboard",
            "lane": "Employer", "route": "/employer/dashboard", "guard": "ROLE_EMPLOYER required",
            "fields": ["Summary cards: Total Vacancies, Total Applications, Interviews Scheduled",
                       "Quick navigation to: Vacancy Management, Search Candidates, View Applications, Schedule Interview, Reports"],
            "actions": ["Navigate to any employer screen"],
            "api": [],
        },
        {
            "name": "4.6  Vacancy Management",
            "lane": "Employer", "route": "/employer/vacancies", "guard": "ROLE_EMPLOYER required",
            "fields": ["Table: Designation, Department, Status, Posted Date, Salary Range, Openings"],
            "actions": ["Post New Vacancy → form → POST /api/employer/vacancies (201 Created)",
                        "Edit Vacancy → pre-filled form → PUT /api/employer/vacancies/:id",
                        "Close Vacancy → PATCH /api/employer/vacancies/:id/close"],
            "api": ["GET /api/employer/vacancies",
                    "POST /api/employer/vacancies",
                    "PUT /api/employer/vacancies/:id",
                    "PATCH /api/employer/vacancies/:id/close"],
        },
        {
            "name": "4.7  Search Candidates",
            "lane": "Employer", "route": "/employer/candidates/search", "guard": "ROLE_EMPLOYER required",
            "fields": ["Filter inputs: Preferred Role, Location, Salary Min/Max, Qualification, Min Percentage"],
            "actions": ["Filter Candidates → returns Ranked Results (higher merit / closer preference match first)",
                        "View Candidate Profile → full profile with skills and preferences"],
            "api": ["GET /api/employer/candidates/search?role=&location=&salaryMin=&salaryMax=&qualification=&minPercentage=",
                    "GET /api/employer/candidates/:id"],
        },
        {
            "name": "4.8  View Applications",
            "lane": "Employer", "route": "/employer/applications", "guard": "ROLE_EMPLOYER required",
            "fields": ["Table: Candidate Name, Applied Vacancy, Applied Date, Current Status, Cover Note"],
            "actions": ["Shortlist → update status to Shortlisted",
                        "Reject → update status to Rejected",
                        "Triggers: Email: New Application → sent to employer when a new application arrives"],
            "api": ["GET /api/employer/applications",
                    "PUT /api/employer/applications/:id/status"],
        },
        {
            "name": "4.9  Schedule Interview",
            "lane": "Employer", "route": "/employer/interviews/new", "guard": "ROLE_EMPLOYER required",
            "fields": ["Application selector (candidate + vacancy)",
                       "Interview Date & Time* (required)",
                       "Mode* — In-Person / Online / Telephonic",
                       "Venue, Round Number, Interviewer Name, Remarks (optional)"],
            "actions": ["Submit Interview Form → POST /api/employer/interviews",
                        "  → Application status auto-updates to 'Interview Scheduled'",
                        "  → Triggers: Email: Interview Scheduled sent to candidate",
                        "Update Outcome → PUT /api/employer/interviews/:id/outcome",
                        "  Outcomes: Selected / Rejected / Completed / Cancelled",
                        "  → Triggers: Email: Status Change sent to candidate on Selected/Rejected"],
            "api": ["POST /api/employer/interviews",
                    "PUT /api/employer/interviews/:id/outcome"],
        },
        {
            "name": "4.10  Reports",
            "lane": "Employer", "route": "/employer/reports", "guard": "ROLE_EMPLOYER required",
            "fields": ["Date range filter for interviews", "Vacancy selector"],
            "actions": ["Vacancies + Applicant Count → GET /api/employer/reports/vacancies",
                        "Interview Schedule by Date → GET /api/employer/reports/interviews",
                        "Selected / Rejected per Vacancy → included in vacancy report"],
            "api": ["GET /api/employer/reports/vacancies",
                    "GET /api/employer/reports/interviews"],
        },
        {
            "name": "4.11  Candidate Dashboard",
            "lane": "Candidate", "route": "/candidate/dashboard", "guard": "ROLE_CANDIDATE required",
            "fields": ["Summary: Profile Completeness, Active Applications, Upcoming Interviews"],
            "actions": ["Navigate to My Profile, Job Search, My Applications"],
            "api": [],
        },
        {
            "name": "4.12  My Profile",
            "lane": "Candidate", "route": "/candidate/profile", "guard": "ROLE_CANDIDATE required",
            "fields": ["Personal / Academic / Experience: Full Name, Phone, DOB, Gender, Address, Degree, Institution, Year of Passing, Percentage, Total Exp Years, Expected Salary",
                       "Skills & Preferences: Skill Name + Proficiency (Beginner/Intermediate/Expert); Preferred Locations (cities); Preferred Roles (job titles)"],
            "actions": ["Load profile → GET /api/candidate/profile",
                        "Save → PUT /api/candidate/profile (partial update; skills & prefs fully replaced on each save)"],
            "api": ["GET /api/candidate/profile",
                    "PUT /api/candidate/profile"],
        },
        {
            "name": "4.13  Job Search",
            "lane": "Candidate", "route": "/candidate/vacancies", "guard": "ROLE_CANDIDATE required",
            "fields": ["Filter Vacancies: Location, Salary Min/Max, Employment Type",
                       "Vacancy List: ranked by candidate's stored role and location preferences",
                       "Vacancy Detail View: full job description, requirements, salary, deadline"],
            "actions": ["Filter → GET /api/candidate/vacancies (query params)",
                        "Click Vacancy → Vacancy Detail View",
                        "Click Apply → [Already Applied?] decision point:",
                        "  Yes → Show: Already Applied (button disabled, error shown)",
                        "  No  → Apply (1-click) — profile auto-submitted",
                        "        → POST /api/candidate/vacancies/:id/apply"],
            "api": ["GET /api/candidate/vacancies",
                    "POST /api/candidate/vacancies/:id/apply → 201 Created  |  409 Conflict if duplicate"],
        },
        {
            "name": "4.14  My Applications",
            "lane": "Candidate", "route": "/candidate/applications", "guard": "ROLE_CANDIDATE required",
            "fields": ["Table: Vacancy Title, Organisation, Applied Date, Current Status",
                       "Interview History per application: Date, Mode, Venue, Round, Outcome"],
            "actions": ["Track Application Status → GET /api/candidate/applications",
                        "Receives: Email: Interview Scheduled (triggered by employer)",
                        "Receives: Email: Status Change (on Selected/Rejected outcome)"],
            "api": ["GET /api/candidate/applications",
                    "GET /api/candidate/applications/:id/interviews"],
        },
    ]

    for screen in SCREENS:
        heading(doc, screen["name"], 3)

        info_tbl = doc.add_table(rows=3, cols=2)
        info_tbl.style = "Table Grid"
        for i, (lbl, val) in enumerate(zip(
            ["Route", "Swim Lane", "Role Guard"],
            [screen["route"], screen["lane"], screen["guard"]]
        )):
            info_tbl.rows[i].cells[0].text = lbl
            info_tbl.rows[i].cells[1].text = val
            info_tbl.rows[i].cells[0].paragraphs[0].runs[0].bold = True
            shade_cell(info_tbl.rows[i].cells[0], "EBF3FB")
            for c in info_tbl.rows[i].cells:
                for para in c.paragraphs:
                    for run in para.runs: run.font.size = Pt(10)

        doc.add_paragraph()

        p = doc.add_paragraph()
        r = p.add_run("Fields / Data Displayed")
        r.bold = True; r.font.size = Pt(10); r.font.color.rgb = NAVY
        for field in screen["fields"]:
            fp = doc.add_paragraph(style="List Bullet")
            fp.add_run(field).font.size = Pt(10)

        doc.add_paragraph()

        p2 = doc.add_paragraph()
        r2 = p2.add_run("Actions, Decision Points & API Calls")
        r2.bold = True; r2.font.size = Pt(10); r2.font.color.rgb = NAVY
        for action in screen["actions"]:
            ap = doc.add_paragraph(style="List Bullet")
            ap.add_run(action).font.size = Pt(10)

        if screen["api"]:
            doc.add_paragraph()
            p3 = doc.add_paragraph()
            p3.add_run("Backend APIs:").bold = True
            for run in p3.runs: run.font.size = Pt(10)
            for api in screen["api"]:
                ap = doc.add_paragraph(style="List Bullet")
                run = ap.add_run(api)
                run.font.name = "Courier New"; run.font.size = Pt(9)

        doc.add_paragraph()

    # ── 5. PrivateRoute Guard ──────────────────────────────────────
    heading(doc, "5. PrivateRoute Guard Logic")
    p = doc.add_paragraph()
    p.add_run(
        "All protected pages are wrapped with a PrivateRoute component that checks both "
        "the presence of a valid JWT and the user's role. If either check fails, the user "
        "is redirected to /login."
    ).font.size = Pt(11)
    doc.add_paragraph()

    add_code_block(doc, """\
function PrivateRoute({ children, role }) {
  const { auth } = useAuth()           // reads from AuthContext (backed by localStorage)
  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/login" replace />
  return children
}

// Usage in App.jsx:
// <Route path="/employer/vacancies" element={
//   <PrivateRoute role="EMPLOYER"><VacancyManagement /></PrivateRoute>
// } />""")

    # ── 6. Email Notification Triggers ────────────────────────────
    heading(doc, "6. Email Notification Triggers")
    p = doc.add_paragraph()
    p.add_run(
        "The following email notifications are triggered automatically at key points in the UI flow "
        "(shown as dashed yellow ovals in the diagram). All are logged in the notifications table."
    ).font.size = Pt(11)
    doc.add_paragraph()

    tbl = doc.add_table(rows=1, cols=3)
    tbl.style = "Table Grid"
    hdr_row(tbl, "Notification", "Trigger Event", "API Endpoint")
    for row in [
        ("Email: Registration",        "Successful employer or candidate registration",                    "POST /api/auth/register/*"),
        ("Email: New Application",     "Candidate applies to a vacancy — sent to employer",               "POST /api/candidate/vacancies/:id/apply"),
        ("Email: Interview Scheduled", "Employer schedules an interview — sent to candidate",              "POST /api/employer/interviews"),
        ("Email: Status Change",       "Interview outcome updated (Selected/Rejected) — sent to candidate","PUT /api/employer/interviews/:id/outcome"),
    ]:
        add_row(tbl, *row)

    doc.add_paragraph()

    # ── 7. Authentication State Flow ──────────────────────────────
    heading(doc, "7. Authentication State Flow")
    for i, step in enumerate([
        "User submits login form → POST /api/auth/login returns { token, role, userId, name }",
        "AuthContext stores token in React state and persists to localStorage",
        "Axios interceptor adds Authorization: Bearer <token> to every outgoing request",
        "On app reload, AuthContext reads localStorage to restore auth state across refreshes",
        "Logout: AuthContext.logout() clears localStorage → user redirected to /login",
        "Vite dev proxy forwards /api/* from port 3000 to Spring Boot port 8080 — no CORS issues",
    ], 1):
        p = doc.add_paragraph(style="List Number")
        p.add_run(step).font.size = Pt(11)

    doc.save(OUT)
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    build()
