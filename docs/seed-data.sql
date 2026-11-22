-- seed-data.sql
-- Run: mysql -u root recruitment_db < docs/seed-data.sql
-- Safe to re-run: uses INSERT IGNORE

USE recruitment_db;

-- Employer 2
INSERT IGNORE INTO employers (org_name, contact_name, email, phone, password_hash)
VALUES ('Infosys Ltd', 'Meera Nair', 'hr@infosys.com', '9876500001',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Candidates (candidate_id=1 already exists from db-schema.sql)
INSERT IGNORE INTO candidates (full_name, email, phone, password_hash, dob, gender, degree, institution, year_of_passing, percentage, total_exp_yrs, expected_sal_min, expected_sal_max)
VALUES
  ('Rahul Mehta',  'rahul@example.com', '9123456781',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '1997-08-20', 'Male', 'MCA', 'BITS Pilani', 2021, 78.00, 2.0, 500000, 900000),
  ('Anita Rao',    'anita@example.com',  '9123456782',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '1999-03-15', 'Female', 'B.Sc CS', 'Osmania University', 2022, 85.20, 1.5, 400000, 700000);

-- Skills for Priya (candidate_id=1)
INSERT IGNORE INTO candidate_skills (candidate_id, skill_name, proficiency) VALUES
  (1, 'Java', 'Expert'),
  (1, 'React', 'Intermediate'),
  (1, 'MySQL', 'Intermediate');

-- Location prefs for Priya
INSERT IGNORE INTO candidate_location_prefs (candidate_id, location) VALUES
  (1, 'Bangalore'), (1, 'Hyderabad');

-- Role prefs for Priya
INSERT IGNORE INTO candidate_role_prefs (candidate_id, preferred_role) VALUES
  (1, 'Software Engineer');

-- Skills for Rahul (dynamically resolved candidate_id — use subquery or hardcode after checking)
INSERT IGNORE INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT candidate_id, 'Python', 'Intermediate' FROM candidates WHERE email='rahul@example.com';
INSERT IGNORE INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT candidate_id, 'Django', 'Beginner' FROM candidates WHERE email='rahul@example.com';

INSERT IGNORE INTO candidate_location_prefs (candidate_id, location)
SELECT candidate_id, 'Mumbai' FROM candidates WHERE email='rahul@example.com';
INSERT IGNORE INTO candidate_location_prefs (candidate_id, location)
SELECT candidate_id, 'Pune' FROM candidates WHERE email='rahul@example.com';

INSERT IGNORE INTO candidate_role_prefs (candidate_id, preferred_role)
SELECT candidate_id, 'Backend Developer' FROM candidates WHERE email='rahul@example.com';

-- Skills for Anita
INSERT IGNORE INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT candidate_id, 'JavaScript', 'Intermediate' FROM candidates WHERE email='anita@example.com';
INSERT IGNORE INTO candidate_skills (candidate_id, skill_name, proficiency)
SELECT candidate_id, 'React', 'Beginner' FROM candidates WHERE email='anita@example.com';

INSERT IGNORE INTO candidate_location_prefs (candidate_id, location)
SELECT candidate_id, 'Hyderabad' FROM candidates WHERE email='anita@example.com';

INSERT IGNORE INTO candidate_role_prefs (candidate_id, preferred_role)
SELECT candidate_id, 'Frontend Developer' FROM candidates WHERE email='anita@example.com';

-- Vacancies (employer_id=1 is TechCorp from db-schema.sql, vacancy_id=1 already exists)
INSERT IGNORE INTO vacancies (employer_id, designation, department, job_description, required_qual, required_exp_yrs, salary_min, salary_max, employment_type, num_openings, location, application_deadline)
VALUES
  (1, 'React Developer', 'Engineering', 'Build responsive UIs using React 18 and Bootstrap.',
   'B.E / B.Tech / MCA', 0.5, 500000, 900000, 'Permanent', 2, 'Bangalore', '2026-12-15'),
  (1, 'Data Analyst', 'Analytics', 'Analyse recruitment data and generate reports.',
   'B.Sc / B.Tech', 1.0, 400000, 800000, 'Contract', 1, 'Hyderabad', '2026-12-20');

-- Applications (Priya applies to vacancy 1, Rahul applies to vacancy 2)
INSERT IGNORE INTO applications (vacancy_id, candidate_id, status, cover_note)
SELECT 1, c.candidate_id, 'Applied', 'I have 3 years Java experience and would be a great fit.'
FROM candidates c WHERE c.email='priya@example.com';

INSERT IGNORE INTO applications (vacancy_id, candidate_id, status, cover_note)
SELECT 2, c.candidate_id, 'Applied', 'I am keen to work in analytics and have strong Python skills.'
FROM candidates c WHERE c.email='rahul@example.com';
