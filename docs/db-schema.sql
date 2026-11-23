-- ============================================================
-- Online Recruitment Processing System
-- Database Schema — MySQL 8.0
-- Re-runnable: safe to run multiple times (drops and recreates)
-- Usage: mysql -u root -p < docs/db-schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS recruitment_db;
USE recruitment_db;

-- Drop in reverse FK order
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS vacancies;
DROP TABLE IF EXISTS candidate_role_prefs;
DROP TABLE IF EXISTS candidate_location_prefs;
DROP TABLE IF EXISTS candidate_skills;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS employers;

-- ------------------------------------------------------------
-- 1. EMPLOYERS
-- ------------------------------------------------------------
CREATE TABLE employers (
    employer_id     INT AUTO_INCREMENT PRIMARY KEY,
    org_name        VARCHAR(150)    NOT NULL,
    established_yr  INT,
    num_employees   INT,
    annual_turnover DECIMAL(15,2),
    contact_name    VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    phone           VARCHAR(15),
    password_hash   VARCHAR(255)    NOT NULL,
    address         VARCHAR(255),
    website         VARCHAR(150),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN         DEFAULT TRUE
);

-- ------------------------------------------------------------
-- 2. CANDIDATES
-- ------------------------------------------------------------
CREATE TABLE candidates (
    candidate_id    INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    phone           VARCHAR(15),
    password_hash   VARCHAR(255)    NOT NULL,
    dob             DATE,
    gender          ENUM('Male','Female','Other'),
    address         VARCHAR(255),
    -- Academic details
    degree          VARCHAR(100),
    institution     VARCHAR(150),
    year_of_passing INT,
    percentage      DECIMAL(5,2),               -- e.g. 85.50
    -- Experience
    total_exp_yrs   DECIMAL(4,1)    DEFAULT 0,
    -- Preferences (salary)
    expected_sal_min DECIMAL(12,2),
    expected_sal_max DECIMAL(12,2),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN         DEFAULT TRUE,
    role            VARCHAR(20)     NOT NULL DEFAULT 'CANDIDATE'
);

-- ------------------------------------------------------------
-- 3. CANDIDATE SKILLS
-- ------------------------------------------------------------
CREATE TABLE candidate_skills (
    skill_id        INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id    INT             NOT NULL,
    skill_name      VARCHAR(80)     NOT NULL,
    proficiency     ENUM('Beginner','Intermediate','Expert') DEFAULT 'Intermediate',
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. CANDIDATE LOCATION PREFERENCES
-- ------------------------------------------------------------
CREATE TABLE candidate_location_prefs (
    pref_id         INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id    INT             NOT NULL,
    location        VARCHAR(100)    NOT NULL,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. CANDIDATE JOB ROLE PREFERENCES
-- ------------------------------------------------------------
CREATE TABLE candidate_role_prefs (
    pref_id         INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id    INT             NOT NULL,
    preferred_role  VARCHAR(100)    NOT NULL,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 6. VACANCIES
-- ------------------------------------------------------------
CREATE TABLE vacancies (
    vacancy_id          INT AUTO_INCREMENT PRIMARY KEY,
    employer_id         INT             NOT NULL,
    designation         VARCHAR(100)    NOT NULL,
    department          VARCHAR(100),
    job_description     TEXT,
    required_qual       VARCHAR(150),   -- e.g. B.E / B.Tech / MCA
    required_exp_yrs    DECIMAL(4,1)    DEFAULT 0,
    salary_min          DECIMAL(12,2),
    salary_max          DECIMAL(12,2),
    employment_type     ENUM('Permanent','Temporary','Contract') NOT NULL,
    num_openings        INT             DEFAULT 1,
    location            VARCHAR(100),
    application_deadline DATE,
    status              ENUM('Open','Closed','On_Hold') DEFAULT 'Open',
    posted_at           DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(employer_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 7. APPLICATIONS
-- ------------------------------------------------------------
CREATE TABLE applications (
    application_id  INT AUTO_INCREMENT PRIMARY KEY,
    vacancy_id      INT             NOT NULL,
    candidate_id    INT             NOT NULL,
    applied_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    status          ENUM(
                        'Applied',
                        'Shortlisted',
                        'Interview Scheduled',
                        'Interview Completed',
                        'Selected',
                        'Offered',
                        'Recruited',
                        'Rejected',
                        'Withdrawn'
                    ) DEFAULT 'Applied',
    cover_note      TEXT,
    resume_path     VARCHAR(500),
    UNIQUE KEY uq_application (vacancy_id, candidate_id),
    FOREIGN KEY (vacancy_id)    REFERENCES vacancies(vacancy_id)   ON DELETE CASCADE,
    FOREIGN KEY (candidate_id)  REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 8. INTERVIEWS
-- ------------------------------------------------------------
CREATE TABLE interviews (
    interview_id        INT AUTO_INCREMENT PRIMARY KEY,
    application_id      INT             NOT NULL,
    round_number        INT             DEFAULT 1,
    interview_datetime  DATETIME        NOT NULL,
    mode                ENUM('In-Person','Online','Telephonic') DEFAULT 'In-Person',
    venue               VARCHAR(200),           -- address or meeting link
    interviewer_name    VARCHAR(100),
    outcome             ENUM(
                            'Scheduled',
                            'Completed',
                            'Cancelled',
                            'Selected',
                            'Rejected'
                        ) DEFAULT 'Scheduled',
    remarks             TEXT,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 9. NOTIFICATIONS (email log)
-- ------------------------------------------------------------
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(150)    NOT NULL,
    recipient_type  ENUM('Candidate','Employer'),
    subject         VARCHAR(255),
    body            TEXT,
    event_type      VARCHAR(80),    -- e.g. INTERVIEW_SCHEDULED, STATUS_CHANGED
    sent_at         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('Sent','Failed') DEFAULT 'Sent'
);

-- ------------------------------------------------------------
-- 10. REPORTS (candidates report employers, employers report candidates)
-- ------------------------------------------------------------
CREATE TABLE reports (
    report_id       INT AUTO_INCREMENT PRIMARY KEY,
    reporter_type   ENUM('CANDIDATE','EMPLOYER') NOT NULL,
    reporter_id     INT                          NOT NULL,
    reported_type   ENUM('CANDIDATE','EMPLOYER') NOT NULL,
    reported_id     INT                          NOT NULL,
    reason          TEXT                         NOT NULL,
    created_at      DATETIME                     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_reported (reported_type, reported_id)
);



-- Candidate searches by employers
CREATE INDEX idx_candidates_degree       ON candidates(degree);
CREATE INDEX idx_candidates_percentage   ON candidates(percentage);
CREATE INDEX idx_candidates_exp          ON candidates(total_exp_yrs);

-- Job search by candidates
CREATE INDEX idx_vacancies_location      ON vacancies(location);
CREATE INDEX idx_vacancies_salary        ON vacancies(salary_min, salary_max);
CREATE INDEX idx_vacancies_status        ON vacancies(status);
CREATE INDEX idx_vacancies_employer      ON vacancies(employer_id);

-- Application lookups
CREATE INDEX idx_applications_candidate  ON applications(candidate_id);
CREATE INDEX idx_applications_status     ON applications(status);

-- Interview lookups
CREATE INDEX idx_interviews_datetime     ON interviews(interview_datetime);

-- ============================================================
-- SAMPLE DATA (for prototype testing)
-- ============================================================

-- ============================================================
-- SAMPLE DATA (for prototype testing)
-- Passwords below are bcrypt of: Test@1234
-- Register via API to get real hashes, or use these test accounts
-- ============================================================

-- Employer (password: Test@1234)
INSERT INTO employers (org_name, established_yr, num_employees, annual_turnover, contact_name, email, phone, password_hash)
VALUES ('TechCorp Solutions', 2010, 500, 50000000.00, 'Rajesh Kumar', 'hr@techcorp.com', '9876543210',
        '$2b$10$YFQZgWq6OuHQBvlY25izheD5z6wVe4UOk0ZnvzOHwvUdisI5OO8GK');

-- Candidate (password: Test@1234)
INSERT INTO candidates (full_name, email, phone, password_hash, dob, gender, degree, institution, year_of_passing, percentage, total_exp_yrs, expected_sal_min, expected_sal_max)
VALUES ('Priya Sharma', 'priya@example.com', '9123456780',
        '$2b$10$YFQZgWq6OuHQBvlY25izheD5z6wVe4UOk0ZnvzOHwvUdisI5OO8GK',
        '1998-05-12', 'Female', 'B.Tech CSE', 'NIT Warangal', 2020, 82.50, 3.0, 600000, 1000000);

-- Vacancy
INSERT INTO vacancies (employer_id, designation, department, job_description, required_qual, required_exp_yrs, salary_min, salary_max, employment_type, num_openings, location, application_deadline)
VALUES (1, 'Software Engineer', 'Engineering', 'Develop and maintain web applications using Java and React.',
        'B.E / B.Tech', 1.0, 600000, 1200000, 'Permanent', 3, 'Bangalore', '2026-11-30');
