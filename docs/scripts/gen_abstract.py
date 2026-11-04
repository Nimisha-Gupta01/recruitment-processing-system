"""
gen_abstract.py  —  generates Artifact5_Abstract.docx
Run: python3 docs/scripts/gen_abstract.py
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
OUT   = os.path.join(BASE, "Artifact5_Abstract.docx")


# ── helpers ────────────────────────────────────────────────────────────────
def shade_cell(cell, hex_color):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  hex_color)
    tcPr.append(shd)


def set_col_width(col, inches):
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    from docx.shared import Inches as I
    for cell in col.cells:
        tc   = cell._tc
        tcPr = tc.get_or_add_tcPr()
        tcW  = OxmlElement('w:tcW')
        tcW.set(qn('w:w'),    str(int(I(inches).pt * 20 / 0.75)))
        tcW.set(qn('w:type'), 'dxa')
        tcPr.insert(0, tcW)


def add_page_number(doc):
    footer = doc.sections[0].footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run()
    for tag, text in [('w:fldChar', None), ('w:instrText', 'PAGE'), ('w:fldChar', None)]:
        el = OxmlElement(tag)
        if text:
            el.text = text
        else:
            el.set(qn('w:fldCharType'), 'begin' if not run._r.find(qn('w:instrText')) is None else 'end')
        run._r.append(el)
    # simpler approach
    p.clear()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run("Page ")
    fB = OxmlElement('w:fldChar'); fB.set(qn('w:fldCharType'),'begin')
    iT = OxmlElement('w:instrText'); iT.text = 'PAGE'
    fE = OxmlElement('w:fldChar'); fE.set(qn('w:fldCharType'),'end')
    run._r.append(fB); run._r.append(iT); run._r.append(fE)


def heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.color.rgb = NAVY
    return p


def build():
    doc = Document()

    for sec in doc.sections:
        sec.top_margin    = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin   = Inches(1.25)
        sec.right_margin  = Inches(1.25)

    add_page_number(doc)

    # ── title block ────────────────────────────────────────────────
    for text, size, bold, color in [
        ("BITS Pilani — Work Integrated Learning Programmes (WILP)", 13, True,  NAVY),
        ("Full Stack Application Development (FSAD)",                11, False, GRAY),
        ("",                                                          11, False, GRAY),
        ("Online Recruitment Processing System",                      16, True,  NAVY),
        ("Project Abstract",                                          13, True,  NAVY),
        ("",                                                          11, False, GRAY),
        ("Team: Nimisha Gupta & Fassi   |   M.Tech — BITS Pilani",   11, False, GRAY),
        ("November 2026",                                             11, False, GRAY),
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if text:
            run = p.add_run(text)
            run.font.size  = Pt(size)
            run.font.bold  = bold
            run.font.color.rgb = color

    # divider
    div = doc.add_paragraph()
    div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = div.add_run("━" * 72)
    r.font.color.rgb = BLUE
    r.font.size = Pt(10)

    doc.add_paragraph()

    # ── abstract body ──────────────────────────────────────────────
    heading(doc, "Abstract", 1)

    BODY = (
        "The Online Recruitment Processing System is a web-based application designed to fully "
        "automate the end-to-end recruitment lifecycle within an HR division. The system bridges "
        "the gap between employers seeking qualified candidates and job seekers looking for suitable "
        "opportunities — eliminating manual, paper-based processes and reducing time-to-hire.\n\n"
        "The platform provides two distinct roles: Employers and Candidates. Employers can register "
        "their organisations, post job vacancies with detailed requirements (designation, salary, "
        "qualification, employment type), and search the candidate pool using filters such as "
        "qualification, location preference, salary expectation, and merit. Candidates can register, "
        "build their profiles, specify job and location preferences, browse available vacancies, "
        "apply for positions, and track their application status in real time.\n\n"
        "The system automates interview scheduling — once an employer identifies a matching "
        "candidate, a meeting is scheduled and both parties are notified. Post-interview, the "
        "employer updates the outcome (Selected / Offered / Recruited / Rejected), which is "
        "reflected in the candidate's dashboard and triggers an automated email notification. "
        "Comprehensive reports are available to both employers (recruitment summaries, interview "
        "records) and candidates (application history, status reports).\n\n"
        "Built on a modern three-tier architecture using Spring Boot (REST API backend), ReactJS "
        "(frontend), and MySQL (relational database) with Spring Data JPA / Hibernate for ORM, "
        "the system is designed for scalability, role-based security, and ease of use."
    )
    for para_text in BODY.split("\n\n"):
        p = doc.add_paragraph()
        run = p.add_run(para_text.strip())
        run.font.size = Pt(11)

    doc.add_paragraph()

    # ── key modules ────────────────────────────────────────────────
    heading(doc, "Key Modules", 2)

    MODULES = [
        "Registration & Login Module  (Role-based: Employer / Candidate)",
        "Vacancy Management Module",
        "Candidate Search & Scan Module",
        "Candidate Job Registration & Preferences Module",
        "Job Search & Apply Module",
        "Interview Scheduling & Details Module",
        "Reports Module",
        "Email Notification Module",
    ]
    for i, m in enumerate(MODULES, 1):
        p = doc.add_paragraph(style="List Number")
        run = p.add_run(m)
        run.font.size = Pt(11)

    doc.add_paragraph()

    # ── special features ───────────────────────────────────────────
    heading(doc, "Special Features", 2)

    FEATURES = [
        "Merit-based and preference-based intelligent candidate filtering",
        "Real-time application status tracking for candidates",
        "Automated email notifications on interview scheduling and status changes",
        "Role-based access control (Employer vs Candidate) enforced via JWT",
        "Interview scheduling with full outcome tracking and audit trail",
    ]
    for f in FEATURES:
        p = doc.add_paragraph(style="List Bullet")
        run = p.add_run(f)
        run.font.size = Pt(11)

    doc.add_paragraph()

    # ── technologies ───────────────────────────────────────────────
    heading(doc, "Technologies", 2)

    TECH = [
        ("Backend",         "Spring Boot 3.3.4, Spring Security 6, Spring Data JPA / Hibernate 6"),
        ("Authentication",  "JWT (jjwt 0.12.6), HMAC-SHA256, BCrypt password hashing"),
        ("Frontend",        "React 18, Vite, React Router v6, Tailwind CSS, Axios"),
        ("Database",        "MySQL 8.0 — 9 tables, InnoDB, HikariCP connection pool"),
        ("Build / Runtime", "Maven 3.9+, Java 21 (SapMachine LTS)"),
        ("Email",           "Spring Mail (JavaMail) via SMTP"),
    ]
    tbl = doc.add_table(rows=1, cols=2)
    tbl.style = "Table Grid"
    h0 = tbl.rows[0].cells
    for i, txt in enumerate(["Component", "Technology / Version"]):
        run = h0[i].paragraphs[0].add_run(txt)
        run.bold = True; run.font.size = Pt(10)
        shade_cell(h0[i], "BDD7EE")
    for comp, tech in TECH:
        row = tbl.add_row().cells
        row[0].text = comp;  row[0].paragraphs[0].runs[0].font.size = Pt(10)
        row[1].text = tech;  row[1].paragraphs[0].runs[0].font.size = Pt(10)

    doc.add_paragraph()
    doc.add_paragraph()

    # ── footer line ────────────────────────────────────────────────
    fp = doc.add_paragraph()
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = fp.add_run("Submitted for FSAD Assignment — Preliminary Presentation  |  BITS Pilani WILP")
    run.font.italic = True
    run.font.size   = Pt(10)
    run.font.color.rgb = RGBColor(0x60, 0x60, 0x60)

    doc.save(OUT)
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    build()
