-- =============================================================================
-- seed-demo.sql  —  Full demo dataset for RecPro presentation
-- Run:  mysql -u root recruitment_db < docs/seed-demo.sql
--
-- Password for ALL accounts: Test@1234
-- Hash below is BCrypt(10) of "Test@1234"
-- =============================================================================

USE recruitment_db;

-- ─────────────────────────────────────────────────────────────────────────────
-- CLEAN SLATE  (order respects FK constraints)
-- ─────────────────────────────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reports;
TRUNCATE TABLE notifications;
TRUNCATE TABLE interviews;
TRUNCATE TABLE applications;
TRUNCATE TABLE candidate_skills;
TRUNCATE TABLE candidate_location_prefs;
TRUNCATE TABLE candidate_role_prefs;
TRUNCATE TABLE vacancies;
TRUNCATE TABLE employers;
TRUNCATE TABLE candidates;
SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- ADMIN  (stored in candidates table with role=ADMIN)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO candidates
  (full_name, email, phone, password_hash, dob, gender, degree, institution,
   year_of_passing, percentage, total_exp_yrs, expected_sal_min, expected_sal_max, role)
VALUES
  ('Super Admin', 'admin@recpro.com', '0000000000',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
   '1990-01-01', 'Other', 'N/A', 'N/A', 2000, 0, 0, 0, 0, 'ADMIN');

-- ─────────────────────────────────────────────────────────────────────────────
-- EMPLOYERS  (5 companies, varied sectors)
-- employer_id auto-assigned; we reference by email subquery below
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO employers
  (org_name, contact_name, email, phone, password_hash, address, website,
   established_yr, num_employees, annual_turnover)
VALUES
-- 1
('TechNova Solutions',   'Arjun Kapoor',   'hr@technova.com',   '9800000001',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '12 Koramangala, Bangalore 560034', 'https://technova.example.com',
 2012, 850, 95000000.00),
-- 2
('Infosys BPM Ltd',      'Meera Nair',     'hr@infosysbpm.com', '9800000002',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 'Electronics City, Bangalore 560100', 'https://infosysbpm.example.com',
 2002, 32000, 2500000000.00),
-- 3
('DataBridge Analytics', 'Suresh Pillai',  'hr@databridge.com', '9800000003',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '7 Cyber Towers, Hyderabad 500081', 'https://databridge.example.com',
 2017, 320, 18000000.00),
-- 4
('CloudEdge Platforms',  'Divya Menon',    'hr@cloudedge.com',  '9800000004',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '14 Hinjewadi Phase 2, Pune 411057', 'https://cloudedge.example.com',
 2019, 210, 12000000.00),
-- 5
('FinServ Capital',      'Ravi Shankar',   'hr@finserv.com',    '9800000005',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '3 BKC, Mumbai 400051', 'https://finserv.example.com',
 2008, 1200, 450000000.00);

-- ─────────────────────────────────────────────────────────────────────────────
-- CANDIDATES  (10 candidates — varied backgrounds)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO candidates
  (full_name, email, phone, password_hash, dob, gender, degree, institution,
   year_of_passing, percentage, total_exp_yrs, expected_sal_min, expected_sal_max)
VALUES
('Priya Sharma',      'priya@demo.com',   '9100000001',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1998-05-10', 'Female', 'B.Tech CSE', 'VIT Vellore',          2020, 82.50, 3.5, 700000, 1200000),

('Rahul Mehta',       'rahul@demo.com',   '9100000002',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1997-08-20', 'Male',   'MCA',         'BITS Pilani',          2021, 78.00, 2.5, 600000, 1000000),

('Anita Rao',         'anita@demo.com',   '9100000003',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1999-03-15', 'Female', 'B.Sc CS',     'Osmania University',   2022, 85.20, 1.5, 400000, 700000),

('Vikram Singh',      'vikram@demo.com',  '9100000004',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1995-11-02', 'Male',   'B.Tech IT',   'NIT Warangal',         2018, 76.40, 5.0, 1000000, 1800000),

('Deepa Krishnan',    'deepa@demo.com',   '9100000005',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '2000-07-22', 'Female', 'B.E ECE',     'Anna University',      2023, 79.00, 0.5, 300000, 600000),

('Amit Kulkarni',     'amit@demo.com',    '9100000006',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1996-01-30', 'Male',   'M.Tech CSE',  'IIT Bombay',           2020, 88.70, 4.0, 1200000, 2000000),

('Sneha Joshi',       'sneha@demo.com',   '9100000007',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1998-09-14', 'Female', 'B.Tech CSE',  'Pune University',      2021, 80.10, 2.0, 500000, 900000),

('Karan Desai',       'karan@demo.com',   '9100000008',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1994-04-18', 'Male',   'MBA Finance', 'XLRI Jamshedpur',      2018, 74.50, 6.0, 1500000, 2500000),

('Nisha Patel',       'nisha@demo.com',   '9100000009',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '2001-12-05', 'Female', 'B.Sc IT',     'Mumbai University',    2023, 72.80, 0.0, 250000, 500000),

('Arun Nambiar',      'arun@demo.com',    '9100000010',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
 '1993-06-25', 'Male',   'B.Tech CSE',  'Kerala University',    2016, 81.30, 7.5, 1600000, 2800000);

-- ─────────────────────────────────────────────────────────────────────────────
-- CANDIDATE SKILLS
-- ─────────────────────────────────────────────────────────────────────────────
-- Priya — Java/React full-stack
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Java' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Spring Boot','Expert' UNION ALL
      SELECT 'React','Intermediate' UNION ALL
      SELECT 'MySQL','Intermediate' UNION ALL
      SELECT 'REST APIs','Expert') s ON c.email='priya@demo.com';

-- Rahul — Python/Django backend
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Python' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Django','Intermediate' UNION ALL
      SELECT 'PostgreSQL','Intermediate' UNION ALL
      SELECT 'REST APIs','Intermediate' UNION ALL
      SELECT 'Docker','Beginner') s ON c.email='rahul@demo.com';

-- Anita — Frontend
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'JavaScript' skill_name,'Expert' proficiency UNION ALL
      SELECT 'React','Intermediate' UNION ALL
      SELECT 'HTML/CSS','Expert' UNION ALL
      SELECT 'TypeScript','Beginner') s ON c.email='anita@demo.com';

-- Vikram — Cloud/DevOps
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'AWS' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Kubernetes','Expert' UNION ALL
      SELECT 'Terraform','Intermediate' UNION ALL
      SELECT 'Docker','Expert' UNION ALL
      SELECT 'CI/CD','Expert' UNION ALL
      SELECT 'Python','Intermediate') s ON c.email='vikram@demo.com';

-- Deepa — Data/ML fresher
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Python' skill_name,'Intermediate' proficiency UNION ALL
      SELECT 'Pandas','Intermediate' UNION ALL
      SELECT 'SQL','Beginner' UNION ALL
      SELECT 'Power BI','Beginner') s ON c.email='deepa@demo.com';

-- Amit — Senior Java architect
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Java' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Spring Boot','Expert' UNION ALL
      SELECT 'Microservices','Expert' UNION ALL
      SELECT 'Kafka','Expert' UNION ALL
      SELECT 'AWS','Intermediate' UNION ALL
      SELECT 'System Design','Expert') s ON c.email='amit@demo.com';

-- Sneha — React/Node
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'React' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Node.js','Intermediate' UNION ALL
      SELECT 'JavaScript','Expert' UNION ALL
      SELECT 'MongoDB','Intermediate' UNION ALL
      SELECT 'TypeScript','Intermediate') s ON c.email='sneha@demo.com';

-- Karan — Finance/Risk
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Financial Modelling' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Risk Analysis','Expert' UNION ALL
      SELECT 'Excel','Expert' UNION ALL
      SELECT 'Python','Intermediate' UNION ALL
      SELECT 'Power BI','Expert') s ON c.email='karan@demo.com';

-- Nisha — QA fresher
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Manual Testing' skill_name,'Beginner' proficiency UNION ALL
      SELECT 'Selenium','Beginner' UNION ALL
      SELECT 'SQL','Beginner') s ON c.email='nisha@demo.com';

-- Arun — Senior full-stack
INSERT INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT c.candidate_id, s.skill_name, s.proficiency FROM candidates c
JOIN (SELECT 'Java' skill_name,'Expert' proficiency UNION ALL
      SELECT 'Angular','Expert' UNION ALL
      SELECT 'Spring Boot','Expert' UNION ALL
      SELECT 'Oracle DB','Expert' UNION ALL
      SELECT 'Microservices','Intermediate' UNION ALL
      SELECT 'Leadership','Expert') s ON c.email='arun@demo.com';

-- ─────────────────────────────────────────────────────────────────────────────
-- LOCATION & ROLE PREFS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO candidate_location_prefs (candidate_id, location)
SELECT c.candidate_id, t.loc FROM candidates c
JOIN (SELECT 'priya@demo.com' em,'Bangalore' loc UNION ALL SELECT 'priya@demo.com','Hyderabad'
 UNION ALL SELECT 'rahul@demo.com','Pune' UNION ALL SELECT 'rahul@demo.com','Mumbai'
 UNION ALL SELECT 'anita@demo.com','Hyderabad' UNION ALL SELECT 'anita@demo.com','Bangalore'
 UNION ALL SELECT 'vikram@demo.com','Bangalore' UNION ALL SELECT 'vikram@demo.com','Pune'
 UNION ALL SELECT 'deepa@demo.com','Chennai' UNION ALL SELECT 'deepa@demo.com','Bangalore'
 UNION ALL SELECT 'amit@demo.com','Bangalore' UNION ALL SELECT 'amit@demo.com','Mumbai'
 UNION ALL SELECT 'sneha@demo.com','Pune' UNION ALL SELECT 'sneha@demo.com','Bangalore'
 UNION ALL SELECT 'karan@demo.com','Mumbai'
 UNION ALL SELECT 'nisha@demo.com','Mumbai' UNION ALL SELECT 'nisha@demo.com','Pune'
 UNION ALL SELECT 'arun@demo.com','Bangalore' UNION ALL SELECT 'arun@demo.com','Hyderabad') t ON c.email=t.em;

INSERT INTO candidate_role_prefs (candidate_id, preferred_role)
SELECT c.candidate_id, t.role FROM candidates c
JOIN (SELECT 'priya@demo.com' em,'Backend Developer' role UNION ALL SELECT 'priya@demo.com','Full Stack Developer'
 UNION ALL SELECT 'rahul@demo.com','Backend Developer'
 UNION ALL SELECT 'anita@demo.com','Frontend Developer'
 UNION ALL SELECT 'vikram@demo.com','Cloud Engineer' UNION ALL SELECT 'vikram@demo.com','DevOps Engineer'
 UNION ALL SELECT 'deepa@demo.com','Data Analyst'
 UNION ALL SELECT 'amit@demo.com','Software Architect' UNION ALL SELECT 'amit@demo.com','Senior Engineer'
 UNION ALL SELECT 'sneha@demo.com','Frontend Developer' UNION ALL SELECT 'sneha@demo.com','Full Stack Developer'
 UNION ALL SELECT 'karan@demo.com','Finance Analyst' UNION ALL SELECT 'karan@demo.com','Risk Manager'
 UNION ALL SELECT 'nisha@demo.com','QA Engineer'
 UNION ALL SELECT 'arun@demo.com','Senior Engineer' UNION ALL SELECT 'arun@demo.com','Tech Lead') t ON c.email=t.em;

-- ─────────────────────────────────────────────────────────────────────────────
-- VACANCIES
-- 5 employers × 4-5 openings each = 23 vacancies total
-- Employer 1 (TechNova) gets 7 vacancies — demo-focus employer
-- ─────────────────────────────────────────────────────────────────────────────

-- ── EMPLOYER 1: TechNova Solutions ──────────────────────────────────────────
INSERT INTO vacancies
  (employer_id, designation, department, job_description, required_qual,
   required_exp_yrs, salary_min, salary_max, employment_type,
   num_openings, location, application_deadline, status)
SELECT e.employer_id,
       v.designation, v.department, v.job_description, v.required_qual,
       v.req_exp, v.sal_min, v.sal_max, v.emp_type,
       v.openings, v.location, v.deadline, v.status
FROM employers e
JOIN (
  SELECT
    'Senior Java Backend Developer' designation,
    'Engineering' department,
    'We are looking for a Senior Java Backend Developer to join our fast-growing product team at TechNova Solutions. You will design and build robust, scalable microservices powering our SaaS recruitment platform used by 500+ enterprises.\n\nKey Responsibilities:\n• Design and develop high-performance REST APIs using Java 17+ and Spring Boot 3\n• Architect and maintain microservices communicating over Kafka and REST\n• Write optimised JPA/Hibernate queries against MySQL 8 databases\n• Lead code reviews, establish coding standards, and mentor junior engineers\n• Collaborate with DevOps to containerise services with Docker and deploy on AWS ECS\n• Participate in agile ceremonies (sprint planning, daily standups, retrospectives)\n\nTechnical Requirements:\n• 4+ years of professional Java development (Java 11 or higher)\n• Strong understanding of Spring Boot, Spring Security, JWT authentication\n• Experience with relational databases (MySQL / PostgreSQL) and ORM frameworks\n• Familiarity with message brokers (Kafka or RabbitMQ)\n• Knowledge of Docker, CI/CD pipelines (Jenkins / GitHub Actions)\n\nNice to Have:\n• AWS certifications (SAA-C03 or Developer)\n• Experience with Kubernetes and Helm charts\n• Prior work in product companies\n\nWhat We Offer:\n• Competitive CTC of ₹18–28 LPA depending on experience\n• 100% remote-first with quarterly all-hands in Bangalore\n• Medical insurance for self and family\n• Annual learning budget of ₹50,000' job_description,
    'B.Tech / M.Tech CSE or equivalent' required_qual,
    4.0 req_exp, 1800000 sal_min, 2800000 sal_max,
    'Permanent' emp_type, 2 openings, 'Bangalore' location,
    '2026-12-20' deadline, 'Open' status
  UNION ALL SELECT
    'React Frontend Developer' designation,
    'Product Engineering' department,
    'TechNova Solutions is hiring a React Frontend Developer to build beautiful, accessible, and performant UIs for our recruitment SaaS platform. You will work closely with designers, backend engineers, and product managers to deliver features that delight both employers and candidates.\n\nKey Responsibilities:\n• Build and maintain React 18 component libraries following atomic design principles\n• Implement state management using Redux Toolkit or Zustand\n• Integrate REST APIs and handle complex async flows with React Query\n• Write unit and integration tests using Jest and React Testing Library\n• Ensure cross-browser compatibility and WCAG 2.1 AA accessibility\n• Collaborate on design reviews and suggest UX improvements\n\nTechnical Requirements:\n• 2+ years of professional React development\n• Strong JavaScript (ES2020+) and TypeScript skills\n• Experience with Vite or Webpack build systems\n• Proficiency in CSS/SCSS and CSS-in-JS (styled-components or Emotion)\n• Familiarity with Git branching strategies and code review workflows\n\nNice to Have:\n• Experience with Next.js or Remix\n• Knowledge of micro-frontend architecture\n• Prior contributions to open-source projects\n\nWhat We Offer:\n• CTC ₹8–14 LPA\n• Hybrid (3 days in office, Bangalore)\n• Health and wellness allowance\n• Flexible working hours' job_description,
    'B.Tech / B.E / MCA' required_qual,
    2.0 req_exp, 800000 sal_min, 1400000 sal_max,
    'Permanent' emp_type, 3 openings, 'Bangalore' location,
    '2026-12-18' deadline, 'Open' status
  UNION ALL SELECT
    'DevOps / Cloud Engineer' designation,
    'Infrastructure' department,
    'We are scaling our infrastructure at TechNova Solutions and need an experienced DevOps / Cloud Engineer to own our AWS footprint, improve deployment pipelines, and champion a culture of reliability.\n\nKey Responsibilities:\n• Design and manage AWS infrastructure using Terraform (IaC)\n• Build and maintain CI/CD pipelines using GitHub Actions and ArgoCD\n• Manage Kubernetes (EKS) clusters — deployments, autoscaling, monitoring\n• Implement observability stack: Prometheus, Grafana, Loki, and PagerDuty alerting\n• Drive cost optimisation initiatives across AWS services\n• Establish and maintain DR and backup procedures\n\nTechnical Requirements:\n• 3+ years of DevOps / cloud engineering experience\n• Strong hands-on AWS experience (EC2, ECS/EKS, RDS, S3, IAM, CloudFront)\n• Proficiency in Terraform and Ansible for infrastructure as code\n• Experience with Docker and Kubernetes in production\n• Scripting skills in Bash and Python\n\nNice to Have:\n• AWS Certified Solutions Architect – Professional\n• Experience with multi-cloud environments (GCP / Azure)\n• Knowledge of service mesh (Istio)\n\nWhat We Offer:\n• CTC ₹14–22 LPA\n• Remote-first role with annual team off-sites\n• AWS training and certification sponsorship' job_description,
    'B.Tech / B.E (any branch)' required_qual,
    3.0 req_exp, 1400000 sal_min, 2200000 sal_max,
    'Permanent' emp_type, 1 openings, 'Bangalore' location,
    '2026-12-25' deadline, 'Open' status
  UNION ALL SELECT
    'QA Automation Engineer' designation,
    'Quality Assurance' department,
    'TechNova Solutions is looking for a detail-oriented QA Automation Engineer to ensure our platform meets the highest quality standards before every release.\n\nKey Responsibilities:\n• Design and implement automated test suites using Selenium WebDriver and Playwright\n• Write API test cases using RestAssured and Postman/Newman\n• Integrate tests into CI/CD pipelines and triage failures\n• Define test plans, write test cases, and track coverage metrics\n• Perform regression, performance, and exploratory testing\n• Coordinate with developers to reproduce and document defects\n\nTechnical Requirements:\n• 2+ years of QA experience (1+ year automation)\n• Strong Java or Python programming for test automation\n• Experience with Selenium, Playwright, or Cypress\n• Knowledge of API testing and tools like Postman\n• Familiarity with JIRA and test management tools\n\nNice to Have:\n• Experience with performance testing (JMeter / Gatling)\n• ISTQB Foundation certification\n\nWhat We Offer:\n• CTC ₹6–10 LPA\n• Hybrid Bangalore\n• Unlimited paid time off policy' job_description,
    'B.Tech / B.E / BCA' required_qual,
    2.0 req_exp, 600000 sal_min, 1000000 sal_max,
    'Permanent' emp_type, 2 openings, 'Bangalore' location,
    '2026-12-22' deadline, 'Open' status
  UNION ALL SELECT
    'Data Analyst – Talent Intelligence' designation,
    'People Analytics' department,
    'At TechNova Solutions, data drives every hiring decision. We need a Data Analyst to build insights from our platform''s rich recruitment dataset — helping enterprise clients understand sourcing efficiency, funnel conversion, and time-to-hire.\n\nKey Responsibilities:\n• Build and maintain dashboards in Tableau / Power BI connected to MySQL\n• Write complex SQL queries to extract, transform, and analyse recruitment funnel data\n• Create weekly and monthly hiring reports for client success teams\n• Identify trends, outliers, and actionable insights from application and interview data\n• Collaborate with product teams to define new platform metrics\n\nTechnical Requirements:\n• 1–3 years of data analytics experience\n• Strong SQL skills (window functions, CTEs, subqueries)\n• Proficiency in Excel / Google Sheets for ad-hoc analysis\n• Experience with at least one BI tool: Tableau, Power BI, or Looker\n• Basic Python or R for data wrangling is a plus\n\nWhat We Offer:\n• CTC ₹7–12 LPA\n• Hybrid Bangalore / remote possible\n• Access to rich anonymised dataset for personal projects' job_description,
    'B.Sc / B.Tech (any quantitative field)' required_qual,
    1.0 req_exp, 700000 sal_min, 1200000 sal_max,
    'Contract' emp_type, 1 openings, 'Bangalore' location,
    '2026-12-30' deadline, 'Open' status
  UNION ALL SELECT
    'Product Manager – Platform' designation,
    'Product' department,
    'We are searching for a Product Manager to own the core employer experience on our platform — from job posting and candidate search to interview scheduling and offer management.\n\nKey Responsibilities:\n• Define product vision and roadmap for employer-facing features\n• Write detailed PRDs, user stories, and acceptance criteria\n• Conduct user research interviews and usability tests with employer partners\n• Prioritise backlog in collaboration with engineering and design\n• Track KPIs: feature adoption, NPS, employer retention\n• Work with go-to-market team on feature launches\n\nTechnical Requirements:\n• 3–5 years of product management experience, preferably in B2B SaaS\n• Demonstrated ability to ship 0→1 and iterative product cycles\n• Data-driven mindset: comfortable with SQL, Mixpanel, or similar analytics\n• Strong written and verbal communication\n\nNice to Have:\n• Prior experience in HR-tech or recruitment software\n• MBA from a reputed institution\n\nWhat We Offer:\n• CTC ₹20–30 LPA\n• Hybrid Bangalore\n• ESOPs after 1-year cliff' job_description,
    'Any graduate / MBA preferred' required_qual,
    3.0 req_exp, 2000000 sal_min, 3000000 sal_max,
    'Permanent' emp_type, 1 openings, 'Bangalore' location,
    '2026-12-15' deadline, 'Open' status
  UNION ALL SELECT
    'Technical Content Writer' designation,
    'Marketing' department,
    'TechNova Solutions is growing its thought leadership presence and needs a Technical Content Writer to produce developer-focused blog posts, documentation, case studies, and whitepapers.\n\nKey Responsibilities:\n• Write technically accurate blog articles (1,500–3,000 words) on topics like API design, cloud architecture, and HR-tech trends\n• Create and maintain developer documentation for our public APIs\n• Collaborate with engineering teams to understand and explain complex features\n• Draft customer case studies and ROI whitepapers\n• Manage content calendar and coordinate with the SEO team\n\nTechnical Requirements:\n• 1–3 years of technical writing or developer relations experience\n• Strong English writing skills — clarity, conciseness, and accuracy\n• Comfortable reading and explaining code (preferably Java / JavaScript)\n• Familiarity with Markdown, Confluence, or similar documentation tools\n\nWhat We Offer:\n• CTC ₹5–9 LPA\n• Fully remote\n• Flexible hours' job_description,
    'Any graduate with strong writing portfolio' required_qual,
    1.0 req_exp, 500000 sal_min, 900000 sal_max,
    'Permanent' emp_type, 1 openings, 'Bangalore' location,
    '2027-01-10' deadline, 'Open' status
) v ON e.email = 'hr@technova.com';

-- ── EMPLOYER 2: Infosys BPM Ltd ─────────────────────────────────────────────
INSERT INTO vacancies
  (employer_id, designation, department, job_description, required_qual,
   required_exp_yrs, salary_min, salary_max, employment_type,
   num_openings, location, application_deadline, status)
SELECT e.employer_id,
       v.designation, v.department, v.job_description, v.required_qual,
       v.req_exp, v.sal_min, v.sal_max, v.emp_type,
       v.openings, v.location, v.deadline, v.status
FROM employers e
JOIN (
  SELECT
    'Java Full Stack Developer' designation, 'Technology' department,
    'Infosys BPM Ltd is hiring Java Full Stack Developers to join client-delivery engagements across BFSI, healthcare, and retail sectors. You will work on enterprise-grade applications serving millions of end users.\n\nKey Responsibilities:\n• Develop RESTful microservices using Spring Boot and deploy on Azure\n• Build Angular or React frontends integrated with Spring backends\n• Write PL/SQL stored procedures and optimise Oracle DB queries\n• Participate in onsite-offshore model; occasional travel may be required\n• Conduct unit testing with JUnit 5 and integration testing with Mockito\n\nRequirements:\n• 2–5 years Java Full Stack (Spring Boot + Angular / React)\n• Oracle or SQL Server database experience\n• Exposure to Azure or AWS cloud services\n• Strong communication and client-facing skills\n\nPerks: CTC ₹10–18 LPA, Bangalore / Mysore, Health cover for family, PF and gratuity' job_description,
    'B.Tech / M.Tech / MCA' required_qual,
    2.0 req_exp, 1000000 sal_min, 1800000 sal_max,
    'Permanent' emp_type, 10 openings, 'Bangalore' location,
    '2026-12-28' deadline, 'Open' status
  UNION ALL SELECT
    'Business Analyst – BFSI', 'Consulting',
    'Infosys BPM Ltd is looking for Business Analysts with domain expertise in banking, financial services, or insurance to work on digital transformation projects for leading global banks.\n\nKey Responsibilities:\n• Gather, analyse, and document business requirements from client stakeholders\n• Write BRDs, FRDs, and user stories; create process flow diagrams (BPMN)\n• Coordinate UAT cycles, track defect resolution, and obtain sign-offs\n• Identify process inefficiencies and recommend improvements\n• Support project managers in tracking milestones and risks\n\nRequirements:\n• 3–6 years of BA experience in BFSI domain\n• Strong knowledge of core banking, payments, or insurance processes\n• Proficiency in MS Visio, JIRA, and Confluence\n• Excellent communication and stakeholder management\n\nCTC ₹12–20 LPA, Mumbai or Bangalore, Hybrid' job_description,
    'Any graduate / MBA Finance preferred' required_qual,
    3.0 req_exp, 1200000 sal_min, 2000000 sal_max,
    'Permanent' emp_type, 5 openings, 'Mumbai' location,
    '2026-12-20' deadline, 'Open' status
  UNION ALL SELECT
    'SAP FICO Consultant', 'ERP Practice',
    'Infosys BPM Ltd is seeking an experienced SAP FICO Consultant for large-scale S/4HANA migration and greenfield implementation projects.\n\nKey Responsibilities:\n• Configure SAP FI (GL, AR, AP, Asset Accounting) and CO (Cost Centre, Profit Centre, COPA)\n• Conduct fit-gap analysis and document AS-IS / TO-BE processes\n• Manage data migration using LSMW / BAPI and validate financial reports\n• Provide post-go-live hypercare support\n• Train end-users and create process documentation\n\nRequirements:\n• 4+ years SAP FICO configuration experience\n• At least one full-cycle S/4HANA implementation preferred\n• Strong understanding of financial accounting principles\n• SAP certification (C_TFIN52 or equivalent) is a plus\n\nCTC ₹15–25 LPA, Pune / Bangalore, Travel required' job_description,
    'B.Com / M.Com / CA / MBA Finance' required_qual,
    4.0 req_exp, 1500000 sal_min, 2500000 sal_max,
    'Permanent' emp_type, 3 openings, 'Pune' location,
    '2026-12-18' deadline, 'Open' status
  UNION ALL SELECT
    'HR Generalist – Talent Acquisition', 'Human Resources',
    'Infosys BPM Ltd is hiring an HR Generalist to support talent acquisition and employee life-cycle management for a 3,000-person delivery centre in Bangalore.\n\nKey Responsibilities:\n• Manage end-to-end recruitment: JD creation, sourcing, screening, offer rollout\n• Conduct campus hiring drives at Tier 2 engineering colleges\n• Manage onboarding, induction programmes, and HRIS data entry\n• Support performance appraisal cycle administration\n• Handle employee queries related to HR policies and benefits\n\nRequirements:\n• 2–4 years HR / recruitment experience, preferably in IT services\n• Familiarity with ATS tools (Taleo, SuccessFactors, or similar)\n• Strong interpersonal and communication skills\n• MBA HR preferred\n\nCTC ₹5–8 LPA, Bangalore, On-site' job_description,
    'MBA HR / PGDM' required_qual,
    2.0 req_exp, 500000 sal_min, 800000 sal_max,
    'Permanent' emp_type, 2 openings, 'Bangalore' location,
    '2026-12-22' deadline, 'Open' status
  UNION ALL SELECT
    'Python Developer – Automation', 'Digital Operations',
    'Infosys BPM Digital Operations team is building intelligent automation solutions for insurance claims processing. We need a Python Developer to build RPA bots, data pipelines, and ML-assisted decisioning tools.\n\nKey Responsibilities:\n• Build Python-based RPA workflows using UiPath and Automation Anywhere\n• Create ETL pipelines using Apache Airflow and Pandas\n• Develop REST APIs using FastAPI and deploy on Azure Functions\n• Write Jupyter notebooks for exploratory data analysis and model prototyping\n\nRequirements:\n• 2+ years Python development (not scripting-only)\n• Experience with Pandas, NumPy, and data pipeline tools\n• FastAPI or Flask for API development\n• Basic understanding of ML models (scikit-learn)\n\nCTC ₹9–14 LPA, Hyderabad, Hybrid' job_description,
    'B.Tech / B.Sc (CS or IT)' required_qual,
    2.0 req_exp, 900000 sal_min, 1400000 sal_max,
    'Permanent' emp_type, 4 openings, 'Hyderabad' location,
    '2026-12-25' deadline, 'Open' status
) v ON e.email = 'hr@infosysbpm.com';

-- ── EMPLOYER 3: DataBridge Analytics ────────────────────────────────────────
INSERT INTO vacancies
  (employer_id, designation, department, job_description, required_qual,
   required_exp_yrs, salary_min, salary_max, employment_type,
   num_openings, location, application_deadline, status)
SELECT e.employer_id,
       v.designation, v.department, v.job_description, v.required_qual,
       v.req_exp, v.sal_min, v.sal_max, v.emp_type,
       v.openings, v.location, v.deadline, v.status
FROM employers e
JOIN (
  SELECT
    'Data Engineer – Databricks' designation, 'Data Platform' department,
    'DataBridge Analytics is building the next generation of real-time recruitment intelligence. We need a Data Engineer to design and maintain our cloud data lakehouse on Databricks and AWS.\n\nKey Responsibilities:\n• Design and build scalable data pipelines using Apache Spark (PySpark) on Databricks\n• Manage Delta Lake tables, optimise storage with ZORDER and auto-optimise\n• Orchestrate workflows using Apache Airflow (MWAA on AWS)\n• Build bronze → silver → gold medallion architecture\n• Profile and monitor data quality using Great Expectations\n\nRequirements:\n• 2+ years data engineering experience\n• Strong PySpark and SQL skills\n• Experience with cloud storage (S3 or ADLS)\n• Familiarity with Databricks or Spark on EMR\n\nCTC ₹12–18 LPA, Hyderabad, Hybrid' job_description,
    'B.Tech / M.Tech CSE or Data Science' required_qual,
    2.0 req_exp, 1200000 sal_min, 1800000 sal_max,
    'Permanent' emp_type, 2 openings, 'Hyderabad' location,
    '2026-12-20' deadline, 'Open' status
  UNION ALL SELECT
    'ML Engineer – NLP', 'AI Research',
    'DataBridge Analytics applies NLP to match candidates with job descriptions, predict attrition, and score resumes. We need an ML Engineer to productionise our NLP models.\n\nKey Responsibilities:\n• Fine-tune transformer models (BERT, RoBERTa) on recruitment datasets\n• Build and deploy model-serving APIs using FastAPI and Docker\n• Monitor model drift and retrain pipelines using MLflow\n• Work with annotation teams to curate labelled datasets\n• Collaborate with product to surface ML outputs in the RecPro UI\n\nRequirements:\n• 2+ years applied ML/NLP experience\n• Strong Python: PyTorch or TensorFlow, Hugging Face Transformers\n• Experience deploying models to production (REST API, batch job)\n• Understanding of evaluation metrics: precision, recall, F1\n\nCTC ₹14–20 LPA, Hyderabad' job_description,
    'M.Tech / M.Sc in CS / AI / Data Science' required_qual,
    2.0 req_exp, 1400000 sal_min, 2000000 sal_max,
    'Permanent' emp_type, 1 openings, 'Hyderabad' location,
    '2026-12-22' deadline, 'Open' status
  UNION ALL SELECT
    'Business Intelligence Developer', 'Analytics',
    'DataBridge Analytics is looking for a BI Developer to build client-facing dashboards and self-service reporting tools. Our clients include staffing agencies and in-house talent acquisition teams at Fortune 500 companies.\n\nKey Responsibilities:\n• Design and develop Tableau and Power BI dashboards from scratch\n• Write complex SQL transformations using dbt (data build tool)\n• Work with data engineers to define semantic layer models\n• Train end-users on self-service analytics\n• Document data dictionaries and lineage\n\nRequirements:\n• 2+ years BI development (Tableau or Power BI)\n• Strong SQL and data modelling skills\n• Experience with dbt or similar transformation tools\n• Excellent data visualisation design sense\n\nCTC ₹8–13 LPA, Hyderabad' job_description,
    'B.Tech / B.Sc (any quantitative field)' required_qual,
    2.0 req_exp, 800000 sal_min, 1300000 sal_max,
    'Contract' emp_type, 1 openings, 'Hyderabad' location,
    '2026-12-28' deadline, 'Open' status
  UNION ALL SELECT
    'Data Analyst – Fresher', 'Analytics',
    'DataBridge Analytics offers a structured 6-month trainee programme for freshers to become industry-ready data analysts. Trainees work alongside senior analysts on real client projects from day one.\n\nKey Responsibilities:\n• Learn and apply SQL for data extraction and reporting\n• Assist in building Power BI dashboards under senior guidance\n• Conduct ad-hoc analysis using Python (Pandas)\n• Clean and validate data sourced from client HR systems\n\nRequirements:\n• 2023 or 2024 graduate in CS, IT, Mathematics, or Statistics\n• Basic SQL and Excel skills\n• Strong analytical and problem-solving mindset\n• Willingness to learn and take initiative\n\nStipend ₹25,000/month → CTC ₹4–5 LPA on conversion, Hyderabad' job_description,
    'B.Sc / B.Tech (CS / IT / Math / Statistics), 2023–2024 passout' required_qual,
    0.0 req_exp, 300000 sal_min, 500000 sal_max,
    'Contract' emp_type, 3 openings, 'Hyderabad' location,
    '2026-12-15' deadline, 'Open' status
) v ON e.email = 'hr@databridge.com';

-- ── EMPLOYER 4: CloudEdge Platforms ─────────────────────────────────────────
INSERT INTO vacancies
  (employer_id, designation, department, job_description, required_qual,
   required_exp_yrs, salary_min, salary_max, employment_type,
   num_openings, location, application_deadline, status)
SELECT e.employer_id,
       v.designation, v.department, v.job_description, v.required_qual,
       v.req_exp, v.sal_min, v.sal_max, v.emp_type,
       v.openings, v.location, v.deadline, v.status
FROM employers e
JOIN (
  SELECT
    'Cloud Solutions Architect' designation, 'Solutions Engineering' department,
    'CloudEdge Platforms helps enterprises migrate to AWS and modernise their application stacks. We need a Cloud Solutions Architect to lead pre-sales and delivery engagements.\n\nKey Responsibilities:\n• Design end-to-end AWS architectures for client workloads (web, data, ML)\n• Create Well-Architected Review reports and remediation plans\n• Lead proof-of-concept projects and present to C-suite stakeholders\n• Mentor a team of 3–5 cloud engineers\n• Maintain AWS Competency standards and partner certifications\n\nRequirements:\n• 5+ years cloud architecture (AWS primary)\n• AWS Certified Solutions Architect – Professional mandatory\n• Hands-on with Terraform, CloudFormation\n• Strong communication for executive-level conversations\n\nCTC ₹25–40 LPA, Pune' job_description,
    'B.Tech / M.Tech (any branch)' required_qual,
    5.0 req_exp, 2500000 sal_min, 4000000 sal_max,
    'Permanent' emp_type, 1 openings, 'Pune' location,
    '2026-12-20' deadline, 'Open' status
  UNION ALL SELECT
    'Site Reliability Engineer (SRE)', 'Platform Engineering',
    'CloudEdge Platforms manages production infrastructure for 50+ cloud-native clients. Our SRE team owns reliability, latency SLAs, and incident response.\n\nKey Responsibilities:\n• Define and track SLOs/SLAs for client platforms\n• Build automated runbooks and blameless post-mortem culture\n• Implement distributed tracing with OpenTelemetry and Jaeger\n• Conduct chaos engineering experiments using Gremlin or LitmusChaos\n• Manage on-call rotations with PagerDuty; target < 5 min MTTD\n\nRequirements:\n• 3+ years SRE or platform engineering\n• Linux internals, networking fundamentals\n• Kubernetes and Helm in production\n• Proficiency in Go or Python for tooling\n\nCTC ₹16–24 LPA, Pune' job_description,
    'B.Tech / B.E (CS / IT / ECE)' required_qual,
    3.0 req_exp, 1600000 sal_min, 2400000 sal_max,
    'Permanent' emp_type, 2 openings, 'Pune' location,
    '2026-12-22' deadline, 'Open' status
  UNION ALL SELECT
    'AWS Trainee Engineer', 'Cloud Operations',
    'CloudEdge Platforms runs a 3-month AWS Accelerator programme for freshers with strong fundamentals. Graduates are placed on client accounts as Junior Cloud Engineers.\n\nKey Responsibilities:\n• Learn AWS core services: EC2, S3, RDS, VPC, IAM, Lambda\n• Work on guided migration labs under senior architects\n• Assist in monitoring and incident triage\n• Earn AWS Cloud Practitioner certification (sponsored)\n\nRequirements:\n• 2024 or 2025 graduate in CS / IT / ECE\n• Basic Linux command-line skills\n• Understanding of networking (TCP/IP, DNS, HTTP)\n• AWS Cloud Practitioner (or studying for it) is a plus\n\nStipend ₹20,000/month → CTC ₹5–7 LPA on absorption, Pune' job_description,
    'B.Tech / B.E (CS / IT / ECE), 2024–2025 passout' required_qual,
    0.0 req_exp, 200000 sal_min, 500000 sal_max,
    'Contract' emp_type, 5 openings, 'Pune' location,
    '2026-12-25' deadline, 'Open' status
  UNION ALL SELECT
    'Network & Security Engineer', 'Infrastructure',
    'CloudEdge Platforms is expanding its managed security services practice. We need a Network & Security Engineer to handle firewall policy, VPN design, and security baseline enforcement for client AWS environments.\n\nKey Responsibilities:\n• Configure AWS Network Firewall, WAF, Shield, GuardDuty\n• Design hub-and-spoke VPC architectures using Transit Gateway\n• Conduct vulnerability assessments and pen-test coordination\n• Maintain CIS Benchmark compliance for EC2 and EKS workloads\n• Support SOC2 and ISO 27001 audit evidence collection\n\nRequirements:\n• 3+ years network/security engineering\n• AWS Security Specialty certification preferred\n• Experience with SIEM tools (Splunk or AWS Security Hub)\n• Scripting: Python or Bash for automation\n\nCTC ₹14–22 LPA, Pune' job_description,
    'B.Tech / B.E (CS / IT / ECE)' required_qual,
    3.0 req_exp, 1400000 sal_min, 2200000 sal_max,
    'Permanent' emp_type, 1 openings, 'Pune' location,
    '2026-12-18' deadline, 'Open' status
) v ON e.email = 'hr@cloudedge.com';

-- ── EMPLOYER 5: FinServ Capital ──────────────────────────────────────────────
INSERT INTO vacancies
  (employer_id, designation, department, job_description, required_qual,
   required_exp_yrs, salary_min, salary_max, employment_type,
   num_openings, location, application_deadline, status)
SELECT e.employer_id,
       v.designation, v.department, v.job_description, v.required_qual,
       v.req_exp, v.sal_min, v.sal_max, v.emp_type,
       v.openings, v.location, v.deadline, v.status
FROM employers e
JOIN (
  SELECT
    'Risk Analyst – Credit' designation, 'Risk Management' department,
    'FinServ Capital is one of India''s leading NBFC-MFI lenders. We are hiring a Credit Risk Analyst to strengthen our risk analytics function as we scale our retail lending book.\n\nKey Responsibilities:\n• Build and monitor scorecards for personal loan and SME credit products\n• Conduct vintage analysis, roll-rate analysis, and portfolio segmentation\n• Develop stress-testing models and report to the Risk Committee\n• Collaborate with data engineering to integrate bureau data (CIBIL, Experian)\n• Prepare MIS reports for board-level risk dashboards\n\nRequirements:\n• 3–6 years credit risk / risk analytics in BFSI\n• Strong SQL and Python for data analysis\n• Experience with scorecards and logistic regression models\n• Understanding of RBI regulations on NBFC lending\n\nCTC ₹15–25 LPA, Mumbai' job_description,
    'MBA Finance / CA / B.Tech with Finance background' required_qual,
    3.0 req_exp, 1500000 sal_min, 2500000 sal_max,
    'Permanent' emp_type, 2 openings, 'Mumbai' location,
    '2026-12-20' deadline, 'Open' status
  UNION ALL SELECT
    'Investment Banking Analyst', 'Investment Banking',
    'FinServ Capital''s IB division advises on M&A, ECM/DCM transactions, and structured finance for mid-market companies. We are looking for a sharp Analyst to join our deal team.\n\nKey Responsibilities:\n• Build detailed LBO, DCF, and comparable company analysis models in Excel\n• Prepare CIMs, pitch books, and management presentations\n• Conduct industry research and competitive benchmarking\n• Coordinate with legal, accounts, and clients during transaction execution\n• Support due diligence processes for buy-side mandates\n\nRequirements:\n• 1–3 years IB or Big 4 transaction advisory experience\n• Strong financial modelling skills (Excel, Capital IQ)\n• CFA Level 1 cleared or pursuing preferred\n• Ability to work under pressure and meet tight deadlines\n\nCTC ₹18–28 LPA, Mumbai' job_description,
    'MBA Finance / CA / CFA' required_qual,
    2.0 req_exp, 1800000 sal_min, 2800000 sal_max,
    'Permanent' emp_type, 3 openings, 'Mumbai' location,
    '2026-12-18' deadline, 'Open' status
  UNION ALL SELECT
    'Java Developer – Core Banking', 'Technology',
    'FinServ Capital is modernising its core banking platform. We need a Java Developer with financial systems experience to integrate our loan management system with NACH, BBPS, and bureau APIs.\n\nKey Responsibilities:\n• Develop and maintain Java Spring Boot microservices for loan origination and collections\n• Integrate with RBI-regulated systems: NACH mandate, BBPS reconciliation, bureau pull APIs\n• Write JUnit 5 / Mockito tests achieving >80% code coverage\n• Participate in bi-weekly release cycles with zero-downtime deployments\n• Troubleshoot production issues with 15-min SLA for P1 incidents\n\nRequirements:\n• 3+ years Java development in a financial services context\n• Spring Boot, JPA/Hibernate, RESTful APIs\n• MySQL or Oracle database experience\n• Knowledge of NACH / IMPS / BBPS is a strong differentiator\n\nCTC ₹14–22 LPA, Mumbai' job_description,
    'B.Tech / M.Tech CSE' required_qual,
    3.0 req_exp, 1400000 sal_min, 2200000 sal_max,
    'Permanent' emp_type, 2 openings, 'Mumbai' location,
    '2026-12-25' deadline, 'Open' status
  UNION ALL SELECT
    'Compliance & Regulatory Officer', 'Legal & Compliance',
    'FinServ Capital operates under strict RBI NBFC guidelines. We need a Compliance Officer to manage regulatory reporting, internal audits, and ensure our processes stay ahead of regulatory changes.\n\nKey Responsibilities:\n• Monitor RBI Master Directions for NBFC-MFI and implement policy changes\n• File RBI returns: NBS-9, ALM, FMR — accurate and on time\n• Conduct quarterly internal compliance audits across branches\n• Liaise with external auditors and RBI inspection teams\n• Maintain compliance calendar and escalate risks to the Board\n\nRequirements:\n• 3–6 years in NBFC / bank compliance or regulatory roles\n• Deep knowledge of RBI regulations (NBFC, KYC/AML, FPC)\n• CS (Company Secretary) or LLB preferred\n• Strong documentation and report-writing skills\n\nCTC ₹12–18 LPA, Mumbai' job_description,
    'CS / LLB / MBA (Finance or Law)' required_qual,
    3.0 req_exp, 1200000 sal_min, 1800000 sal_max,
    'Permanent' emp_type, 1 openings, 'Mumbai' location,
    '2026-12-22' deadline, 'Open' status
  UNION ALL SELECT
    'Financial Analyst – FP&A', 'Finance',
    'FinServ Capital''s FP&A team drives annual budgeting, monthly business reviews, and strategic forecasting. We are looking for a Financial Analyst to bring rigour and speed to our planning processes.\n\nKey Responsibilities:\n• Build and maintain 3-statement financial models and rolling forecasts\n• Prepare monthly MIS packs for the CFO and business heads\n• Automate reporting using Python and Power BI; reduce manual effort by 40%\n• Conduct variance analysis (actual vs. budget vs. prior year)\n• Support fundraising activities: lender due diligence, board decks\n\nRequirements:\n• 2–4 years FP&A or financial analysis experience\n• Advanced Excel / Google Sheets financial modelling\n• Python for automation (Pandas, openpyxl)\n• Power BI for visualisation\n• CA / CMA / MBA Finance preferred\n\nCTC ₹10–16 LPA, Mumbai' job_description,
    'CA / CMA / MBA Finance' required_qual,
    2.0 req_exp, 1000000 sal_min, 1600000 sal_max,
    'Contract' emp_type, 2 openings, 'Mumbai' location,
    '2026-12-28' deadline, 'Open' status
) v ON e.email = 'hr@finserv.com';

-- ─────────────────────────────────────────────────────────────────────────────
-- APPLICATIONS
-- Focus: TechNova "Senior Java Backend Developer" vacancy gets 8 applicants
-- with every status represented  — this is the main demo vacancy
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: grab vacancy IDs by employer email + designation
-- We use subselects so the script is auto-id–safe

-- ── TechNova: Senior Java Backend Developer  → 8 applicants ─────────────────

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='priya@demo.com'),
  'Selected',
  'I have 3.5 years of Java and Spring Boot experience, delivered two microservices-based platforms at scale. I am excited about TechNova''s SaaS mission and would love to contribute to your engineering team. I am very comfortable with Kafka and have led a team of 4 engineers in my current role.',
  91,
  'Strong candidate. 3.5 years Java/Spring Boot experience with demonstrated microservices and team leadership. Excellent technical match for the role. Recommended for immediate selection.',
  NOW() - INTERVAL 20 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='amit@demo.com'),
  'Interview Scheduled',
  'With 4 years at IIT Bombay''s tech incubator and deep expertise in Java microservices, Kafka, and AWS, I believe I can hit the ground running at TechNova. I have designed systems handling 50K TPS and would bring that scale of thinking to your platform.',
  95,
  'Outstanding profile. IIT Bombay M.Tech + 4 years building high-throughput systems. All required skills present — Kafka, AWS, Spring Boot, System Design. Top scorer. Fast-track to interview strongly recommended.',
  NOW() - INTERVAL 18 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='rahul@demo.com'),
  'Interview Completed',
  'While my primary language is Python, I have been actively learning Java Spring Boot for the past year and have completed two personal projects using it. I am a quick learner and strongly motivated to transition into Java-focused backend development.',
  62,
  'Moderate fit. Primary skills are Python/Django — Java experience is self-taught. Shows initiative but may require significant ramp-up time. Consider only if shortlist has capacity.',
  NOW() - INTERVAL 15 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='vikram@demo.com'),
  'Shortlisted',
  'As a 5-year cloud/DevOps engineer with Java automation scripting experience, I want to pivot to backend development at a product company. I have contributed to Java microservices repositories on GitHub and understand the Spring ecosystem well.',
  73,
  'Decent candidate with strong cloud background and Java scripting exposure. Not a pure Java developer but shows eagerness to transition. Worth shortlisting for a technical discussion.',
  NOW() - INTERVAL 14 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='arun@demo.com'),
  'Rejected',
  'I am a 7.5-year Java Full Stack engineer with deep Angular and Spring Boot experience, Oracle DBA skills, and leadership of 8-person teams. While this role targets backend, I believe my breadth adds value and would happily focus 100% on backend.',
  85,
  'Technically very strong (7.5 yrs Java, Oracle, Microservices). CTC expectation (₹28L max) may exceed budget. Full-stack profile may be over-spec for a pure backend role. Rejected after salary discussion.',
  NOW() - INTERVAL 12 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='anita@demo.com'),
  'Withdrawn',
  'I am a frontend developer applying to explore backend opportunities. I have basic Java knowledge from college projects but acknowledge this role needs deeper backend expertise than I currently have.',
  38,
  'Low match. Candidate is a frontend specialist with no professional Java backend experience. Applied against role requirements. Not recommended for this position.',
  NOW() - INTERVAL 10 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='sneha@demo.com'),
  'Applied',
  'I am a full-stack developer with React and Node.js background, currently learning Java Spring Boot. I have strong API design skills and want to specialise in backend engineering at a product company like TechNova.',
  55,
  'Partial match. Strong JavaScript/React skills but limited Java exposure. API and backend architecture concepts understood. Consider for a junior backend role if headcount allows.',
  NOW() - INTERVAL 8 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='Senior Java Backend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='deepa@demo.com'),
  'Applied',
  'I am a fresh graduate with a keen interest in backend development. I have done internship projects using Python Flask and am currently learning Java. I am highly motivated and a fast learner. I would be grateful for an opportunity at TechNova.',
  28,
  'Very low match for a senior Java role. Fresher with Python internship background. No Java experience. Not suitable for this specific opening. May be considered for a future associate programme.',
  NOW() - INTERVAL 5 DAY;

-- ── TechNova: React Frontend Developer  → 2 more applicants ─────────────────
INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='React Frontend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='anita@demo.com'),
  'Shortlisted',
  'React and JavaScript are my primary skills. I have 1.5 years of professional frontend experience building component libraries and consumer-facing UIs. TechNova''s product focus is exactly the kind of environment I want to grow in.',
  78,
  'Good fit for a mid-level frontend role. 1.5 years React, strong JavaScript fundamentals. Shorter on TypeScript and testing. Recommended for shortlisting and technical assessment.',
  NOW() - INTERVAL 7 DAY;

INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='React Frontend Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='sneha@demo.com'),
  'Interview Scheduled',
  'React is my primary framework with 2 years of experience. I have worked on a recruitment portal (similar domain!) and understand the UX needs of both employers and candidates. I am excited to work on a product that directly impacts careers.',
  88,
  'Strong match. 2 years React, Node.js background, and direct domain experience in recruitment software. TypeScript and testing experience present. Recommend fast-track interview.',
  NOW() - INTERVAL 6 DAY;

-- ── TechNova: DevOps / Cloud Engineer  → 1 applicant ────────────────────────
INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@technova.com' AND v.designation='DevOps / Cloud Engineer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='vikram@demo.com'),
  'Selected',
  'AWS, Kubernetes, Terraform, and CI/CD are my daily tools. I have 5 years of cloud engineering experience owning 200+ microservice deployments on AWS EKS. TechNova''s infrastructure challenges excite me greatly.',
  97,
  'Exceptional match. 5 years cloud/DevOps with all required skills (AWS, K8s, Terraform, Docker, CI/CD) at Expert level. Highest AI score for this role. Strongly recommended for immediate selection.',
  NOW() - INTERVAL 9 DAY;

-- ── DataBridge: Data Analyst Fresher  → 1 applicant ─────────────────────────
INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@databridge.com' AND v.designation='Data Analyst – Fresher' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='deepa@demo.com'),
  'Shortlisted',
  'As a 2023 ECE graduate with Python, Pandas, SQL, and Power BI skills, I am eager to build a career in data analytics. The DataBridge trainee programme is exactly what I am looking for — real client work from day one with strong mentorship.',
  72,
  'Reasonable fit for a fresher programme. Python, Pandas, and Power BI skills present. SQL is beginner level — will need training. Positive attitude evident in cover letter. Recommended for shortlisting.',
  NOW() - INTERVAL 4 DAY;

-- ── Infosys BPM: Java Full Stack  → 1 applicant ─────────────────────────────
INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@infosysbpm.com' AND v.designation='Java Full Stack Developer' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='priya@demo.com'),
  'Applied',
  'I have 3.5 years of Java Spring Boot and React development at a startup. I am looking to move to a large enterprise to work at scale. Infosys BPM''s BFSI projects would give me the client-facing and enterprise experience I need for the next step in my career.',
  80,
  'Good candidate. Full-stack experience matches the role. Startup background may need adjustment to enterprise delivery model. Recommend screening call.',
  NOW() - INTERVAL 3 DAY;

-- ── FinServ Capital: Risk Analyst → 1 applicant ──────────────────────────────
INSERT INTO applications (vacancy_id, candidate_id, status, cover_note, ai_score, ai_summary, applied_at)
SELECT
  (SELECT v.vacancy_id FROM vacancies v JOIN employers e ON v.employer_id=e.employer_id
   WHERE e.email='hr@finserv.com' AND v.designation='Risk Analyst – Credit' LIMIT 1),
  (SELECT candidate_id FROM candidates WHERE email='karan@demo.com'),
  'Interview Scheduled',
  'With 6 years in BFSI risk — including 3 years at a leading NBFC — I specialise in retail credit scorecard development, roll-rate analysis, and RBI regulatory reporting. I am excited about FinServ Capital''s growth in the SME lending segment.',
  93,
  'Excellent match. 6 years BFSI risk with direct NBFC experience, all technical skills present (Python, SQL, scorecard modelling). Strong candidate. Recommended for final interview.',
  NOW() - INTERVAL 2 DAY;

-- ─────────────────────────────────────────────────────────────────────────────
-- INTERVIEWS  (for applications with Interview Scheduled / Completed statuses)
-- ─────────────────────────────────────────────────────────────────────────────

-- Amit → TechNova Java Backend (Interview Scheduled)
INSERT INTO interviews
  (application_id, round_number, interview_datetime, mode, venue, interviewer_name, outcome)
SELECT
  (SELECT a.application_id FROM applications a
   JOIN candidates c ON a.candidate_id=c.candidate_id
   JOIN vacancies v ON a.vacancy_id=v.vacancy_id
   JOIN employers e ON v.employer_id=e.employer_id
   WHERE c.email='amit@demo.com' AND e.email='hr@technova.com'
     AND v.designation='Senior Java Backend Developer' LIMIT 1),
  1, NOW() + INTERVAL 3 DAY, 'Online', NULL, 'Arjun Kapoor (CTO)', 'Scheduled';

-- Rahul → TechNova Java Backend (Interview Completed)
INSERT INTO interviews
  (application_id, round_number, interview_datetime, mode, venue, interviewer_name, outcome, remarks)
SELECT
  (SELECT a.application_id FROM applications a
   JOIN candidates c ON a.candidate_id=c.candidate_id
   JOIN vacancies v ON a.vacancy_id=v.vacancy_id
   JOIN employers e ON v.employer_id=e.employer_id
   WHERE c.email='rahul@demo.com' AND e.email='hr@technova.com'
     AND v.designation='Senior Java Backend Developer' LIMIT 1),
  1, NOW() - INTERVAL 2 DAY, 'Online', NULL, 'Arjun Kapoor', 'Completed',
  'Candidate showed interest and Python proficiency but struggled with Java-specific questions. Needs at least 6 more months of Java practice before being interview-ready for a senior role.';

-- Sneha → TechNova React (Interview Scheduled)
INSERT INTO interviews
  (application_id, round_number, interview_datetime, mode, venue, interviewer_name, outcome)
SELECT
  (SELECT a.application_id FROM applications a
   JOIN candidates c ON a.candidate_id=c.candidate_id
   JOIN vacancies v ON a.vacancy_id=v.vacancy_id
   JOIN employers e ON v.employer_id=e.employer_id
   WHERE c.email='sneha@demo.com' AND e.email='hr@technova.com'
     AND v.designation='React Frontend Developer' LIMIT 1),
  1, NOW() + INTERVAL 2 DAY, 'Online', NULL, 'Divya Menon (VP Product)', 'Scheduled';

-- Karan → FinServ Risk Analyst (Interview Scheduled)
INSERT INTO interviews
  (application_id, round_number, interview_datetime, mode, venue, interviewer_name, outcome)
SELECT
  (SELECT a.application_id FROM applications a
   JOIN candidates c ON a.candidate_id=c.candidate_id
   JOIN vacancies v ON a.vacancy_id=v.vacancy_id
   JOIN employers e ON v.employer_id=e.employer_id
   WHERE c.email='karan@demo.com' AND e.email='hr@finserv.com'
     AND v.designation='Risk Analyst – Credit' LIMIT 1),
  1, NOW() + INTERVAL 1 DAY, 'In-Person', '3rd Floor, BKC Tower, Mumbai', 'Ravi Shankar (Head of Risk)', 'Scheduled';

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS  (seed a few so the bell has content on demo day)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications (recipient_email, recipient_type, subject, body, event_type)
VALUES
('priya@demo.com', 'Candidate',
 'Application Submitted — Senior Java Backend Developer',
 'Your application for Senior Java Backend Developer at TechNova Solutions has been submitted successfully.',
 'APPLICATION_SUBMITTED'),

('priya@demo.com', 'Candidate',
 'You have been Selected — Senior Java Backend Developer',
 'Dear Priya Sharma, congratulations! You have been selected for Senior Java Backend Developer at TechNova Solutions. The employer will reach out with next steps.',
 'STATUS_CHANGED'),

('amit@demo.com', 'Candidate',
 'Interview Scheduled — Senior Java Backend Developer',
 'Dear Amit Kulkarni, your interview for Senior Java Backend Developer at TechNova Solutions has been scheduled. Please check your application for details.',
 'STATUS_CHANGED'),

('hr@technova.com', 'Employer',
 'New Application — Senior Java Backend Developer',
 'Deepa Krishnan has applied for the position of Senior Java Backend Developer.',
 'APPLICATION_SUBMITTED'),

('hr@technova.com', 'Employer',
 'Application Withdrawn — Senior Java Backend Developer',
 'Anita Rao has withdrawn their application for the position of Senior Java Backend Developer.',
 'APPLICATION_WITHDRAWN'),

('vikram@demo.com', 'Candidate',
 'You have been Selected — DevOps / Cloud Engineer',
 'Dear Vikram Singh, congratulations! You have been selected for DevOps / Cloud Engineer at TechNova Solutions.',
 'STATUS_CHANGED'),

('karan@demo.com', 'Candidate',
 'Interview Scheduled — Risk Analyst – Credit',
 'Dear Karan Desai, your interview for Risk Analyst – Credit at FinServ Capital has been scheduled for tomorrow at their BKC office.',
 'STATUS_CHANGED');

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY (quick sanity check)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'employers'   AS tbl, COUNT(*) AS cnt FROM employers   UNION ALL
SELECT 'candidates',          COUNT(*)        FROM candidates   UNION ALL
SELECT 'vacancies',           COUNT(*)        FROM vacancies    UNION ALL
SELECT 'applications',        COUNT(*)        FROM applications UNION ALL
SELECT 'interviews',          COUNT(*)        FROM interviews   UNION ALL
SELECT 'notifications',       COUNT(*)        FROM notifications;
