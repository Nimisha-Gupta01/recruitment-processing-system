package com.recruitment.service;

import com.recruitment.dto.VacancyDTOs.*;
import com.recruitment.entity.Employer;
import com.recruitment.entity.Vacancy;
import com.recruitment.entity.Vacancy.EmploymentType;
import com.recruitment.entity.Vacancy.VacancyStatus;
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
        v.setEmploymentType(EmploymentType.valueOf(req.getEmploymentType()));
        if (req.getNumOpenings() != null) v.setNumOpenings(req.getNumOpenings());
        v.setLocation(req.getLocation());
        if (req.getApplicationDeadline() != null && !req.getApplicationDeadline().isBlank()) {
            v.setApplicationDeadline(LocalDate.parse(req.getApplicationDeadline()));
        }

        return new VacancyResponse(vacancyRepo.save(v));
    }

    public List<VacancyResponse> listByEmployer(String employerEmail) {
        Employer employer = employerRepo.findByEmail(employerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Employer not found"));
        return vacancyRepo.findByEmployer_EmployerIdOrderByPostedAtDesc(employer.getEmployerId())
                .stream()
                .map(VacancyResponse::new)
                .collect(Collectors.toList());
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
        if (req.getEmploymentType() != null) v.setEmploymentType(EmploymentType.valueOf(req.getEmploymentType()));
        if (req.getNumOpenings() != null) v.setNumOpenings(req.getNumOpenings());
        if (req.getLocation() != null) v.setLocation(req.getLocation());
        if (req.getApplicationDeadline() != null && !req.getApplicationDeadline().isBlank()) {
            v.setApplicationDeadline(LocalDate.parse(req.getApplicationDeadline()));
        }
        if (req.getStatus() != null) v.setStatus(VacancyStatus.valueOf(req.getStatus()));

        return new VacancyResponse(vacancyRepo.save(v));
    }

    public VacancyResponse close(String employerEmail, Integer vacancyId) {
        Vacancy v = vacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        assertOwner(employerEmail, v);
        v.setStatus(VacancyStatus.Closed);
        return new VacancyResponse(vacancyRepo.save(v));
    }

    private void assertOwner(String employerEmail, Vacancy v) {
        if (!v.getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }
    }
}
