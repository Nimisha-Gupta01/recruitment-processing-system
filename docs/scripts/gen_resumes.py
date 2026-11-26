"""
gen_resumes.py — generate realistic one-page PDF resumes for all demo candidates.
Uses absolute Tm positioning so every line renders correctly in all PDF viewers.
Run from project root: python3 docs/scripts/gen_resumes.py
"""

import os
import textwrap

UPLOAD_DIR = "backend/uploads"

# ─── PDF builder using absolute Tm positioning ───────────────────────────────

def escape(s):
    return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

def build_pdf(lines):
    """
    lines: list of (x, y, font_size, is_bold, text)
    x, y are absolute PDF coordinates (0,0 = bottom-left; A4 = 595×842 pt)
    Returns bytes of a valid PDF 1.4 file.
    """
    parts = []
    for (x, y, size, bold, text) in lines:
        font = "F2" if bold else "F1"
        parts.append(f"BT /{font} {size} Tf {x} {y} Td ({escape(text)}) Tj ET\n")

    # Horizontal rule under contact line (y≈775)
    parts.append("q 0.6 G 2 w 50 773 m 545 773 l S Q\n")

    content = "".join(parts).encode("latin-1", errors="replace")

    objs = []

    # 1: catalog
    objs.append(b"1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n")
    # 2: pages
    objs.append(b"2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n")
    # 3: page
    objs.append(
        b"3 0 obj\n<</Type/Page/Parent 2 0 R"
        b"/MediaBox[0 0 595 842]"
        b"/Contents 4 0 R"
        b"/Resources<</Font<</F1 5 0 R/F2 6 0 R>>"
        b"/ProcSet[/PDF/Text]>>>>\nendobj\n"
    )
    # 4: content stream
    obj4 = (f"4 0 obj\n<</Length {len(content)}>>\nstream\n"
            .encode() + content + b"\nendstream\nendobj\n")
    objs.append(obj4)
    # 5: regular font
    objs.append(
        b"5 0 obj\n<</Type/Font/Subtype/Type1"
        b"/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>\nendobj\n"
    )
    # 6: bold font
    objs.append(
        b"6 0 obj\n<</Type/Font/Subtype/Type1"
        b"/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>\nendobj\n"
    )

    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    body = b""
    offsets = []
    pos = len(header)
    for obj in objs:
        offsets.append(pos)
        body += obj
        pos += len(obj)

    xref_pos = len(header) + len(body)
    n = len(objs) + 1
    xref = f"xref\n0 {n}\n0000000000 65535 f \n".encode()
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode()
    trailer = (f"trailer\n<</Size {n}/Root 1 0 R>>\n"
               f"startxref\n{xref_pos}\n%%EOF\n").encode()

    return header + body + xref + trailer


# ─── Resume layout → (x, y, size, bold, text) list ──────────────────────────

def layout(data):
    result = []
    y = 810

    def row(text, x=50, size=10, bold=False, dy=14):
        nonlocal y
        result.append((x, y, size, bold, text))
        y -= dy

    def gap(n=5):
        nonlocal y
        y -= n

    def wrap_rows(text, width=90, x=50, size=9, dy=12):
        for line in textwrap.wrap(text, width):
            row(line, x=x, size=size, bold=False, dy=dy)

    # Header
    row(data["name"], size=18, bold=True, dy=22)
    row(data["contact"], size=9, dy=10)
    gap(8)  # space below the rule drawn at y=773

    # Objective
    row("OBJECTIVE", size=10, bold=True, dy=14)
    wrap_rows(data["objective"], width=92, dy=12)
    gap(5)

    # Education
    row("EDUCATION", size=10, bold=True, dy=14)
    for edu in data["education"]:
        row(f"{edu['degree']}  |  {edu['institution']}  |  {edu['year']}",
            x=50, size=9, bold=True, dy=12)
        row(f"Percentage / CGPA: {edu['score']}", x=55, size=9, dy=14)
    gap(4)

    # Experience
    if data.get("experience"):
        row("EXPERIENCE", size=10, bold=True, dy=14)
        for exp in data["experience"]:
            row(f"{exp['title']}  —  {exp['company']}  ({exp['period']})",
                size=9, bold=True, dy=13)
            for bullet in exp["bullets"]:
                wrap_rows(f"• {bullet}", width=88, x=55, dy=12)
        gap(4)

    # Skills
    row("SKILLS", size=10, bold=True, dy=14)
    wrap_rows("  |  ".join(data["skills"]), width=92, dy=12)
    gap(4)

    # Certifications
    if data.get("certs"):
        row("CERTIFICATIONS & ACHIEVEMENTS", size=10, bold=True, dy=14)
        for cert in data["certs"]:
            row(f"• {cert}", x=55, size=9, dy=12)
        gap(4)

    # Personal
    row("PERSONAL DETAILS", size=10, bold=True, dy=14)
    for item in data["personal"]:
        row(item, x=55, size=9, dy=12)

    return result


# ─── Candidate data ───────────────────────────────────────────────────────────

RESUMES = {
    "Priya_Sharma": {
        "name": "Priya Sharma",
        "contact": "priya@demo.com  |  +91-9100000001  |  Bangalore, Karnataka",
        "objective": (
            "Results-driven Java Backend Developer with 3.5 years of experience building scalable "
            "microservices and REST APIs using Spring Boot 3, Kafka, and AWS ECS. Seeking a senior "
            "backend engineering role to architect distributed systems and mentor junior engineers."
        ),
        "education": [
            {"degree": "B.Tech - Computer Science Engineering",
             "institution": "VIT Vellore", "year": "2020", "score": "82.5% (8.25 CGPA)"},
        ],
        "experience": [{
            "title": "Software Engineer - Backend",
            "company": "Zeta Tech Pvt Ltd, Bangalore",
            "period": "Jul 2020 - Present",
            "bullets": [
                "Designed and deployed 12 Spring Boot microservices handling 20K RPM on AWS ECS.",
                "Led migration of monolithic billing system to event-driven architecture using Apache Kafka.",
                "Reduced average API response time from 320ms to 85ms by optimising JPA queries and Redis caching.",
                "Mentored a team of 4 junior engineers and introduced weekly code review sessions.",
                "Implemented JWT-based authentication with Spring Security across all services.",
            ],
        }],
        "skills": ["Java 17", "Spring Boot 3", "Kafka", "MySQL", "Redis", "Docker", "AWS ECS", "JPA/Hibernate", "JUnit 5", "REST APIs"],
        "certs": [
            "AWS Certified Developer - Associate (DVA-C02), 2023",
            "Oracle Certified Professional: Java SE 11 Developer, 2021",
        ],
        "personal": [
            "Date of Birth: 10 May 1998  |  Gender: Female",
            "Languages: English, Hindi, Tamil",
            "LinkedIn: linkedin.com/in/priya-sharma-dev",
        ],
    },

    "Amit_Kulkarni": {
        "name": "Amit Kulkarni",
        "contact": "amit@demo.com  |  +91-9100000006  |  Bangalore, Karnataka",
        "objective": (
            "Senior Java engineer with 5 years architecting high-throughput financial platforms. "
            "Expert in microservices, Kafka, AWS, and system design at scale. Looking for an "
            "engineering leadership role at a product-focused company."
        ),
        "education": [
            {"degree": "M.Tech - Computer Science", "institution": "IIT Bombay",
             "year": "2020", "score": "9.1 CGPA (Distinction)"},
            {"degree": "B.Tech - Information Technology", "institution": "VJTI Mumbai",
             "year": "2018", "score": "85.4%"},
        ],
        "experience": [{
            "title": "Senior Software Engineer",
            "company": "PayEdge Fintech, Bangalore",
            "period": "Aug 2020 - Present",
            "bullets": [
                "Architected real-time payment processing handling 50,000 TPS peak using Java 17 and Kafka.",
                "Designed microservices mesh (22 services) with gRPC communication and Istio service mesh.",
                "Drove 40% infrastructure cost reduction by migrating EC2 to ECS Fargate with autoscaling.",
                "Established code quality standards; raised unit test coverage from 48% to 87%.",
                "Presented technical roadmaps to CTO and board on a quarterly basis.",
            ],
        }],
        "skills": ["Java 17", "Spring Boot", "Kafka", "gRPC", "AWS", "Kubernetes", "Microservices", "System Design", "Redis", "MySQL"],
        "certs": [
            "AWS Certified Solutions Architect - Associate, 2022",
            "Confluent Certified Developer for Apache Kafka (CCDAK), 2023",
            "Best Engineer Award - PayEdge Hackathon 2022 (1st place out of 60 teams)",
        ],
        "personal": [
            "Date of Birth: 30 Jan 1996  |  Gender: Male",
            "Languages: English, Hindi, Marathi",
        ],
    },

    "Rahul_Mehta": {
        "name": "Rahul Mehta",
        "contact": "rahul@demo.com  |  +91-9100000002  |  Pune, Maharashtra",
        "objective": (
            "Python backend developer with 2.5 years in Django REST and data pipelines, now actively "
            "transitioning to Java Spring Boot. Completed two Spring Boot projects on GitHub. "
            "Seeking a backend role to apply Python expertise while growing Java skills."
        ),
        "education": [
            {"degree": "MCA - Master of Computer Applications", "institution": "BITS Pilani",
             "year": "2021", "score": "78.0% (7.8 CGPA)"},
        ],
        "experience": [{
            "title": "Backend Developer",
            "company": "LogiNext Solutions, Pune",
            "period": "Sep 2021 - Present",
            "bullets": [
                "Built 8 Django REST APIs for a last-mile logistics optimisation platform (200K daily users).",
                "Developed ETL pipeline using Apache Airflow and Pandas processing 5M records/day from IoT devices.",
                "Containerised all services with Docker; deployed on AWS ECS with CI/CD via GitHub Actions.",
                "Currently self-learning Java Spring Boot; built a full recruitment portal as a personal project.",
            ],
        }],
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Docker", "Apache Airflow", "Pandas", "Java (learning)", "Spring Boot (learning)"],
        "certs": [
            "AWS Certified Cloud Practitioner, 2022",
            "Coursera: Spring Boot 3 & Microservices (in progress)",
        ],
        "personal": [
            "Date of Birth: 20 Aug 1997  |  Gender: Male",
            "Languages: English, Hindi, Gujarati",
        ],
    },

    "Vikram_Singh": {
        "name": "Vikram Singh",
        "contact": "vikram@demo.com  |  +91-9100000004  |  Bangalore, Karnataka",
        "objective": (
            "Cloud and DevOps Engineer with 5 years owning AWS infrastructure, Kubernetes clusters, "
            "and CI/CD pipelines for large SaaS products. Seeking a cloud engineering role to drive "
            "reliability and infrastructure automation at scale."
        ),
        "education": [
            {"degree": "B.Tech - Information Technology", "institution": "NIT Warangal",
             "year": "2018", "score": "76.4% (7.6 CGPA)"},
        ],
        "experience": [{
            "title": "DevOps / Cloud Engineer",
            "company": "ClearTax Technologies, Bangalore",
            "period": "Jun 2018 - Present",
            "bullets": [
                "Managed 200+ microservice deployments on AWS EKS with Helm charts and ArgoCD GitOps.",
                "Wrote Terraform modules managing 300+ AWS resources across dev/staging/prod environments.",
                "Built GitHub Actions CI/CD pipelines; reduced deployment time from 45 min to 8 min.",
                "Implemented Prometheus and Grafana observability stack with 150+ custom dashboards.",
                "Led cost optimisation programme saving $180K/year by right-sizing EC2 and adopting Spot instances.",
            ],
        }],
        "skills": ["AWS (Expert)", "Kubernetes (EKS)", "Terraform", "Docker", "Helm", "ArgoCD", "GitHub Actions", "Prometheus", "Grafana", "Python"],
        "certs": [
            "AWS Certified Solutions Architect - Professional (SAP-C02), 2023",
            "Certified Kubernetes Administrator (CKA), 2022",
            "HashiCorp Certified: Terraform Associate, 2022",
        ],
        "personal": [
            "Date of Birth: 02 Nov 1995  |  Gender: Male",
            "Languages: English, Hindi",
        ],
    },

    "Arun_Nambiar": {
        "name": "Arun Nambiar",
        "contact": "arun@demo.com  |  +91-9100000010  |  Bangalore, Karnataka",
        "objective": (
            "Senior Java Full Stack Engineer with 7.5 years delivering enterprise-grade applications "
            "for banking, insurance, and telecom clients. Expert in Java 17, Spring Boot, and Oracle DB. "
            "Seeking a senior/lead backend engineering role at a product company."
        ),
        "education": [
            {"degree": "B.Tech - Computer Science Engineering", "institution": "Kerala University",
             "year": "2016", "score": "81.3%"},
        ],
        "experience": [{
            "title": "Senior Software Engineer / Tech Lead",
            "company": "Mphasis Ltd, Bangalore",
            "period": "Jul 2016 - Present",
            "bullets": [
                "Led team of 8 engineers delivering a core banking API layer for a top-5 Indian bank (12M users).",
                "Architected Oracle DB schema and PL/SQL stored procedures for real-time transaction ledger.",
                "Drove migration of 40 legacy EJB services to Spring Boot microservices with zero downtime.",
                "Conducted 200+ technical interviews; established engineering hiring bar for Bangalore centre.",
            ],
        }],
        "skills": ["Java 11/17", "Spring Boot", "Oracle DB", "PL/SQL", "Microservices", "Docker", "REST APIs", "JUnit", "Angular 15", "Leadership"],
        "certs": [
            "Oracle Certified Master: Java EE 7 Enterprise Architect, 2019",
            "AWS Certified Solutions Architect - Associate, 2021",
        ],
        "personal": [
            "Date of Birth: 25 Jun 1993  |  Gender: Male",
            "Languages: English, Malayalam, Hindi",
        ],
    },

    "Anita_Rao": {
        "name": "Anita Rao",
        "contact": "anita@demo.com  |  +91-9100000003  |  Hyderabad, Telangana",
        "objective": (
            "Frontend Developer with 1.5 years building React-based UIs and component libraries. "
            "Strong in JavaScript, HTML/CSS, and responsive design. Looking for a frontend role "
            "at a product company where I can grow into a senior frontend engineer."
        ),
        "education": [
            {"degree": "B.Sc - Computer Science", "institution": "Osmania University",
             "year": "2022", "score": "85.2%"},
        ],
        "experience": [{
            "title": "Junior Frontend Developer",
            "company": "Hexaware Technologies, Hyderabad",
            "period": "Aug 2022 - Present",
            "bullets": [
                "Built 15+ reusable React components for an insurance claims management portal.",
                "Integrated REST APIs using Axios with JWT authentication and role-based route guards.",
                "Improved Lighthouse performance score from 62 to 89 via lazy loading and code splitting.",
                "Participated in daily standups, sprint reviews, and pair programming sessions.",
            ],
        }],
        "skills": ["React 18", "JavaScript (ES2020)", "HTML5", "CSS3", "Bootstrap 5", "Axios", "Git", "TypeScript (learning)", "Figma"],
        "certs": ["Meta Frontend Developer Certificate (Coursera), 2023"],
        "personal": [
            "Date of Birth: 15 Mar 1999  |  Gender: Female",
            "Languages: English, Telugu, Hindi",
        ],
    },

    "Sneha_Joshi": {
        "name": "Sneha Joshi",
        "contact": "sneha@demo.com  |  +91-9100000007  |  Pune, Maharashtra",
        "objective": (
            "Full Stack Developer with 2 years specialising in React and Node.js, with direct experience "
            "building recruitment and HR platforms. Seeking a frontend or full-stack role at a product company."
        ),
        "education": [
            {"degree": "B.Tech - Computer Science Engineering",
             "institution": "Pune University (SPPU)", "year": "2021", "score": "80.1%"},
        ],
        "experience": [{
            "title": "Full Stack Developer",
            "company": "HireSmart Technologies, Pune",
            "period": "Jul 2021 - Present",
            "bullets": [
                "Built a React 18 + Node.js recruitment portal used by 300+ SMEs for job posting and candidate tracking.",
                "Designed REST APIs in Express.js with MongoDB; handled 50K monthly users.",
                "Integrated AI-powered resume parsing using OpenAI API — reduced screening time by 60%.",
                "Led frontend migration from class components to hooks; improved bundle size by 35%.",
                "Wrote Jest and React Testing Library tests covering 80% of frontend components.",
            ],
        }],
        "skills": ["React 18", "Node.js", "JavaScript", "TypeScript", "MongoDB", "Express.js", "REST APIs", "Jest", "Git", "Figma"],
        "certs": [
            "Meta React Developer Certificate (Coursera), 2022",
            "MongoDB Certified Developer Associate, 2023",
        ],
        "personal": [
            "Date of Birth: 14 Sep 1998  |  Gender: Female",
            "Languages: English, Hindi, Marathi",
        ],
    },

    "Deepa_Krishnan": {
        "name": "Deepa Krishnan",
        "contact": "deepa@demo.com  |  +91-9100000005  |  Chennai, Tamil Nadu",
        "objective": (
            "2023 ECE graduate with Python, Pandas, SQL, and Power BI skills from academic projects "
            "and a data analytics internship. Eager to build a career in data analytics and BI."
        ),
        "education": [
            {"degree": "B.E - Electronics and Communication Engineering",
             "institution": "Anna University", "year": "2023", "score": "79.0%"},
        ],
        "experience": [{
            "title": "Data Analytics Intern",
            "company": "Zoho Corporation, Chennai",
            "period": "May 2023 - Jun 2023",
            "bullets": [
                "Built Power BI dashboards tracking CRM pipeline metrics for the inside sales team.",
                "Wrote SQL queries to extract and transform data from a 10M-row PostgreSQL database.",
                "Automated weekly reports using Python and openpyxl; saved 4 hours/week of manual effort.",
            ],
        }],
        "skills": ["Python", "Pandas", "SQL (PostgreSQL)", "Power BI", "Excel", "NumPy", "Matplotlib"],
        "certs": [
            "Google Data Analytics Certificate (Coursera), 2023",
            "Microsoft Power BI Data Analyst (PL-300) - in progress",
        ],
        "personal": [
            "Date of Birth: 22 Jul 2000  |  Gender: Female",
            "Languages: English, Tamil, Hindi",
        ],
    },

    "Karan_Desai": {
        "name": "Karan Desai",
        "contact": "karan@demo.com  |  +91-9100000008  |  Mumbai, Maharashtra",
        "objective": (
            "Risk Analytics professional with 6 years in BFSI, specialising in retail credit scorecard "
            "development, roll-rate analysis, and RBI regulatory reporting. Seeking a senior risk "
            "analyst role to drive data-driven lending decisions."
        ),
        "education": [
            {"degree": "MBA - Finance", "institution": "XLRI Jamshedpur",
             "year": "2018", "score": "74.5% (Gold Medallist - Finance Track)"},
            {"degree": "B.Com - Commerce", "institution": "HR College Mumbai",
             "year": "2016", "score": "82.1%"},
        ],
        "experience": [
            {
                "title": "Senior Risk Analyst",
                "company": "Mahindra Finance (NBFC), Mumbai",
                "period": "Aug 2021 - Present",
                "bullets": [
                    "Developed CIBIL-integrated credit scorecard for personal loans; reduced NPAs by 18%.",
                    "Built roll-rate and vintage analysis models for Rs 2,400 Cr retail lending book.",
                    "Filed NBS-9, ALM, and FMR returns to RBI monthly with zero regulatory non-compliance.",
                ],
            },
            {
                "title": "Risk Analyst",
                "company": "Kotak Mahindra Bank, Mumbai",
                "period": "Jun 2018 - Jul 2021",
                "bullets": [
                    "Performed portfolio segmentation and early-warning indicator development for SME credit.",
                    "Automated MIS reporting using Python and openpyxl; saving 10 hours/week of analyst time.",
                ],
            },
        ],
        "skills": ["Financial Modelling", "Credit Scorecard", "Risk Analysis", "Python (Pandas)", "SQL", "Power BI", "Excel", "CIBIL Integration", "RBI Regulations"],
        "certs": [
            "CFA Level 2 Candidate (appearing Dec 2026)",
            "FRM Part 1 Cleared, 2020",
        ],
        "personal": [
            "Date of Birth: 18 Apr 1994  |  Gender: Male",
            "Languages: English, Hindi, Gujarati",
        ],
    },
}

APPLICATION_MAP = {
    1:  "Priya_Sharma",
    2:  "Amit_Kulkarni",
    3:  "Rahul_Mehta",
    4:  "Vikram_Singh",
    5:  "Arun_Nambiar",
    6:  "Anita_Rao",
    7:  "Sneha_Joshi",
    8:  "Deepa_Krishnan",
    9:  "Anita_Rao",
    10: "Sneha_Joshi",
    11: "Vikram_Singh",
    12: "Deepa_Krishnan",
    13: "Priya_Sharma",
    14: "Karan_Desai",
}

def main():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    for app_id, key in APPLICATION_MAP.items():
        lines = layout(RESUMES[key])
        pdf_bytes = build_pdf(lines)
        filename = f"{app_id}_{key}_Resume.pdf"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(pdf_bytes)
        print(f"  wrote {path}  ({len(pdf_bytes):,} bytes, {len(lines)} text ops)")

if __name__ == "__main__":
    main()
