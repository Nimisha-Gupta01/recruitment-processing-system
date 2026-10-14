# Software Requirements Specification (SRS)
## Online Recruitment Processing System

**Version:** 1.0
**Date:** October 2026
**Course:** Full Stack Application Development (FSAD)
**Team:** 2 Members | MTECH – BITS Pilani

---

## Table of Contents
1. Introduction
2. Overall Description
3. Functional Requirements
4. Non-Functional Requirements
5. System Architecture
6. Module Descriptions
7. Use Cases
8. Database Overview
9. Tech Stack

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Online Recruitment Processing System** — a web application that automates recruitment operations for HR departments and enables candidates to search and apply for jobs online.

### 1.2 Scope
The system serves two primary user types:
- **Employers** — register organizations, post vacancies, search candidates, schedule interviews, and update hiring outcomes.
- **Candidates** — register profiles, set preferences, search jobs, apply, and track application status.

The system covers the full recruitment lifecycle: vacancy posting → candidate application → employer search & filter → interview scheduling → selection/rejection → notification.

### 1.3 Definitions
| Term | Definition |
|------|------------|
| Employer | An HR representative of an organization using the system to hire |
| Candidate | A job seeker registering and applying through the system |
| Vacancy | A job opening posted by an employer |
| Application | A candidate's submission for a specific vacancy |
| Interview | A scheduled meeting between employer and candidate |

### 1.4 References
- Assignment Specification: KT_RecruitmentProcessing System_009
- Spring Boot 3.x Documentation
- React 18 Documentation
- MySQL 8.0 Reference Manual

---

## 2. Overall Description

### 2.1 Product Perspective
The system is a standalone web application with a REST API backend and a React-based single-page application (SPA) frontend. It interacts with a MySQL relational database and an external SMTP server for email notifications.

### 2.2 Product Functions (Summary)
- Organization and employer registration
- Job vacancy management
- Candidate profile and preferences management
- Preference-based and merit-based job/candidate matching
- Interview scheduling and outcome tracking
- Email notifications
- Reports for both employers and candidates

### 2.3 User Classes
| User Class | Description |
|------------|-------------|
| Employer | Registers org, posts jobs, searches candidates, schedules interviews |
| Candidate | Registers profile, applies for jobs, tracks status |
| Admin | (Future scope) System administration |

### 2.4 Assumptions and Constraints
- The system requires internet connectivity.
- Email notifications require a valid SMTP configuration.
- Only one employer account per organization (v1 scope).
- Candidates must register before applying.

---

## 3. Functional Requirements

### 3.1 Registration & Login Module

**FR-1.1** The system shall allow employers to register with the following details:
- Organization Name, Established Year, Number of Employees, Annual Turnover
- Contact Person Name, Email, Phone, Password

**FR-1.2** The system shall allow candidates to register with:
- Full Name, Email, Phone, Password, Date of Birth, Gender

**FR-1.3** The system shall support role-based login (Employer / Candidate).

**FR-1.4** The system shall validate credentials and return a JWT token on successful login.

**FR-1.5** The system shall reject duplicate email registrations.

---

### 3.2 Employer — Vacancy Management

**FR-2.1** Employers shall be able to post job vacancies with:
- Designation, Department, Job Description
- Required Qualification, Required Experience
- Salary Range (Min / Max)
- Employment Type (Permanent / Temporary / Contract)
- Number of Openings, Application Deadline, Location

**FR-2.2** Employers shall be able to edit or close vacancies.

**FR-2.3** Employers shall be able to view all vacancies posted by their organization.

---

### 3.3 Candidate Search & Scan Module (Employer-side)

**FR-3.1** Employers shall be able to search candidates filtered by:
- Job Preference (Designation / Domain)
- Location Preference
- Salary Expectation
- Qualification
- Merit (Academic Score / GPA)

**FR-3.2** The system shall display a ranked list of matching candidates.

**FR-3.3** Employers shall be able to view a candidate's full profile.

---

### 3.4 Candidate — Profile & Preferences Module

**FR-4.1** Candidates shall be able to fill in their profile:
- Personal Details: Name, DOB, Gender, Address, Phone, Email
- Academic Details: Degree, Institution, Year of Passing, Percentage/GPA
- Work Experience: Company, Role, Duration (optional for freshers)
- Skills: List of skills

**FR-4.2** Candidates shall be able to specify preferences:
- Preferred Job Role / Designation
- Preferred Location(s) (multi-select)
- Expected Salary Range

---

### 3.5 Job Search Module (Candidate-side)

**FR-5.1** Candidates shall be able to view all open vacancies.

**FR-5.2** Candidates shall be able to filter vacancies by:
- Location, Salary Range, Job Type, Qualification Required

**FR-5.3** Candidates shall be able to apply for a vacancy with one click (profile is auto-submitted).

**FR-5.4** Candidates shall not be able to apply for the same vacancy twice.

**FR-5.5** Candidates shall see vacancies matching their preferences highlighted or ranked.

---

### 3.6 Interview Scheduling & Details Module

**FR-6.1** Employers shall be able to schedule an interview for a candidate who applied.

**FR-6.2** Interview details shall include:
- Interview Date & Time, Mode (In-person / Online), Venue / Meeting Link
- Round Number, Interviewer Name

**FR-6.3** The system shall notify the candidate via email when an interview is scheduled.

**FR-6.4** Employers shall be able to update the interview outcome:
- Status options: Scheduled / Completed / Cancelled / Selected / Offered / Recruited / Rejected

**FR-6.5** Application status shall be updated automatically based on interview outcome.

---

### 3.7 Reports Module

**FR-7.1** Employers shall be able to generate reports:
- All vacancies with number of applicants
- Interview schedule for a date range
- Candidates selected / rejected per vacancy

**FR-7.2** Candidates shall be able to view:
- All applications submitted with current status
- Interview history

---

### 3.8 Email Notification Module

**FR-8.1** The system shall send emails to candidates for:
- Successful registration
- Interview scheduled (with details)
- Application status change (Selected / Rejected / Offered / Recruited)

**FR-8.2** The system shall send emails to employers for:
- Successful registration
- New application received for a posted vacancy

---

## 4. Non-Functional Requirements

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-1 | Performance | API response time < 2 seconds for all standard operations |
| NFR-2 | Security | Passwords stored as bcrypt hashes; JWT-based stateless auth |
| NFR-3 | Scalability | Stateless backend supports horizontal scaling |
| NFR-4 | Usability | Responsive UI works on desktop and tablet |
| NFR-5 | Reliability | System uptime target: 99% during business hours |
| NFR-6 | Maintainability | RESTful API with clear endpoint naming; modular React components |
| NFR-7 | Data Integrity | Foreign key constraints enforced at DB level |
| NFR-8 | Compatibility | Supports Chrome, Firefox, Edge (latest 2 versions) |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│              ReactJS SPA  (Port 3000)                        │
│    [ Registration ] [ Job Search ] [ Dashboard ] [ Reports ] │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JSON)
┌──────────────────────────▼──────────────────────────────────┐
│                     APPLICATION LAYER                         │
│            Spring Boot 3 REST API  (Port 8080)               │
│  [ Auth Controller ] [ Vacancy Controller ] [ Application ]  │
│  [ Interview Controller ] [ Report Controller ]              │
│  [ Spring Security + JWT ]  [ Spring Data JPA / Hibernate ]  │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC
┌──────────────────────────▼──────────────────────────────────┐
│                       DATA LAYER                              │
│                  MySQL 8.0 Database                          │
│  [ employers ] [ candidates ] [ vacancies ] [ applications ] │
│  [ interviews ] [ candidate_skills ] [ notifications ]       │
└─────────────────────────────────────────────────────────────┘
                           │ SMTP
┌──────────────────────────▼──────────────────────────────────┐
│               EXTERNAL SERVICE                               │
│           Email Server (JavaMail / SMTP)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Module Descriptions

| Module | Backend Package | React Component(s) |
|--------|-----------------|--------------------|
| Registration & Login | `auth` | `Register.jsx`, `Login.jsx` |
| Employer Dashboard | `employer` | `EmployerDashboard.jsx` |
| Vacancy Management | `vacancy` | `PostJob.jsx`, `MyVacancies.jsx` |
| Candidate Search | `candidate` | `CandidateSearch.jsx` |
| Interview Scheduling | `interview` | `ScheduleInterview.jsx` |
| Candidate Profile | `candidate` | `Profile.jsx`, `Preferences.jsx` |
| Job Search & Apply | `job` | `JobList.jsx`, `JobDetail.jsx` |
| Application Status | `application` | `MyApplications.jsx` |
| Reports | `report` | `EmployerReport.jsx`, `CandidateReport.jsx` |
| Email | `notification` | — (backend only) |

---

## 7. Use Cases

### UC-01: Employer Posts a Vacancy
- **Actor:** Employer
- **Precondition:** Employer is logged in
- **Flow:** Employer fills vacancy form → submits → system saves and sets status to "Open"
- **Postcondition:** Vacancy is visible to candidates

### UC-02: Candidate Applies for a Job
- **Actor:** Candidate
- **Precondition:** Candidate is logged in and has a complete profile
- **Flow:** Candidate searches jobs → views vacancy → clicks Apply → system creates application record
- **Postcondition:** Application appears in employer's applicant list; candidate sees "Applied" status

### UC-03: Employer Schedules Interview
- **Actor:** Employer
- **Precondition:** Candidate has applied; employer is logged in
- **Flow:** Employer opens applicant → clicks Schedule Interview → fills interview details → submits
- **Postcondition:** Interview record created; email sent to candidate; application status → "Interview Scheduled"

### UC-04: Employer Updates Interview Outcome
- **Actor:** Employer
- **Precondition:** Interview is in "Scheduled" state
- **Flow:** Employer opens interview → sets outcome (Selected / Rejected / etc.) → saves
- **Postcondition:** Application status updated; email notification sent to candidate

### UC-05: Candidate Views Application Status
- **Actor:** Candidate
- **Precondition:** Candidate is logged in
- **Flow:** Candidate opens "My Applications" → views list with current status per application
- **Postcondition:** Candidate is informed of latest status

---

## 8. Database Overview

### Core Entities
- `employers` — organization + HR contact details
- `candidates` — personal + academic + experience details
- `vacancies` — job postings by employer
- `applications` — candidate ↔ vacancy link with status
- `interviews` — scheduled interviews linked to application
- `candidate_preferences` — location / role / salary preferences
- `candidate_skills` — skills tagged to candidates
- `notifications` — email log

*(Full DDL schema in `docs/db-schema.sql`)*

---

## 9. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | ReactJS | 18.x |
| UI Components | Material UI or TailwindCSS | Latest |
| Backend | Spring Boot | 3.x |
| REST | Spring MVC | (bundled) |
| ORM | Spring Data JPA + Hibernate | (bundled) |
| Database | MySQL | 8.0 |
| Auth | Spring Security + JWT | (bundled) |
| Email | Spring Mail (JavaMail) | (bundled) |
| Build | Maven | 3.x |
| Frontend Build | Vite + npm | Latest |

---

*End of SRS Document v1.0*
