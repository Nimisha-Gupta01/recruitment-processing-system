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

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(BASE, "Artifact4_UI_Design.docx")


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
        ("Team: Nimisha Gupta (2025SL70050)  &  Fassi Ahmed Khan J R (2025SL70017)   |   M.Tech — BITS Pilani",   11, False, GRAY),
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
        "This document describes the planned User Interface design for the Online Recruitment "
        "Processing System frontend — a React 18 Single-Page Application (SPA). It covers the "
        "application navigation flow, the full inventory of planned pages, role-based access guards, "
        "and detailed descriptions of each screen including the form fields, available actions, and "
        "the backend API calls each screen triggers.\n\n"
        "The frontend is built using React 18, Vite, React Router v6, Tailwind CSS, and Axios. "
        "Authentication state is managed via an AuthContext backed by localStorage."
    ).font.size = Pt(11)

    doc.add_paragraph()

    # ── 2. Application Navigation Flow ────────────────────────────
    heading(doc, "2. Application Navigation Flow")
    p = doc.add_paragraph()
    p.add_run(
        "The diagram below shows the high-level navigation structure of the application. "
        "All protected routes check for a valid JWT and the correct role — unauthenticated "
        "users are redirected to /login."
    ).font.size = Pt(11)
    doc.add_paragraph()

    FLOW = """\
                         ┌──────────────────┐
                         │   / (root)       │
                         │   → /login       │
                         └────────┬─────────┘
               ┌──────────────────┼──────────────────┐
               │                  │                  │
   ┌───────────▼──────────┐       │      ┌───────────▼──────────┐
   │  /register/employer  │       │      │  /register/candidate │
   └───────────┬──────────┘       │      └───────────┬──────────┘
               │                  │                  │
               └─────────┐ ┌──────▼──────┐ ┌────────┘
                          │ │   /login    │ │
                          │ └──────┬──────┘ │
                          └────────┼────────┘
                                   │
                    JWT stored in AuthContext / localStorage
                                   │
               ┌───────────────────┼───────────────────┐
               │                                       │
   ┌───────────▼───────────────┐       ┌───────────────▼───────────┐
   │   EMPLOYER DASHBOARD      │       │   CANDIDATE DASHBOARD     │
   │   (requires ROLE_EMPLOYER)│       │  (requires ROLE_CANDIDATE)│
   └───────────┬───────────────┘       └───────────────┬───────────┘
               │                                       │
   ┌───────────▼───────────────┐       ┌───────────────▼───────────┐
   │ /employer/vacancies       │       │ /candidate/profile        │
   │ /employer/vacancies/new   │       │ /candidate/vacancies      │
   │ /employer/vacancies/:id/  │       │ /candidate/applications   │
   │    edit                   │       │ /candidate/reports        │
   │ /employer/candidates/     │       └───────────────────────────┘
   │    search                 │
   │ /employer/interviews/new  │
   │ /employer/reports         │
   └───────────────────────────┘"""
    add_code_block(doc, FLOW)

    # ── 3. Planned Pages Inventory ─────────────────────────────────
    heading(doc, "3. Planned Pages Inventory")
    p = doc.add_paragraph()
    p.add_run(
        "The table below lists all planned pages in the React SPA, their routes, access guards, "
        "owning module, and primary user action."
    ).font.size = Pt(11)
    doc.add_paragraph()

    PAGES = [
        ("Login",               "/login",                             "Public",    "1", "Email + password login; returns JWT"),
        ("Register Employer",   "/register/employer",                 "Public",    "1", "Org + contact details registration"),
        ("Register Candidate",  "/register/candidate",                "Public",    "1", "Personal + academic details registration"),
        ("My Vacancies",        "/employer/vacancies",                "EMPLOYER",  "2", "List all vacancies posted by employer"),
        ("Post Job",            "/employer/vacancies/new",            "EMPLOYER",  "2", "Create a new job vacancy"),
        ("Edit Vacancy",        "/employer/vacancies/:id/edit",       "EMPLOYER",  "2", "Update vacancy fields or close vacancy"),
        ("Candidate Search",    "/employer/candidates/search",        "EMPLOYER",  "3", "Filter candidates by skills/location/salary"),
        ("Candidate Profile",   "/candidate/profile",                 "CANDIDATE", "4", "View and update personal profile + skills"),
        ("Job List",            "/candidate/vacancies",               "CANDIDATE", "5", "Browse open vacancies with filters"),
        ("My Applications",     "/candidate/applications",            "CANDIDATE", "5", "Track all submitted applications + status"),
        ("Schedule Interview",  "/employer/interviews/new",           "EMPLOYER",  "6", "Schedule interview for an applicant"),
        ("Employer Reports",    "/employer/reports",                  "EMPLOYER",  "7", "Vacancy summaries and interview records"),
        ("Candidate Reports",   "/candidate/reports",                 "CANDIDATE", "7", "Application history and interview results"),
    ]

    tbl = doc.add_table(rows=1, cols=5)
    tbl.style = "Table Grid"
    hdr_row(tbl, "Page", "Route", "Role Guard", "Module", "Primary Action")
    for row in PAGES:
        add_row(tbl, *row)

    doc.add_paragraph()

    # ── 4. Screen Descriptions ─────────────────────────────────────
    heading(doc, "4. Screen Descriptions")
    p = doc.add_paragraph()
    p.add_run(
        "Each screen below is described with its route, role guard, input fields or displayed data, "
        "available user actions, and the backend API endpoint invoked."
    ).font.size = Pt(11)
    doc.add_paragraph()

    SCREENS = [
        {
            "name": "4.1  Login",
            "route": "/login",
            "guard": "Public — redirects to dashboard if already authenticated",
            "fields": ["Email (text input)", "Password (password input)", "Role selector — Employer / Candidate"],
            "actions": ["Submit → POST /api/auth/login → JWT stored in localStorage and AuthContext",
                        "Link: Register as Employer → /register/employer",
                        "Link: Register as Candidate → /register/candidate"],
            "on_success": "ROLE_EMPLOYER → /employer/vacancies  |  ROLE_CANDIDATE → /candidate/profile",
        },
        {
            "name": "4.2  Register Employer",
            "route": "/register/employer",
            "guard": "Public",
            "fields": ["Organisation Name* (required)", "Contact Name* (required)",
                       "Email* (required)", "Password* (min 6 chars)",
                       "Phone, Address, Website, Established Year, Num Employees, Annual Turnover (optional)"],
            "actions": ["Submit → POST /api/auth/register/employer → JWT returned immediately"],
            "on_success": "Redirect to /employer/vacancies",
        },
        {
            "name": "4.3  Register Candidate",
            "route": "/register/candidate",
            "guard": "Public",
            "fields": ["Full Name* (required)", "Email* (required)", "Password* (min 6 chars)",
                       "Phone, Date of Birth, Gender, Address (optional)",
                       "Degree, Institution, Year of Passing, Percentage (optional academic)",
                       "Total Experience Years, Expected Salary Min/Max (optional)"],
            "actions": ["Submit → POST /api/auth/register/candidate → JWT returned immediately"],
            "on_success": "Redirect to /candidate/profile",
        },
        {
            "name": "4.4  My Vacancies (Employer Dashboard)",
            "route": "/employer/vacancies",
            "guard": "ROLE_EMPLOYER required",
            "fields": ["Table: Designation, Department, Status, Posted Date, Salary Range, Openings"],
            "actions": ["Click Post New Job → /employer/vacancies/new",
                        "Click Edit → /employer/vacancies/:id/edit",
                        "Click Close → PATCH /api/employer/vacancies/:id/close"],
            "on_success": "GET /api/employer/vacancies — lists only this employer's vacancies",
        },
        {
            "name": "4.5  Post Job",
            "route": "/employer/vacancies/new",
            "guard": "ROLE_EMPLOYER required",
            "fields": ["Designation* (required)", "Employment Type* (Permanent/Temporary/Contract)",
                       "Department, Job Description, Required Qualification, Required Experience",
                       "Salary Min/Max, Number of Openings, Location, Application Deadline (optional)"],
            "actions": ["Submit → POST /api/employer/vacancies → returns 201 Created"],
            "on_success": "Redirect to /employer/vacancies",
        },
        {
            "name": "4.6  Edit Vacancy",
            "route": "/employer/vacancies/:id/edit",
            "guard": "ROLE_EMPLOYER required; ownership enforced server-side",
            "fields": ["Pre-filled with existing vacancy data (GET /api/employer/vacancies/:id)",
                       "All fields editable including Status (Open / On_Hold / Closed)"],
            "actions": ["Save → PUT /api/employer/vacancies/:id (partial update — only changed fields sent)",
                        "Close Vacancy → PATCH /api/employer/vacancies/:id/close"],
            "on_success": "Updated vacancy reflected in My Vacancies list",
        },
        {
            "name": "4.7  Candidate Search",
            "route": "/employer/candidates/search",
            "guard": "ROLE_EMPLOYER required",
            "fields": ["Filter inputs: Preferred Role, Location, Salary Min, Salary Max, Qualification, Min Percentage"],
            "actions": ["Search → GET /api/employer/candidates/search (query params)",
                        "View Profile → GET /api/employer/candidates/:id"],
            "on_success": "Ranked list of matching candidates displayed",
        },
        {
            "name": "4.8  Candidate Profile",
            "route": "/candidate/profile",
            "guard": "ROLE_CANDIDATE required",
            "fields": ["Personal: Full Name, Phone, Date of Birth, Gender, Address",
                       "Academic: Degree, Institution, Year of Passing, Percentage",
                       "Experience: Total Years, Expected Salary Range",
                       "Skills: Skill Name + Proficiency (Beginner/Intermediate/Expert) — multiple entries",
                       "Location Preferences: list of preferred cities",
                       "Role Preferences: list of preferred job roles"],
            "actions": ["Load → GET /api/candidate/profile",
                        "Save → PUT /api/candidate/profile (partial update; skills/prefs fully replaced)"],
            "on_success": "Profile updated; confirmation message shown",
        },
        {
            "name": "4.9  Job List",
            "route": "/candidate/vacancies",
            "guard": "ROLE_CANDIDATE required",
            "fields": ["Filter inputs: Location, Salary Min, Salary Max, Employment Type, Qualification",
                       "Results: Designation, Organisation, Location, Salary, Employment Type, Deadline, Status"],
            "actions": ["Filter → GET /api/candidate/vacancies (query params)",
                        "Apply → POST /api/candidate/vacancies/:id/apply (with optional cover note)"],
            "on_success": "Application created (status: Applied); button disabled to prevent re-apply",
        },
        {
            "name": "4.10  My Applications",
            "route": "/candidate/applications",
            "guard": "ROLE_CANDIDATE required",
            "fields": ["Table: Vacancy Title, Organisation, Applied Date, Current Status, Cover Note"],
            "actions": ["Load → GET /api/candidate/applications",
                        "View details → expands to show interview schedule if any"],
            "on_success": "Status updates (Shortlisted, Interview Scheduled, Selected, Rejected) reflected in real time",
        },
        {
            "name": "4.11  Schedule Interview",
            "route": "/employer/interviews/new",
            "guard": "ROLE_EMPLOYER required",
            "fields": ["Application selector (candidate + vacancy)", "Interview Date & Time*",
                       "Mode* (In-Person / Online / Telephonic)", "Venue, Round Number, Interviewer Name, Remarks (optional)"],
            "actions": ["Submit → POST /api/employer/interviews",
                        "Application status auto-updates to 'Interview Scheduled'",
                        "Email notification sent to candidate"],
            "on_success": "Interview record created; shown in employer's interview list",
        },
        {
            "name": "4.12  Employer Reports",
            "route": "/employer/reports",
            "guard": "ROLE_EMPLOYER required",
            "fields": ["Date range filter for interviews", "Vacancy selector"],
            "actions": ["Vacancies Report → GET /api/employer/reports/vacancies",
                        "Interviews Report → GET /api/employer/reports/interviews"],
            "on_success": "Tables showing applicant counts, interview outcomes, selected/rejected counts per vacancy",
        },
        {
            "name": "4.13  Candidate Reports",
            "route": "/candidate/reports",
            "guard": "ROLE_CANDIDATE required",
            "fields": ["Application history with status timeline"],
            "actions": ["Load → GET /api/candidate/reports/applications"],
            "on_success": "Full application history with interview details per application",
        },
    ]

    for screen in SCREENS:
        heading(doc, screen["name"], 3)

        info_tbl = doc.add_table(rows=2, cols=2)
        info_tbl.style = "Table Grid"
        r0 = info_tbl.rows[0].cells
        r0[0].text = "Route"; r0[1].text = screen["route"]
        r1 = info_tbl.rows[1].cells
        r1[0].text = "Role Guard"; r1[1].text = screen["guard"]
        for row in info_tbl.rows:
            row.cells[0].paragraphs[0].runs[0].bold = True
            shade_cell(row.cells[0], "EBF3FB")
            for c in row.cells:
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
        r2 = p2.add_run("Actions & API Calls")
        r2.bold = True; r2.font.size = Pt(10); r2.font.color.rgb = NAVY
        for action in screen["actions"]:
            ap = doc.add_paragraph(style="List Bullet")
            ap.add_run(action).font.size = Pt(10)

        if "on_success" in screen:
            doc.add_paragraph()
            p3 = doc.add_paragraph()
            p3.add_run("On Success:  ").bold = True
            p3.add_run(screen["on_success"]).font.size = Pt(10)
            for run in p3.runs: run.font.size = Pt(10)

        doc.add_paragraph()

    # ── 5. PrivateRoute Guard ──────────────────────────────────────
    heading(doc, "5. PrivateRoute Guard Logic")
    p = doc.add_paragraph()
    p.add_run(
        "All protected pages are wrapped with a PrivateRoute component that checks both "
        "the presence of a valid token and the user's role. If either check fails, the user "
        "is redirected to the login page."
    ).font.size = Pt(11)
    doc.add_paragraph()

    PRIVATE_ROUTE = """\
function PrivateRoute({ children, role }) {
  const { auth } = useAuth()           // reads from AuthContext (backed by localStorage)
  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/login" replace />
  return children
}

// Usage in App.jsx:
// <Route path="/employer/vacancies" element={
//   <PrivateRoute role="EMPLOYER"><MyVacancies /></PrivateRoute>
// } />"""
    add_code_block(doc, PRIVATE_ROUTE)

    # ── 6. Authentication State Flow ──────────────────────────────
    heading(doc, "6. Authentication State Flow")
    STEPS = [
        "User submits login form → POST /api/auth/login returns { token, role, userId, name }",
        "AuthContext stores { token, role, userId, name } in React state and persists token to localStorage",
        "Axios interceptor (src/api/api.js) reads token from localStorage and adds Authorization: Bearer <token> to every outgoing request",
        "On app reload, AuthContext reads localStorage to restore auth state — user stays logged in across browser refreshes",
        "Logout: AuthContext.logout() clears localStorage and resets state → user is redirected to /login",
        "Vite dev proxy forwards /api/* requests from port 3000 to Spring Boot on port 8080 — no CORS issues during development",
    ]
    for i, step in enumerate(STEPS, 1):
        p = doc.add_paragraph(style="List Number")
        p.add_run(step).font.size = Pt(11)

    doc.save(OUT)
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    build()
