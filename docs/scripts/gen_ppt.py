"""
gen_ppt.py  —  generates Artifact6_Presentation.pptx
Run: python3 docs/scripts/gen_ppt.py
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches

NAVY  = RGBColor(0x1F, 0x38, 0x64)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY  = RGBColor(0x40, 0x40, 0x40)
BLUE  = RGBColor(0x2E, 0x75, 0xB6)
LGRAY = RGBColor(0xEB, 0xF3, 0xFB)

BASE  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT   = os.path.join(BASE, "Artifact6_Presentation.pptx")

SW = Inches(13.33)   # slide width  (widescreen 16:9)
SH = Inches(7.5)     # slide height


# ── helpers ────────────────────────────────────────────────────────────────
def blank_slide(prs):
    blank_layout = prs.slide_layouts[6]   # completely blank
    return prs.slides.add_slide(blank_layout)


def add_rect(slide, x, y, w, h, fill_rgb, line_rgb=None):
    shape = slide.shapes.add_shape(1, x, y, w, h)   # MSO_SHAPE_TYPE.RECTANGLE = 1
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_rgb
    if line_rgb:
        shape.line.color.rgb = line_rgb
    else:
        shape.line.fill.background()
    return shape


def add_textbox(slide, x, y, w, h, text, font_size=18, bold=False,
                color=GRAY, align=PP_ALIGN.LEFT, wrap=True):
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = wrap
    para  = tf.paragraphs[0]
    para.alignment = align
    run   = para.add_run()
    run.text           = text
    run.font.size      = Pt(font_size)
    run.font.bold      = bold
    run.font.color.rgb = color
    run.font.name      = "Calibri"
    return txBox


def slide_header(slide, title_text, subtitle=None):
    """Navy background bar at top with white title + optional subtitle."""
    # top bar
    bar = add_rect(slide, Inches(0), Inches(0), SW, Inches(1.35), NAVY)

    # title in bar
    add_textbox(slide, Inches(0.4), Inches(0.12), Inches(12.2), Inches(0.8),
                title_text, font_size=28, bold=True, color=WHITE,
                align=PP_ALIGN.LEFT)

    # thin accent line below bar
    add_rect(slide, Inches(0), Inches(1.35), SW, Pt(4), BLUE)

    if subtitle:
        add_textbox(slide, Inches(0.4), Inches(1.45), Inches(12.5), Inches(0.4),
                    subtitle, font_size=13, bold=False, color=BLUE, align=PP_ALIGN.LEFT)


def add_bullets(slide, items, x, y, w, h, size=17, color=GRAY, numbered=False):
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = True
    first = True
    for i, item in enumerate(items):
        if first:
            para = tf.paragraphs[0]
            first = False
        else:
            para = tf.add_paragraph()
        para.space_before = Pt(4)
        run = para.add_run()
        prefix = f"{i+1}.  " if numbered else "•  "
        run.text           = prefix + item
        run.font.size      = Pt(size)
        run.font.color.rgb = color
        run.font.name      = "Calibri"
    return txBox


def add_table(slide, headers, rows, x, y, w, h, hdr_bg=NAVY, hdr_fg=WHITE,
              even_bg=RGBColor(0xEB,0xF3,0xFB), odd_bg=WHITE, font_size=13):
    from pptx.oxml.ns import qn
    from lxml import etree

    ncols = len(headers)
    nrows = len(rows) + 1
    tbl_shape = slide.shapes.add_table(nrows, ncols, x, y, w, h)
    tbl       = tbl_shape.table

    # column widths — distribute evenly
    col_w = w // ncols
    for i in range(ncols):
        tbl.columns[i].width = col_w

    # header row
    for j, hdr in enumerate(headers):
        cell = tbl.cell(0, j)
        cell.text = hdr
        para = cell.text_frame.paragraphs[0]
        run  = para.runs[0] if para.runs else para.add_run()
        run.text           = hdr
        run.font.bold      = True
        run.font.size      = Pt(font_size)
        run.font.color.rgb = hdr_fg
        run.font.name      = "Calibri"
        cell.fill.solid()
        cell.fill.fore_color.rgb = hdr_bg

    # data rows
    for i, row in enumerate(rows):
        bg = even_bg if i % 2 == 0 else odd_bg
        for j, val in enumerate(row):
            cell = tbl.cell(i + 1, j)
            cell.text = str(val)
            para = cell.text_frame.paragraphs[0]
            run  = para.runs[0] if para.runs else para.add_run()
            run.text           = str(val)
            run.font.size      = Pt(font_size)
            run.font.color.rgb = GRAY
            run.font.name      = "Calibri"
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg

    return tbl_shape


# ── slides ─────────────────────────────────────────────────────────────────
def slide_title(prs):
    s = blank_slide(prs)
    add_rect(s, Inches(0), Inches(0), SW, SH, NAVY)

    add_textbox(s, Inches(1), Inches(1.4), Inches(11), Inches(1.2),
                "Online Recruitment Processing System",
                font_size=36, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    add_rect(s, Inches(2.5), Inches(2.8), Inches(8.3), Pt(3), BLUE)

    for txt, y, sz in [
        ("Full Stack Application Development (FSAD)", Inches(3.0), 18),
        ("BITS Pilani — Work Integrated Learning Programmes (WILP)", Inches(3.55), 16),
        ("Nimisha Gupta (2025SL70050)  &  Fasi Ahmed Khan J R (2025SL70017)  |  M.Tech  |  November 2026",    Inches(4.1),  15),
    ]:
        add_textbox(s, Inches(0.5), y, Inches(12.3), Inches(0.55),
                    txt, font_size=sz, color=LGRAY, align=PP_ALIGN.CENTER)


def slide_problem(prs):
    s = blank_slide(prs)
    slide_header(s, "Problem Statement")
    bullets = [
        "Manual, paper-based recruitment processes are slow and prone to errors",
        "HR teams lack a centralised platform to manage vacancies and track candidates",
        "Candidates have no real-time visibility into their application status",
        "Interview scheduling requires manual coordination with no audit trail",
        "No automated notifications — candidates are left waiting for manual follow-ups",
        "Solution: A fully digital, role-based online recruitment platform",
    ]
    add_bullets(s, bullets, Inches(0.5), Inches(1.65), Inches(12.3), Inches(5.5), size=18)


def slide_objectives(prs):
    s = blank_slide(prs)
    slide_header(s, "Project Objectives")
    bullets = [
        "Automate the complete end-to-end HR recruitment lifecycle",
        "Provide distinct, role-secured portals for Employers and Candidates",
        "Enable merit-based and preference-based intelligent candidate filtering",
        "Automate interview scheduling with integrated email notifications",
        "Maintain a complete, tamper-proof audit trail of all recruitment activities",
        "Deliver a scalable, stateless, secure REST API backend",
        "Provide a modern, responsive React SPA frontend",
    ]
    add_bullets(s, bullets, Inches(0.5), Inches(1.65), Inches(12.3), Inches(5.5), size=18)


def slide_architecture(prs):
    s = blank_slide(prs)
    slide_header(s, "System Architecture — Three-Tier")

    ARCH = (
        "PRESENTATION TIER  —  React 18 SPA (Port 3000)\n"
        "   React Router v6  |  Axios (Bearer token interceptor)  |  Tailwind CSS\n"
        "   Pages: Login · Register · Employer Dashboard · Candidate Profile · Job Search · Reports\n"
        "\n"
        "                        ↕  HTTP / REST (JSON)  |  Authorization: Bearer <JWT>\n"
        "\n"
        "APPLICATION TIER  —  Spring Boot 3.3.4 REST API (Port 8080)\n"
        "   AuthController (/api/auth/**)  |  VacancyController (/api/employer/**)\n"
        "   CandidateController (/api/candidate/**)\n"
        "   Spring Security 6 (STATELESS)  |  JwtAuthFilter (jjwt 0.12.6)\n"
        "   Spring Data JPA + Hibernate 6  |  GlobalExceptionHandler (400 / 403 / 500)\n"
        "\n"
        "                        ↕  JDBC / HikariCP\n"
        "\n"
        "DATA TIER  —  MySQL 8.0 (Port 3306)\n"
        "   employers · candidates · candidate_skills · candidate_location_prefs\n"
        "   candidate_role_prefs · vacancies · applications · interviews · notifications\n"
        "\n"
        "                        ↕  SMTP / TLS (Port 587)\n"
        "\n"
        "EXTERNAL SERVICE  —  Spring Mail → Gmail SMTP"
    )

    txBox = s.shapes.add_textbox(Inches(0.4), Inches(1.5), Inches(12.5), Inches(5.7))
    tf    = txBox.text_frame; tf.word_wrap = True
    para  = tf.paragraphs[0]; run = para.add_run()
    run.text = ARCH; run.font.size = Pt(13.5); run.font.name = "Courier New"
    run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)


def slide_modules(prs):
    s = blank_slide(prs)
    slide_header(s, "System Modules")

    MODS = [
        ("Module 1", "Registration & Login", "JWT auth, BCrypt, ROLE_EMPLOYER / ROLE_CANDIDATE"),
        ("Module 2", "Vacancy Management",   "Full CRUD + close; owner-only access enforced"),
        ("Module 3", "Candidate Search",     "Filter by skill, location, salary, qualification, merit"),
        ("Module 4", "Candidate Profile",    "Profile + skills + location & role preferences"),
        ("Module 5", "Job Search & Apply",   "Browse open vacancies, apply; duplicate prevention"),
        ("Module 6", "Interview Scheduling", "Schedule & record outcomes; status auto-update"),
        ("Module 7", "Reports",              "Employer: vacancy/interview reports; Candidate: history"),
        ("Module 8", "Email Notifications",  "Spring Mail — on registration, interview, status change"),
    ]
    add_table(s, ["Module", "Name", "Description"],
              MODS, Inches(0.3), Inches(1.6), Inches(12.7), Inches(5.5),
              font_size=13)


def slide_techstack(prs):
    s = blank_slide(prs)
    slide_header(s, "Technology Stack")

    TECH = [
        ("Frontend",        "React 18,  Vite,  React Router v6",  "React 18  /  Router v6"),
        ("Styling",         "Tailwind CSS",                         "v3.x"),
        ("HTTP Client",     "Axios (Bearer interceptor)",           "Latest"),
        ("Backend",         "Spring Boot  +  Spring Security",      "3.3.4  /  Security 6"),
        ("Authentication",  "jjwt — JWT HMAC-SHA256",               "0.12.6"),
        ("ORM",             "Spring Data JPA  +  Hibernate",        "Hibernate 6"),
        ("Database",        "MySQL",                                 "8.0"),
        ("Build",           "Maven",                                 "3.9+"),
        ("Runtime",         "Java (SapMachine LTS)",                "21"),
    ]
    add_table(s, ["Tier / Area", "Technology", "Version"],
              TECH, Inches(0.3), Inches(1.6), Inches(12.7), Inches(5.5),
              font_size=13)


def slide_database(prs):
    s = blank_slide(prs)
    slide_header(s, "Database Design — 9 Tables")

    left = (
        "Core Tables:\n"
        "  employers          — Organisation & HR contact details\n"
        "  candidates         — Profile, academics, experience\n"
        "  vacancies          — Job postings with requirements\n"
        "  applications       — Candidate applications per vacancy\n"
        "  interviews         — Schedule, mode, outcomes\n\n"
        "Supporting Tables:\n"
        "  candidate_skills          — Skills + proficiency level\n"
        "  candidate_location_prefs  — Preferred cities\n"
        "  candidate_role_prefs      — Preferred job roles\n"
        "  notifications             — Email audit log (no FK)\n\n"
        "Key Constraint:\n"
        "  UNIQUE (vacancy_id, candidate_id)\n"
        "  → prevents duplicate applications at DB level\n\n"
        "All FKs use ON DELETE CASCADE.\n"
        "Schema managed via docs/db-schema.sql (re-runnable)."
    )
    txBox = s.shapes.add_textbox(Inches(0.4), Inches(1.55), Inches(12.5), Inches(5.6))
    tf = txBox.text_frame; tf.word_wrap = True
    para = tf.paragraphs[0]; run = para.add_run()
    run.text = left; run.font.size = Pt(15); run.font.name = "Calibri"
    run.font.color.rgb = GRAY


def slide_security(prs):
    s = blank_slide(prs)
    slide_header(s, "Security Design")

    bullets = [
        "JWT-based stateless authentication (HMAC-SHA256, 24-hour expiry) via jjwt 0.12.6",
        "BCrypt password hashing (cost 10) — plaintext never stored or returned in any response",
        "Role-Based Access Control (RBAC):\n"
        "      ROLE_EMPLOYER  →  /api/employer/**\n"
        "      ROLE_CANDIDATE →  /api/candidate/**\n"
        "      Public         →  /api/auth/**",
        "Per-resource ownership enforcement in VacancyService — SecurityException → HTTP 403",
        "CORS restricted to localhost:3000 (configurable via app.cors.allowed-origins)",
        "Session policy: STATELESS — no server-side sessions; token validated on every request",
    ]

    txBox = s.shapes.add_textbox(Inches(0.5), Inches(1.65), Inches(12.3), Inches(5.5))
    tf = txBox.text_frame; tf.word_wrap = True
    first = True
    for item in bullets:
        if first:
            para = tf.paragraphs[0]; first = False
        else:
            para = tf.add_paragraph()
        para.space_before = Pt(6)
        run = para.add_run()
        run.text           = "•  " + item
        run.font.size      = Pt(16)
        run.font.color.rgb = GRAY
        run.font.name      = "Calibri"


def slide_status(prs):
    s = blank_slide(prs)
    slide_header(s, "Implementation Status & Roadmap")

    STATUS = [
        ("Module 1 — Registration & Login",       "Fasi Ahmed Khan J R (2025SL70017)",   "✅ Complete"),
        ("Module 2 — Vacancy Management",          "Nimisha Gupta (2025SL70050)", "✅ Complete"),
        ("Module 4 — Candidate Profile & Prefs",  "Nimisha Gupta (2025SL70050)", "✅ Complete"),
        ("Frontend — React SPA",                   "Nimisha Gupta (2025SL70050)", "🔄 In Development"),
        ("Module 3 — Candidate Search",            "Fasi Ahmed Khan J R (2025SL70017)",   "📋 Planned"),
        ("Module 5 — Job Search & Apply",          "Fasi Ahmed Khan J R (2025SL70017)",   "📋 Planned"),
        ("Module 6 — Interview Scheduling",        "Nimisha Gupta (2025SL70050)", "📋 Planned"),
        ("Module 7 — Reports",                     "Nimisha Gupta (2025SL70050)", "📋 Planned"),
        ("Module 8 — Email Notifications",         "Nimisha Gupta (2025SL70050)", "📋 Planned"),
    ]
    add_table(s, ["Component", "Owner", "Status"],
              STATUS, Inches(0.3), Inches(1.6), Inches(12.7), Inches(5.55),
              font_size=13)


# ── main ───────────────────────────────────────────────────────────────────
def build():
    prs = Presentation()
    prs.slide_width  = SW
    prs.slide_height = SH

    slide_title(prs)
    slide_problem(prs)
    slide_objectives(prs)
    slide_architecture(prs)
    slide_modules(prs)
    slide_techstack(prs)
    slide_database(prs)
    slide_security(prs)
    slide_status(prs)

    prs.save(OUT)
    print(f"Saved: {OUT}  ({len(prs.slides)} slides)")


if __name__ == "__main__":
    build()
