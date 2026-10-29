# Vacancy Management + Candidate Profile & Preferences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Module 2 (Vacancy Management) and Module 4 (Candidate Profile & Preferences) as fully working backend REST APIs + React frontend, end-to-end verified and aligned with teammate's existing Module 1 (Auth) code.

**Architecture:** Same layered pattern as Module 1 — Entity → Repository → DTOs → Service → Controller, secured by existing JWT filter. Employer routes go under `/api/employer/**` (already guarded by `ROLE_EMPLOYER`), candidate routes under `/api/candidate/**` (already guarded by `ROLE_CANDIDATE`). Frontend is a React 18 SPA with Vite, Tailwind CSS, React Router, and an Axios wrapper that attaches the JWT from localStorage.

**Tech Stack:** Spring Boot 3.3.4, Spring Data JPA, MySQL 8, jjwt 0.12.6, Lombok, Java 21, React 18, Vite, Tailwind CSS, React Router v6, Axios

---

## File Map

### Backend — new files to create
| File | Responsibility |
|------|----------------|
| `backend/src/main/java/com/recruitment/entity/Vacancy.java` | JPA entity for `vacancies` table |
| `backend/src/main/java/com/recruitment/repository/VacancyRepository.java` | Spring Data repo for vacancies |
| `backend/src/main/java/com/recruitment/dto/VacancyDTOs.java` | Request + Response DTOs for vacancy operations |
| `backend/src/main/java/com/recruitment/service/VacancyService.java` | Business logic: create, update, close, list vacancies |
| `backend/src/main/java/com/recruitment/controller/VacancyController.java` | REST endpoints under `/api/employer/vacancies` |
| `backend/src/main/java/com/recruitment/dto/CandidateDTOs.java` | Request + Response DTOs for candidate profile |
| `backend/src/main/java/com/recruitment/repository/CandidateSkillRepository.java` | Repo for candidate_skills (needed for replace-on-update) |
| `backend/src/main/java/com/recruitment/repository/CandidateLocationPrefRepository.java` | Repo for candidate_location_prefs |
| `backend/src/main/java/com/recruitment/repository/CandidateRolePrefRepository.java` | Repo for candidate_role_prefs |
| `backend/src/main/java/com/recruitment/service/CandidateService.java` | Business logic: get + update candidate profile with skills/prefs |
| `backend/src/main/java/com/recruitment/controller/CandidateController.java` | REST endpoints under `/api/candidate/profile` |

### Backend — existing files to modify
| File | Change |
|------|--------|
| `backend/src/main/java/com/recruitment/repository/CandidateRepository.java` | Add `findByEmail(String email)` if not present |

### Frontend — new files to create
| File | Responsibility |
|------|----------------|
| `frontend/package.json` | Vite + React + TailwindCSS + React Router + Axios deps |
| `frontend/vite.config.js` | Vite config with proxy to backend port 8080 |
| `frontend/tailwind.config.js` | Tailwind config |
| `frontend/postcss.config.js` | PostCSS config for Tailwind |
| `frontend/index.html` | Vite entry HTML |
| `frontend/src/main.jsx` | React entry point with Router |
| `frontend/src/App.jsx` | Route definitions |
| `frontend/src/context/AuthContext.jsx` | JWT token storage + current user context |
| `frontend/src/api/api.js` | Axios instance with base URL + Authorization header |
| `frontend/src/pages/Login.jsx` | Login page (calls existing `/api/auth/login`) |
| `frontend/src/pages/employer/PostJob.jsx` | Form to create a new vacancy |
| `frontend/src/pages/employer/MyVacancies.jsx` | List employer's vacancies with edit/close actions |
| `frontend/src/pages/employer/EditVacancy.jsx` | Edit an existing vacancy |
| `frontend/src/pages/candidate/Profile.jsx` | Candidate profile form |
| `frontend/src/pages/candidate/MyApplications.jsx` | Placeholder page (owned by teammate's Module 5, but route needed) |

---

## Task 0: Fix DB Schema — Vacancy Status Enum

**Files:**
- Modify: `docs/db-schema.sql`

The DB schema has `ENUM('Open','Closed','On Hold')` but Java enums cannot contain spaces. We align both to use `On_Hold`.

- [ ] **Step 1: Update db-schema.sql**

In `docs/db-schema.sql`, find the `vacancies` table definition and change:

```sql
status  ENUM('Open','Closed','On Hold') DEFAULT 'Open',
```

to:

```sql
status  ENUM('Open','Closed','On_Hold') DEFAULT 'Open',
```

- [ ] **Step 2: Re-run schema (WARNING: drops and recreates all tables + sample data)**

```bash
mysql -u root < "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/docs/db-schema.sql"
```

Expected: no errors. All tables recreated cleanly.

- [ ] **Step 3: Commit schema fix**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git add docs/db-schema.sql
git commit -m "fix(schema): align vacancy status enum On_Hold to match Java enum naming"
```

---

## Task 1: Vacancy Entity + Repository

**Files:**
- Create: `backend/src/main/java/com/recruitment/entity/Vacancy.java`
- Create: `backend/src/main/java/com/recruitment/repository/VacancyRepository.java`

- [ ] **Step 1: Create Vacancy entity**

Create `backend/src/main/java/com/recruitment/entity/Vacancy.java`:

```java
package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "vacancies")
public class Vacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vacancyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @Column(nullable = false, length = 100)
    private String designation;

    @Column(length = 100)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(length = 150)
    private String requiredQual;

    private BigDecimal requiredExpYrs = BigDecimal.ZERO;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    private Integer numOpenings = 1;

    @Column(length = 100)
    private String location;

    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    private VacancyStatus status = VacancyStatus.Open;

    @Column(updatable = false)
    private LocalDateTime postedAt = LocalDateTime.now();

    public enum EmploymentType { Permanent, Temporary, Contract }
    public enum VacancyStatus { Open, Closed, On_Hold }
}
```

- [ ] **Step 2: Create VacancyRepository**

Create `backend/src/main/java/com/recruitment/repository/VacancyRepository.java`:

```java
package com.recruitment.repository;

import com.recruitment.entity.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    List<Vacancy> findByEmployer_EmployerIdOrderByPostedAtDesc(Integer employerId);
}
```

- [ ] **Step 3: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS` with zero errors.

---

## Task 2: Vacancy DTOs

**Files:**
- Create: `backend/src/main/java/com/recruitment/dto/VacancyDTOs.java`

- [ ] **Step 1: Create VacancyDTOs**

Create `backend/src/main/java/com/recruitment/dto/VacancyDTOs.java`:

```java
package com.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VacancyDTOs {

    @Data
    public static class VacancyCreateRequest {
        @NotBlank
        private String designation;
        private String department;
        private String jobDescription;
        private String requiredQual;
        private BigDecimal requiredExpYrs;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        @NotNull
        private String employmentType;   // Permanent / Temporary / Contract
        private Integer numOpenings;
        private String location;
        private String applicationDeadline; // "YYYY-MM-DD"
    }

    @Data
    public static class VacancyUpdateRequest {
        private String designation;
        private String department;
        private String jobDescription;
        private String requiredQual;
        private BigDecimal requiredExpYrs;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String employmentType;
        private Integer numOpenings;
        private String location;
        private String applicationDeadline;
        private String status;  // Open / Closed / On_Hold
    }

    @Data
    public static class VacancyResponse {
        private Integer vacancyId;
        private Integer employerId;
        private String orgName;
        private String designation;
        private String department;
        private String jobDescription;
        private String requiredQual;
        private BigDecimal requiredExpYrs;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String employmentType;
        private Integer numOpenings;
        private String location;
        private LocalDate applicationDeadline;
        private String status;
        private LocalDateTime postedAt;

        public VacancyResponse(com.recruitment.entity.Vacancy v) {
            this.vacancyId = v.getVacancyId();
            this.employerId = v.getEmployer().getEmployerId();
            this.orgName = v.getEmployer().getOrgName();
            this.designation = v.getDesignation();
            this.department = v.getDepartment();
            this.jobDescription = v.getJobDescription();
            this.requiredQual = v.getRequiredQual();
            this.requiredExpYrs = v.getRequiredExpYrs();
            this.salaryMin = v.getSalaryMin();
            this.salaryMax = v.getSalaryMax();
            this.employmentType = v.getEmploymentType() != null ? v.getEmploymentType().name() : null;
            this.numOpenings = v.getNumOpenings();
            this.location = v.getLocation();
            this.applicationDeadline = v.getApplicationDeadline();
            this.status = v.getStatus() != null ? v.getStatus().name() : null;
            this.postedAt = v.getPostedAt();
        }
    }
}
```

- [ ] **Step 2: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

---

## Task 3: VacancyService

**Files:**
- Create: `backend/src/main/java/com/recruitment/service/VacancyService.java`

- [ ] **Step 1: Create VacancyService**

Create `backend/src/main/java/com/recruitment/service/VacancyService.java`:

```java
package com.recruitment.service;

import com.recruitment.dto.VacancyDTOs.*;
import com.recruitment.entity.Employer;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.EmployerRepository;
import com.recruitment.repository.VacancyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacancyService {

    private final VacancyRepository vacancyRepo;
    private final EmployerRepository employerRepo;

    public VacancyService(VacancyRepository vacancyRepo, EmployerRepository employerRepo) {
        this.vacancyRepo = vacancyRepo;
        this.employerRepo = employerRepo;
    }

    public VacancyResponse create(String employerEmail, VacancyCreateRequest req) {
        Employer employer = employerRepo.findByEmail(employerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Employer not found"));
        Vacancy v = new Vacancy();
        v.setEmployer(employer);
        v.setDesignation(req.getDesignation());
        v.setDepartment(req.getDepartment());
        v.setJobDescription(req.getJobDescription());
        v.setRequiredQual(req.getRequiredQual());
        if (req.getRequiredExpYrs() != null) v.setRequiredExpYrs(req.getRequiredExpYrs());
        v.setSalaryMin(req.getSalaryMin());
        v.setSalaryMax(req.getSalaryMax());
        v.setEmploymentType(Vacancy.EmploymentType.valueOf(req.getEmploymentType()));
        if (req.getNumOpenings() != null) v.setNumOpenings(req.getNumOpenings());
        v.setLocation(req.getLocation());
        if (req.getApplicationDeadline() != null) v.setApplicationDeadline(LocalDate.parse(req.getApplicationDeadline()));
        return new VacancyResponse(vacancyRepo.save(v));
    }

    public List<VacancyResponse> listByEmployer(String employerEmail) {
        Employer employer = employerRepo.findByEmail(employerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Employer not found"));
        return vacancyRepo.findByEmployer_EmployerIdOrderByPostedAtDesc(employer.getEmployerId())
                .stream().map(VacancyResponse::new).collect(Collectors.toList());
    }

    public VacancyResponse getOne(String employerEmail, Integer vacancyId) {
        Vacancy v = vacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        assertOwner(employerEmail, v);
        return new VacancyResponse(v);
    }

    public VacancyResponse update(String employerEmail, Integer vacancyId, VacancyUpdateRequest req) {
        Vacancy v = vacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        assertOwner(employerEmail, v);
        if (req.getDesignation() != null) v.setDesignation(req.getDesignation());
        if (req.getDepartment() != null) v.setDepartment(req.getDepartment());
        if (req.getJobDescription() != null) v.setJobDescription(req.getJobDescription());
        if (req.getRequiredQual() != null) v.setRequiredQual(req.getRequiredQual());
        if (req.getRequiredExpYrs() != null) v.setRequiredExpYrs(req.getRequiredExpYrs());
        if (req.getSalaryMin() != null) v.setSalaryMin(req.getSalaryMin());
        if (req.getSalaryMax() != null) v.setSalaryMax(req.getSalaryMax());
        if (req.getEmploymentType() != null) v.setEmploymentType(Vacancy.EmploymentType.valueOf(req.getEmploymentType()));
        if (req.getNumOpenings() != null) v.setNumOpenings(req.getNumOpenings());
        if (req.getLocation() != null) v.setLocation(req.getLocation());
        if (req.getApplicationDeadline() != null) v.setApplicationDeadline(LocalDate.parse(req.getApplicationDeadline()));
        if (req.getStatus() != null) v.setStatus(Vacancy.VacancyStatus.valueOf(req.getStatus()));
        return new VacancyResponse(vacancyRepo.save(v));
    }

    public VacancyResponse close(String employerEmail, Integer vacancyId) {
        Vacancy v = vacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        assertOwner(employerEmail, v);
        v.setStatus(Vacancy.VacancyStatus.Closed);
        return new VacancyResponse(vacancyRepo.save(v));
    }

    private void assertOwner(String employerEmail, Vacancy v) {
        if (!v.getEmployer().getEmail().equals(employerEmail)) {
            throw new IllegalArgumentException("Access denied");
        }
    }
}
```

- [ ] **Step 2: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

---

## Task 4: VacancyController

**Files:**
- Create: `backend/src/main/java/com/recruitment/controller/VacancyController.java`

- [ ] **Step 1: Create VacancyController**

Create `backend/src/main/java/com/recruitment/controller/VacancyController.java`:

```java
package com.recruitment.controller;

import com.recruitment.dto.VacancyDTOs.*;
import com.recruitment.service.VacancyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer/vacancies")
public class VacancyController {

    private final VacancyService vacancyService;

    public VacancyController(VacancyService vacancyService) {
        this.vacancyService = vacancyService;
    }

    @PostMapping
    public ResponseEntity<VacancyResponse> create(
            @AuthenticationPrincipal String employerEmail,
            @Valid @RequestBody VacancyCreateRequest req) {
        return ResponseEntity.ok(vacancyService.create(employerEmail, req));
    }

    @GetMapping
    public ResponseEntity<List<VacancyResponse>> list(
            @AuthenticationPrincipal String employerEmail) {
        return ResponseEntity.ok(vacancyService.listByEmployer(employerEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VacancyResponse> getOne(
            @AuthenticationPrincipal String employerEmail,
            @PathVariable Integer id) {
        return ResponseEntity.ok(vacancyService.getOne(employerEmail, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacancyResponse> update(
            @AuthenticationPrincipal String employerEmail,
            @PathVariable Integer id,
            @RequestBody VacancyUpdateRequest req) {
        return ResponseEntity.ok(vacancyService.update(employerEmail, id, req));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<VacancyResponse> close(
            @AuthenticationPrincipal String employerEmail,
            @PathVariable Integer id) {
        return ResponseEntity.ok(vacancyService.close(employerEmail, id));
    }
}
```

- [ ] **Step 2: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 3: Commit Module 2 backend**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git add backend/src/main/java/com/recruitment/entity/Vacancy.java \
        backend/src/main/java/com/recruitment/repository/VacancyRepository.java \
        backend/src/main/java/com/recruitment/dto/VacancyDTOs.java \
        backend/src/main/java/com/recruitment/service/VacancyService.java \
        backend/src/main/java/com/recruitment/controller/VacancyController.java
git commit -m "feat(vacancy): implement Module 2 - Vacancy Management API [v0.3.0]"
```

---

## Task 5: Candidate Profile Repositories

**Files:**
- Create: `backend/src/main/java/com/recruitment/repository/CandidateSkillRepository.java`
- Create: `backend/src/main/java/com/recruitment/repository/CandidateLocationPrefRepository.java`
- Create: `backend/src/main/java/com/recruitment/repository/CandidateRolePrefRepository.java`
- Check/Modify: `backend/src/main/java/com/recruitment/repository/CandidateRepository.java`

- [ ] **Step 1: Create CandidateSkillRepository**

Create `backend/src/main/java/com/recruitment/repository/CandidateSkillRepository.java`:

```java
package com.recruitment.repository;

import com.recruitment.entity.CandidateSkill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Integer> {
    void deleteAllByCandidate_CandidateId(Integer candidateId);
}
```

- [ ] **Step 2: Create CandidateLocationPrefRepository**

Create `backend/src/main/java/com/recruitment/repository/CandidateLocationPrefRepository.java`:

```java
package com.recruitment.repository;

import com.recruitment.entity.CandidateLocationPref;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateLocationPrefRepository extends JpaRepository<CandidateLocationPref, Integer> {
    void deleteAllByCandidate_CandidateId(Integer candidateId);
}
```

- [ ] **Step 3: Create CandidateRolePrefRepository**

Create `backend/src/main/java/com/recruitment/repository/CandidateRolePrefRepository.java`:

```java
package com.recruitment.repository;

import com.recruitment.entity.CandidateRolePref;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRolePrefRepository extends JpaRepository<CandidateRolePref, Integer> {
    void deleteAllByCandidate_CandidateId(Integer candidateId);
}
```

- [ ] **Step 4: Verify CandidateRepository has findByEmail**

Read `backend/src/main/java/com/recruitment/repository/CandidateRepository.java`. If `findByEmail(String email)` is missing, add it:

```java
package com.recruitment.repository;

import com.recruitment.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Integer> {
    boolean existsByEmail(String email);
    Optional<Candidate> findByEmail(String email);
}
```

- [ ] **Step 5: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

---

## Task 6: Candidate Profile DTOs

**Files:**
- Create: `backend/src/main/java/com/recruitment/dto/CandidateDTOs.java`

- [ ] **Step 1: Create CandidateDTOs**

Create `backend/src/main/java/com/recruitment/dto/CandidateDTOs.java`:

```java
package com.recruitment.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class CandidateDTOs {

    @Data
    public static class SkillRequest {
        private String skillName;
        private String proficiency;  // Beginner / Intermediate / Expert
    }

    @Data
    public static class ProfileUpdateRequest {
        private String fullName;
        private String phone;
        private String dob;          // "YYYY-MM-DD"
        private String gender;       // Male / Female / Other
        private String address;
        private String degree;
        private String institution;
        private Integer yearOfPassing;
        private BigDecimal percentage;
        private BigDecimal totalExpYrs;
        private BigDecimal expectedSalMin;
        private BigDecimal expectedSalMax;
        private List<SkillRequest> skills;
        private List<String> locationPrefs;
        private List<String> rolePrefs;
    }

    @Data
    public static class SkillResponse {
        private Integer skillId;
        private String skillName;
        private String proficiency;

        public SkillResponse(com.recruitment.entity.CandidateSkill s) {
            this.skillId = s.getSkillId();
            this.skillName = s.getSkillName();
            this.proficiency = s.getProficiency() != null ? s.getProficiency().name() : null;
        }
    }

    @Data
    public static class ProfileResponse {
        private Integer candidateId;
        private String fullName;
        private String email;
        private String phone;
        private LocalDate dob;
        private String gender;
        private String address;
        private String degree;
        private String institution;
        private Integer yearOfPassing;
        private BigDecimal percentage;
        private BigDecimal totalExpYrs;
        private BigDecimal expectedSalMin;
        private BigDecimal expectedSalMax;
        private LocalDateTime createdAt;
        private List<SkillResponse> skills;
        private List<String> locationPrefs;
        private List<String> rolePrefs;

        public ProfileResponse(com.recruitment.entity.Candidate c) {
            this.candidateId = c.getCandidateId();
            this.fullName = c.getFullName();
            this.email = c.getEmail();
            this.phone = c.getPhone();
            this.dob = c.getDob();
            this.gender = c.getGender() != null ? c.getGender().name() : null;
            this.address = c.getAddress();
            this.degree = c.getDegree();
            this.institution = c.getInstitution();
            this.yearOfPassing = c.getYearOfPassing();
            this.percentage = c.getPercentage();
            this.totalExpYrs = c.getTotalExpYrs();
            this.expectedSalMin = c.getExpectedSalMin();
            this.expectedSalMax = c.getExpectedSalMax();
            this.createdAt = c.getCreatedAt();
            this.skills = c.getSkills() != null
                    ? c.getSkills().stream().map(SkillResponse::new).toList() : List.of();
            this.locationPrefs = c.getLocationPrefs() != null
                    ? c.getLocationPrefs().stream().map(lp -> lp.getLocation()).toList() : List.of();
            this.rolePrefs = c.getRolePrefs() != null
                    ? c.getRolePrefs().stream().map(rp -> rp.getPreferredRole()).toList() : List.of();
        }
    }
}
```

- [ ] **Step 2: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

---

## Task 7: CandidateService + CandidateController

**Files:**
- Create: `backend/src/main/java/com/recruitment/service/CandidateService.java`
- Create: `backend/src/main/java/com/recruitment/controller/CandidateController.java`

- [ ] **Step 1: Create CandidateService**

Create `backend/src/main/java/com/recruitment/service/CandidateService.java`:

```java
package com.recruitment.service;

import com.recruitment.dto.CandidateDTOs.*;
import com.recruitment.entity.Candidate;
import com.recruitment.entity.CandidateLocationPref;
import com.recruitment.entity.CandidateRolePref;
import com.recruitment.entity.CandidateSkill;
import com.recruitment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepo;
    private final CandidateSkillRepository skillRepo;
    private final CandidateLocationPrefRepository locationPrefRepo;
    private final CandidateRolePrefRepository rolePrefRepo;

    public CandidateService(CandidateRepository candidateRepo,
                            CandidateSkillRepository skillRepo,
                            CandidateLocationPrefRepository locationPrefRepo,
                            CandidateRolePrefRepository rolePrefRepo) {
        this.candidateRepo = candidateRepo;
        this.skillRepo = skillRepo;
        this.locationPrefRepo = locationPrefRepo;
        this.rolePrefRepo = rolePrefRepo;
    }

    public ProfileResponse getProfile(String email) {
        Candidate c = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        return new ProfileResponse(c);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, ProfileUpdateRequest req) {
        Candidate c = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        if (req.getFullName() != null) c.setFullName(req.getFullName());
        if (req.getPhone() != null) c.setPhone(req.getPhone());
        if (req.getDob() != null) c.setDob(LocalDate.parse(req.getDob()));
        if (req.getGender() != null) c.setGender(Candidate.Gender.valueOf(req.getGender()));
        if (req.getAddress() != null) c.setAddress(req.getAddress());
        if (req.getDegree() != null) c.setDegree(req.getDegree());
        if (req.getInstitution() != null) c.setInstitution(req.getInstitution());
        if (req.getYearOfPassing() != null) c.setYearOfPassing(req.getYearOfPassing());
        if (req.getPercentage() != null) c.setPercentage(req.getPercentage());
        if (req.getTotalExpYrs() != null) c.setTotalExpYrs(req.getTotalExpYrs());
        if (req.getExpectedSalMin() != null) c.setExpectedSalMin(req.getExpectedSalMin());
        if (req.getExpectedSalMax() != null) c.setExpectedSalMax(req.getExpectedSalMax());
        candidateRepo.save(c);

        if (req.getSkills() != null) {
            skillRepo.deleteAllByCandidate_CandidateId(c.getCandidateId());
            for (SkillRequest sr : req.getSkills()) {
                CandidateSkill skill = new CandidateSkill();
                skill.setCandidate(c);
                skill.setSkillName(sr.getSkillName());
                if (sr.getProficiency() != null) {
                    skill.setProficiency(CandidateSkill.Proficiency.valueOf(sr.getProficiency()));
                }
                skillRepo.save(skill);
            }
        }

        if (req.getLocationPrefs() != null) {
            locationPrefRepo.deleteAllByCandidate_CandidateId(c.getCandidateId());
            for (String loc : req.getLocationPrefs()) {
                CandidateLocationPref pref = new CandidateLocationPref();
                pref.setCandidate(c);
                pref.setLocation(loc);
                locationPrefRepo.save(pref);
            }
        }

        if (req.getRolePrefs() != null) {
            rolePrefRepo.deleteAllByCandidate_CandidateId(c.getCandidateId());
            for (String role : req.getRolePrefs()) {
                CandidateRolePref pref = new CandidateRolePref();
                pref.setCandidate(c);
                pref.setPreferredRole(role);
                rolePrefRepo.save(pref);
            }
        }

        return getProfile(email);
    }
}
```

- [ ] **Step 2: Create CandidateController**

Create `backend/src/main/java/com/recruitment/controller/CandidateController.java`:

```java
package com.recruitment.controller;

import com.recruitment.dto.CandidateDTOs.*;
import com.recruitment.service.CandidateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/profile")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            @AuthenticationPrincipal String candidateEmail) {
        return ResponseEntity.ok(candidateService.getProfile(candidateEmail));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal String candidateEmail,
            @RequestBody ProfileUpdateRequest req) {
        return ResponseEntity.ok(candidateService.updateProfile(candidateEmail, req));
    }
}
```

- [ ] **Step 3: Compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 4: Commit Module 4 backend**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git add backend/src/main/java/com/recruitment/repository/CandidateSkillRepository.java \
        backend/src/main/java/com/recruitment/repository/CandidateLocationPrefRepository.java \
        backend/src/main/java/com/recruitment/repository/CandidateRolePrefRepository.java \
        backend/src/main/java/com/recruitment/repository/CandidateRepository.java \
        backend/src/main/java/com/recruitment/dto/CandidateDTOs.java \
        backend/src/main/java/com/recruitment/service/CandidateService.java \
        backend/src/main/java/com/recruitment/controller/CandidateController.java
git commit -m "feat(candidate): implement Module 4 - Candidate Profile & Preferences API [v0.4.0]"
```

---

## Task 8: End-to-End Backend Verification

This task verifies all API endpoints — both new (Modules 2 & 4) and existing (Module 1) — work together correctly before touching the frontend.

- [ ] **Step 1: Start MySQL and run the app**

```bash
brew services start mysql
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn spring-boot:run
```

Expected: `Started RecruitmentSystemApplication` in the logs. No errors.

- [ ] **Step 2: Register an employer and capture the token**

```bash
EMPLOYER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register/employer \
  -H "Content-Type: application/json" \
  -d '{
    "orgName": "TestCorp",
    "contactName": "Alice HR",
    "email": "alice@testcorp.com",
    "password": "Test@1234"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "EMPLOYER_TOKEN=$EMPLOYER_TOKEN"
```

Expected: token printed (long JWT string).

- [ ] **Step 3: Register a candidate and capture the token**

```bash
CANDIDATE_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register/candidate \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Bob Dev",
    "email": "bob@example.com",
    "password": "Test@1234"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "CANDIDATE_TOKEN=$CANDIDATE_TOKEN"
```

Expected: token printed.

- [ ] **Step 4: Post a vacancy**

```bash
curl -s -X POST http://localhost:8080/api/employer/vacancies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{
    "designation": "Java Developer",
    "department": "Engineering",
    "jobDescription": "Build REST APIs",
    "requiredQual": "B.Tech",
    "requiredExpYrs": 2,
    "salaryMin": 700000,
    "salaryMax": 1200000,
    "employmentType": "Permanent",
    "numOpenings": 2,
    "location": "Bangalore",
    "applicationDeadline": "2026-12-31"
  }' | python3 -m json.tool
```

Expected: JSON with `vacancyId`, `status: "Open"`, `orgName: "TestCorp"`.

- [ ] **Step 5: List employer's vacancies**

```bash
curl -s http://localhost:8080/api/employer/vacancies \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" | python3 -m json.tool
```

Expected: JSON array with 1 vacancy.

- [ ] **Step 6: Update the vacancy**

Note the `vacancyId` from Step 4 (should be 1 if fresh DB). Replace `1` if different.

```bash
curl -s -X PUT http://localhost:8080/api/employer/vacancies/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{"numOpenings": 5, "location": "Hyderabad"}' | python3 -m json.tool
```

Expected: same vacancy JSON with `numOpenings: 5`, `location: "Hyderabad"`.

- [ ] **Step 7: Close the vacancy**

```bash
curl -s -X PATCH http://localhost:8080/api/employer/vacancies/1/close \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" | python3 -m json.tool
```

Expected: same vacancy JSON with `status: "Closed"`.

- [ ] **Step 8: Update candidate profile with skills and preferences**

```bash
curl -s -X PUT http://localhost:8080/api/candidate/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -d '{
    "phone": "9876543210",
    "dob": "1998-06-15",
    "gender": "Male",
    "address": "Pune, Maharashtra",
    "degree": "B.Tech CSE",
    "institution": "BITS Pilani",
    "yearOfPassing": 2021,
    "percentage": 78.5,
    "totalExpYrs": 2.5,
    "expectedSalMin": 800000,
    "expectedSalMax": 1400000,
    "skills": [
      {"skillName": "Java", "proficiency": "Expert"},
      {"skillName": "React", "proficiency": "Intermediate"}
    ],
    "locationPrefs": ["Bangalore", "Hyderabad"],
    "rolePrefs": ["Software Engineer", "Backend Developer"]
  }' | python3 -m json.tool
```

Expected: full profile JSON including `skills` array (2 items), `locationPrefs` array (2 items), `rolePrefs` array (2 items).

- [ ] **Step 9: Get candidate profile**

```bash
curl -s http://localhost:8080/api/candidate/profile \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" | python3 -m json.tool
```

Expected: same profile JSON with all fields populated.

- [ ] **Step 10: Verify cross-module alignment — candidate token cannot access employer endpoint**

```bash
curl -s -X GET http://localhost:8080/api/employer/vacancies \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"
```

Expected: HTTP 403 Forbidden (not a 200).

- [ ] **Step 11: Verify employer token cannot access candidate endpoint**

```bash
curl -s -X GET http://localhost:8080/api/candidate/profile \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"
```

Expected: HTTP 403 Forbidden.

- [ ] **Step 12: Confirm Module 1 login still works**

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@testcorp.com","password":"Test@1234","role":"EMPLOYER"}' | python3 -m json.tool
```

Expected: JSON with `token`, `role: "EMPLOYER"`. Module 1 untouched.

All 12 checks pass → backend is fully verified. Stop the server (`Ctrl+C`).

---

## Task 9: Frontend Scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Scaffold Vite + React project**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind**

Edit `frontend/tailwind.config.js` to this exact content:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 3: Add Tailwind directives to CSS**

Replace the full contents of `frontend/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Configure Vite proxy**

Replace the full contents of `frontend/vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

- [ ] **Step 5: Verify dev server starts**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/frontend"
npm run dev
```

Expected: `Local: http://localhost:3000/` — browser opens blank Vite page. Stop with `Ctrl+C`.

- [ ] **Step 6: Commit frontend scaffold**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git add frontend/
git commit -m "feat(frontend): scaffold React 18 + Vite + Tailwind project [v0.5.0]"
```

---

## Task 10: AuthContext + Axios API wrapper

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/api/api.js`

- [ ] **Step 1: Create AuthContext**

Create `frontend/src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId')
    const name = localStorage.getItem('name')
    return token ? { token, role, userId, name } : null
  })

  function login(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('userId', String(data.userId))
    localStorage.setItem('name', data.name)
    setAuth(data)
  }

  function logout() {
    localStorage.clear()
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Create Axios API wrapper**

Create `frontend/src/api/api.js`:

```js
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

---

## Task 11: Login Page + App Routing

**Files:**
- Create: `frontend/src/pages/Login.jsx`
- Create: `frontend/src/App.jsx`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Create Login page**

Create `frontend/src/pages/Login.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'EMPLOYER' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
      navigate(res.data.role === 'EMPLOYER' ? '/employer/vacancies' : '/candidate/profile')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">Recruitment Portal</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input className="w-full border p-2 rounded" placeholder="Email"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password"
          value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <select className="w-full border p-2 rounded"
          value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
          <option value="EMPLOYER">Employer</option>
          <option value="CANDIDATE">Candidate</option>
        </select>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create App.jsx with routes**

Replace `frontend/src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import PostJob from './pages/employer/PostJob'
import MyVacancies from './pages/employer/MyVacancies'
import EditVacancy from './pages/employer/EditVacancy'
import Profile from './pages/candidate/Profile'
import MyApplications from './pages/candidate/MyApplications'

function PrivateRoute({ children, role }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/employer/vacancies/new" element={
            <PrivateRoute role="EMPLOYER"><PostJob /></PrivateRoute>
          } />
          <Route path="/employer/vacancies/:id/edit" element={
            <PrivateRoute role="EMPLOYER"><EditVacancy /></PrivateRoute>
          } />
          <Route path="/employer/vacancies" element={
            <PrivateRoute role="EMPLOYER"><MyVacancies /></PrivateRoute>
          } />
          <Route path="/candidate/profile" element={
            <PrivateRoute role="CANDIDATE"><Profile /></PrivateRoute>
          } />
          <Route path="/candidate/applications" element={
            <PrivateRoute role="CANDIDATE"><MyApplications /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 3: Update main.jsx**

Replace `frontend/src/main.jsx` with:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## Task 12: Employer — PostJob + MyVacancies + EditVacancy pages

**Files:**
- Create: `frontend/src/pages/employer/PostJob.jsx`
- Create: `frontend/src/pages/employer/MyVacancies.jsx`
- Create: `frontend/src/pages/employer/EditVacancy.jsx`

- [ ] **Step 1: Create PostJob page**

Create `frontend/src/pages/employer/PostJob.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    designation: '', department: '', jobDescription: '', requiredQual: '',
    requiredExpYrs: '', salaryMin: '', salaryMax: '', employmentType: 'Permanent',
    numOpenings: 1, location: '', applicationDeadline: ''
  })
  const [error, setError] = useState('')

  function set(field) {
    return e => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/employer/vacancies', form)
      navigate('/employer/vacancies')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post vacancy')
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Post New Vacancy</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Designation *"
          value={form.designation} onChange={set('designation')} required />
        <input className="w-full border p-2 rounded" placeholder="Department"
          value={form.department} onChange={set('department')} />
        <textarea className="w-full border p-2 rounded" placeholder="Job Description" rows={3}
          value={form.jobDescription} onChange={set('jobDescription')} />
        <input className="w-full border p-2 rounded" placeholder="Required Qualification (e.g. B.Tech)"
          value={form.requiredQual} onChange={set('requiredQual')} />
        <div className="flex gap-2">
          <input className="w-full border p-2 rounded" placeholder="Min Experience (yrs)"
            type="number" value={form.requiredExpYrs} onChange={set('requiredExpYrs')} />
          <input className="w-full border p-2 rounded" placeholder="Openings"
            type="number" value={form.numOpenings} onChange={set('numOpenings')} />
        </div>
        <div className="flex gap-2">
          <input className="w-full border p-2 rounded" placeholder="Salary Min"
            type="number" value={form.salaryMin} onChange={set('salaryMin')} />
          <input className="w-full border p-2 rounded" placeholder="Salary Max"
            type="number" value={form.salaryMax} onChange={set('salaryMax')} />
        </div>
        <select className="w-full border p-2 rounded" value={form.employmentType} onChange={set('employmentType')}>
          <option>Permanent</option>
          <option>Temporary</option>
          <option>Contract</option>
        </select>
        <input className="w-full border p-2 rounded" placeholder="Location"
          value={form.location} onChange={set('location')} />
        <label className="block text-sm text-gray-600">Application Deadline</label>
        <input className="w-full border p-2 rounded" type="date"
          value={form.applicationDeadline} onChange={set('applicationDeadline')} />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Post Vacancy</button>
          <button type="button" onClick={() => navigate('/employer/vacancies')}
            className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create MyVacancies page**

Create `frontend/src/pages/employer/MyVacancies.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/api'

export default function MyVacancies() {
  const [vacancies, setVacancies] = useState([])
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/employer/vacancies').then(r => setVacancies(r.data))
  }, [])

  async function handleClose(id) {
    await api.patch(`/employer/vacancies/${id}/close`)
    setVacancies(vs => vs.map(v => v.vacancyId === id ? { ...v, status: 'Closed' } : v))
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Vacancies — {auth?.name}</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate('/employer/vacancies/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Post Job</button>
          <button onClick={logout} className="border px-4 py-2 rounded hover:bg-gray-50">Logout</button>
        </div>
      </div>
      {vacancies.length === 0 && <p className="text-gray-500">No vacancies posted yet.</p>}
      <div className="space-y-4">
        {vacancies.map(v => (
          <div key={v.vacancyId} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{v.designation}</h3>
                <p className="text-sm text-gray-600">{v.department} · {v.location} · {v.employmentType}</p>
                <p className="text-sm text-gray-600">
                  ₹{v.salaryMin?.toLocaleString()} – ₹{v.salaryMax?.toLocaleString()} · {v.numOpenings} openings
                </p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
                  v.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>{v.status}</span>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button onClick={() => navigate(`/employer/vacancies/${v.vacancyId}/edit`)}
                  className="text-sm border px-3 py-1 rounded hover:bg-gray-50">Edit</button>
                {v.status === 'Open' && (
                  <button onClick={() => handleClose(v.vacancyId)}
                    className="text-sm border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-50">Close</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create EditVacancy page**

Create `frontend/src/pages/employer/EditVacancy.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'

export default function EditVacancy() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/employer/vacancies/${id}`).then(r => {
      const v = r.data
      setForm({
        designation: v.designation || '',
        department: v.department || '',
        jobDescription: v.jobDescription || '',
        requiredQual: v.requiredQual || '',
        requiredExpYrs: v.requiredExpYrs || '',
        salaryMin: v.salaryMin || '',
        salaryMax: v.salaryMax || '',
        employmentType: v.employmentType || 'Permanent',
        numOpenings: v.numOpenings || 1,
        location: v.location || '',
        applicationDeadline: v.applicationDeadline || '',
        status: v.status || 'Open'
      })
    })
  }, [id])

  function set(field) {
    return e => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await api.put(`/employer/vacancies/${id}`, form)
      navigate('/employer/vacancies')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  if (!form) return <p className="p-8 text-gray-500">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Vacancy</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Designation *"
          value={form.designation} onChange={set('designation')} required />
        <input className="w-full border p-2 rounded" placeholder="Department"
          value={form.department} onChange={set('department')} />
        <textarea className="w-full border p-2 rounded" placeholder="Job Description" rows={3}
          value={form.jobDescription} onChange={set('jobDescription')} />
        <input className="w-full border p-2 rounded" placeholder="Required Qualification"
          value={form.requiredQual} onChange={set('requiredQual')} />
        <div className="flex gap-2">
          <input className="w-full border p-2 rounded" placeholder="Min Experience (yrs)"
            type="number" value={form.requiredExpYrs} onChange={set('requiredExpYrs')} />
          <input className="w-full border p-2 rounded" placeholder="Openings"
            type="number" value={form.numOpenings} onChange={set('numOpenings')} />
        </div>
        <div className="flex gap-2">
          <input className="w-full border p-2 rounded" placeholder="Salary Min"
            type="number" value={form.salaryMin} onChange={set('salaryMin')} />
          <input className="w-full border p-2 rounded" placeholder="Salary Max"
            type="number" value={form.salaryMax} onChange={set('salaryMax')} />
        </div>
        <select className="w-full border p-2 rounded" value={form.employmentType} onChange={set('employmentType')}>
          <option>Permanent</option>
          <option>Temporary</option>
          <option>Contract</option>
        </select>
        <input className="w-full border p-2 rounded" placeholder="Location"
          value={form.location} onChange={set('location')} />
        <label className="block text-sm text-gray-600">Application Deadline</label>
        <input className="w-full border p-2 rounded" type="date"
          value={form.applicationDeadline} onChange={set('applicationDeadline')} />
        <select className="w-full border p-2 rounded" value={form.status} onChange={set('status')}>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="On_Hold">On Hold</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
          <button type="button" onClick={() => navigate('/employer/vacancies')}
            className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  )
}
```

---

## Task 13: Candidate — Profile page + MyApplications placeholder

**Files:**
- Create: `frontend/src/pages/candidate/Profile.jsx`
- Create: `frontend/src/pages/candidate/MyApplications.jsx`

- [ ] **Step 1: Create Profile page**

Create `frontend/src/pages/candidate/Profile.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/api'

export default function Profile() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get('/candidate/profile').then(r => {
      setProfile(r.data)
      setForm({
        fullName: r.data.fullName || '',
        phone: r.data.phone || '',
        dob: r.data.dob || '',
        gender: r.data.gender || '',
        address: r.data.address || '',
        degree: r.data.degree || '',
        institution: r.data.institution || '',
        yearOfPassing: r.data.yearOfPassing || '',
        percentage: r.data.percentage || '',
        totalExpYrs: r.data.totalExpYrs || '',
        expectedSalMin: r.data.expectedSalMin || '',
        expectedSalMax: r.data.expectedSalMax || '',
        skills: r.data.skills || [],
        locationPrefs: r.data.locationPrefs || [],
        rolePrefs: r.data.rolePrefs || [],
      })
    })
  }, [])

  function set(field) {
    return e => setForm({ ...form, [field]: e.target.value })
  }

  function addSkill() {
    if (!skillInput.trim()) return
    setForm({ ...form, skills: [...form.skills, { skillName: skillInput.trim(), proficiency: 'Intermediate' }] })
    setSkillInput('')
  }

  function removeSkill(idx) {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) })
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        ...form,
        locationPrefs: form.locationPrefs.filter(Boolean),
        rolePrefs: form.rolePrefs.filter(Boolean),
      }
      const res = await api.put('/candidate/profile', payload)
      setProfile(res.data)
      setEditing(false)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  if (!profile || !form) return <p className="p-8 text-gray-500">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Profile — {auth?.name}</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate('/candidate/applications')}
            className="border px-4 py-2 rounded hover:bg-gray-50 text-sm">My Applications</button>
          <button onClick={logout} className="border px-4 py-2 rounded hover:bg-gray-50 text-sm">Logout</button>
        </div>
      </div>
      {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!editing ? (
        <div className="bg-white rounded shadow p-6 space-y-2">
          <p><span className="font-medium">Name:</span> {profile.fullName}</p>
          <p><span className="font-medium">Email:</span> {profile.email}</p>
          <p><span className="font-medium">Phone:</span> {profile.phone}</p>
          <p><span className="font-medium">DOB:</span> {profile.dob}</p>
          <p><span className="font-medium">Gender:</span> {profile.gender}</p>
          <p><span className="font-medium">Degree:</span> {profile.degree} — {profile.institution} ({profile.yearOfPassing})</p>
          <p><span className="font-medium">Experience:</span> {profile.totalExpYrs} yrs</p>
          <p><span className="font-medium">Expected Salary:</span> ₹{profile.expectedSalMin?.toLocaleString()} – ₹{profile.expectedSalMax?.toLocaleString()}</p>
          <p><span className="font-medium">Skills:</span> {profile.skills?.map(s => `${s.skillName} (${s.proficiency})`).join(', ') || '—'}</p>
          <p><span className="font-medium">Location Preferences:</span> {profile.locationPrefs?.join(', ') || '—'}</p>
          <p><span className="font-medium">Role Preferences:</span> {profile.rolePrefs?.join(', ') || '—'}</p>
          <button onClick={() => setEditing(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded shadow p-6 space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Full Name" value={form.fullName} onChange={set('fullName')} />
          <input className="w-full border p-2 rounded" placeholder="Phone" value={form.phone} onChange={set('phone')} />
          <label className="block text-sm text-gray-600">Date of Birth</label>
          <input className="w-full border p-2 rounded" type="date" value={form.dob} onChange={set('dob')} />
          <select className="w-full border p-2 rounded" value={form.gender} onChange={set('gender')}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input className="w-full border p-2 rounded" placeholder="Address" value={form.address} onChange={set('address')} />
          <input className="w-full border p-2 rounded" placeholder="Degree (e.g. B.Tech CSE)" value={form.degree} onChange={set('degree')} />
          <input className="w-full border p-2 rounded" placeholder="Institution" value={form.institution} onChange={set('institution')} />
          <div className="flex gap-2">
            <input className="w-full border p-2 rounded" placeholder="Year of Passing" type="number" value={form.yearOfPassing} onChange={set('yearOfPassing')} />
            <input className="w-full border p-2 rounded" placeholder="Percentage / GPA" type="number" step="0.01" value={form.percentage} onChange={set('percentage')} />
          </div>
          <input className="w-full border p-2 rounded" placeholder="Total Experience (yrs)" type="number" step="0.5" value={form.totalExpYrs} onChange={set('totalExpYrs')} />
          <div className="flex gap-2">
            <input className="w-full border p-2 rounded" placeholder="Expected Salary Min" type="number" value={form.expectedSalMin} onChange={set('expectedSalMin')} />
            <input className="w-full border p-2 rounded" placeholder="Expected Salary Max" type="number" value={form.expectedSalMax} onChange={set('expectedSalMax')} />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Skills</p>
            <div className="flex gap-2 mb-2">
              <input className="border p-2 rounded flex-1" placeholder="Add skill (e.g. Java)"
                value={skillInput} onChange={e => setSkillInput(e.target.value)} />
              <button type="button" onClick={addSkill} className="border px-3 py-2 rounded hover:bg-gray-50">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {s.skillName}
                  <button type="button" onClick={() => removeSkill(i)} className="text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Location Preferences (comma-separated)</p>
            <input className="w-full border p-2 rounded"
              value={form.locationPrefs.join(', ')}
              onChange={e => setForm({ ...form, locationPrefs: e.target.value.split(',').map(s => s.trim()) })} />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Role Preferences (comma-separated)</p>
            <input className="w-full border p-2 rounded"
              value={form.rolePrefs.join(', ')}
              onChange={e => setForm({ ...form, rolePrefs: e.target.value.split(',').map(s => s.trim()) })} />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Profile</button>
            <button type="button" onClick={() => setEditing(false)} className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create MyApplications placeholder**

Create `frontend/src/pages/candidate/MyApplications.jsx`:

```jsx
import { useNavigate } from 'react-router-dom'

export default function MyApplications() {
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Applications</h2>
        <button onClick={() => navigate('/candidate/profile')}
          className="border px-4 py-2 rounded hover:bg-gray-50 text-sm">Back to Profile</button>
      </div>
      <p className="text-gray-500">Applications list will appear here (Module 5 — teammate's work).</p>
    </div>
  )
}
```

---

## Task 14: Frontend End-to-End Verification

- [ ] **Step 1: Start backend**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn spring-boot:run
```

Expected: Started on port 8080.

- [ ] **Step 2: Start frontend**

In a second terminal:

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/frontend"
npm run dev
```

Expected: `Local: http://localhost:3000/`

- [ ] **Step 3: Test employer flow in browser**

1. Open `http://localhost:3000`
2. Redirects to `/login` ✓
3. Enter `alice@testcorp.com` / `Test@1234` / `Employer` → click Login
4. Redirects to `/employer/vacancies` — list shows previously posted vacancy ✓
5. Click **Post Job** → fill form → submit → redirects back to list with new vacancy ✓
6. Click **Edit** on a vacancy → change a field → save → list updated ✓
7. Click **Close** on an Open vacancy → status changes to Closed in list ✓

- [ ] **Step 4: Test candidate flow in browser**

1. Logout (or open incognito)
2. Enter `bob@example.com` / `Test@1234` / `Candidate` → Login
3. Redirects to `/candidate/profile` — shows profile ✓
4. Click **Edit Profile** → update skills (add "Spring Boot") → click Save
5. Profile view refreshes with updated skills ✓
6. Click **My Applications** → placeholder page loads ✓

- [ ] **Step 5: Test JWT guard in browser**

Navigate directly to `http://localhost:3000/employer/vacancies` while logged in as Candidate → redirects to `/login` ✓

- [ ] **Step 6: Commit frontend pages**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git add frontend/src/
git commit -m "feat(frontend): add employer vacancy management and candidate profile UI [v0.6.0]"
```

---

## Task 15: Update CHANGELOG + Final Verification before Push

- [ ] **Step 1: Update CHANGELOG.md**

Add the following block at the **top** of `CHANGELOG.md` (above the `[v0.2.0]` entry):

```markdown
## [v0.6.0] — 2026-10-29 — Frontend: Employer Vacancy UI + Candidate Profile UI

### What was done
- Scaffolded React 18 + Vite + Tailwind frontend
- Implemented PostJob, MyVacancies, EditVacancy pages (Module 2 frontend)
- Implemented Profile page with skills + preferences editing (Module 4 frontend)
- Added AuthContext (JWT in localStorage) and Axios wrapper with auth header
- Added route guards (PrivateRoute) — employer/candidate role enforcement
- Added MyApplications placeholder page for teammate's Module 5

### Files added
| File | Purpose |
|------|---------|
| `frontend/` | Full React SPA scaffold |
| `frontend/src/context/AuthContext.jsx` | JWT storage + useAuth hook |
| `frontend/src/api/api.js` | Axios instance with Bearer token interceptor |
| `frontend/src/pages/Login.jsx` | Login page |
| `frontend/src/pages/employer/PostJob.jsx` | Post new vacancy |
| `frontend/src/pages/employer/MyVacancies.jsx` | List + close vacancies |
| `frontend/src/pages/employer/EditVacancy.jsx` | Edit a vacancy |
| `frontend/src/pages/candidate/Profile.jsx` | View + edit candidate profile |
| `frontend/src/pages/candidate/MyApplications.jsx` | Placeholder for Module 5 |

### How to run after pulling this
```bash
# Terminal 1 — backend
cd backend && mvn spring-boot:run

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
# Opens at http://localhost:3000
```

---

## [v0.5.0] — 2026-10-29 — Frontend scaffold (Vite + React + Tailwind)

---

## [v0.4.0] — 2026-10-29 — Backend Module 4: Candidate Profile & Preferences API

### What was done
- Implemented Module 4: GET + PUT /api/candidate/profile
- Skills, location preferences, role preferences replaced on each update (delete + re-insert)

### Files added
| File | Purpose |
|------|---------|
| `repository/CandidateSkillRepository.java` | deleteAllByCandidate_CandidateId |
| `repository/CandidateLocationPrefRepository.java` | deleteAllByCandidate_CandidateId |
| `repository/CandidateRolePrefRepository.java` | deleteAllByCandidate_CandidateId |
| `dto/CandidateDTOs.java` | ProfileUpdateRequest, ProfileResponse, SkillRequest, SkillResponse |
| `service/CandidateService.java` | getProfile, updateProfile |
| `controller/CandidateController.java` | GET + PUT /api/candidate/profile |

### API endpoints added
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/candidate/profile` | Get logged-in candidate's full profile |
| PUT | `/api/candidate/profile` | Update profile + skills + preferences |

---

## [v0.3.0] — 2026-10-29 — Backend Module 2: Vacancy Management API

### What was done
- Implemented Module 2: full CRUD + close for employer vacancies

### Files added
| File | Purpose |
|------|---------|
| `entity/Vacancy.java` | JPA entity for vacancies table |
| `repository/VacancyRepository.java` | findByEmployer_EmployerIdOrderByPostedAtDesc |
| `dto/VacancyDTOs.java` | VacancyCreateRequest, VacancyUpdateRequest, VacancyResponse |
| `service/VacancyService.java` | create, listByEmployer, getOne, update, close |
| `controller/VacancyController.java` | POST/GET/PUT/PATCH /api/employer/vacancies |

### API endpoints added
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/employer/vacancies` | Post new vacancy |
| GET | `/api/employer/vacancies` | List employer's vacancies |
| GET | `/api/employer/vacancies/{id}` | Get single vacancy |
| PUT | `/api/employer/vacancies/{id}` | Edit vacancy |
| PATCH | `/api/employer/vacancies/{id}/close` | Close vacancy |
```

- [ ] **Step 2: Final compile check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system/backend"
mvn compile -q
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 3: Final git status check**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git status
git log --oneline -8
```

Expected: working tree clean; 5–6 commits visible including v0.3.0 through v0.6.0.

- [ ] **Step 4: Push to main**

```bash
cd "/Users/I578445/Desktop/FSAD PROJECT/recruitment-processing-system"
git push origin main
```

Expected: `Branch 'main' set up to track remote branch 'main'` or `Everything up-to-date`.

After push: inform your teammate that Modules 2 and 4 backend + frontend are done, they can pull `main` and their Modules 3 and 5 (Candidate Search, Job Search & Apply) will have the `vacancies` API and `candidate/profile` API ready to build on.
