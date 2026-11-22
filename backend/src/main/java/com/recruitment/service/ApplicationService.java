package com.recruitment.service;

import com.recruitment.dto.ApplicationDTOs.*;
import com.recruitment.entity.Application;
import com.recruitment.entity.Candidate;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CandidateRepository;
import com.recruitment.repository.VacancyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                               CandidateRepository candidateRepository,
                               VacancyRepository vacancyRepository) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.vacancyRepository = vacancyRepository;
    }

    public ApplicationResponse apply(String candidateEmail, ApplicationCreateRequest req) {
        Candidate candidate = candidateRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Vacancy vacancy = vacancyRepository.findById(req.getVacancyId())
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        if (applicationRepository.existsByVacancy_VacancyIdAndCandidate_CandidateId(vacancy.getVacancyId(), candidate.getCandidateId())) {
            throw new IllegalArgumentException("Already applied");
        }
        Application app = new Application();
        app.setVacancy(vacancy);
        app.setCandidate(candidate);
        app.setCoverNote(req.getCoverNote());
        return toResponse(applicationRepository.save(app));
    }

    public List<ApplicationResponse> getCandidateApplications(String candidateEmail) {
        Candidate candidate = candidateRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        return applicationRepository.findByCandidate_CandidateId(candidate.getCandidateId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ApplicationResponse> getVacancyApplications(String employerEmail, Integer vacancyId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        if (!vacancy.getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }
        return applicationRepository.findByVacancy_VacancyId(vacancyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(String employerEmail, Integer applicationId, ApplicationStatusUpdateRequest req) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!app.getVacancy().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }
        app.setStatus(req.getStatus());
        return toResponse(applicationRepository.save(app));
    }

    public ApplicationResponse toResponse(Application app) {
        ApplicationResponse r = new ApplicationResponse();
        r.setApplicationId(app.getApplicationId());
        r.setVacancyId(app.getVacancy().getVacancyId());
        r.setVacancyTitle(app.getVacancy().getDesignation());
        r.setEmployerOrgName(app.getVacancy().getEmployer().getOrgName());
        r.setCandidateId(app.getCandidate().getCandidateId());
        r.setCandidateName(app.getCandidate().getFullName());
        r.setAppliedAt(app.getAppliedAt() != null ? app.getAppliedAt().toString() : null);
        r.setStatus(app.getStatus());
        r.setCoverNote(app.getCoverNote());
        r.setResumePath(app.getResumePath());
        return r;
    }

    public ApplicationResponse updateResumePath(String candidateEmail, Integer applicationId, String resumePath) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!app.getCandidate().getEmail().equals(candidateEmail)) {
            throw new SecurityException("Access denied");
        }
        app.setResumePath(resumePath);
        return toResponse(applicationRepository.save(app));
    }
}
