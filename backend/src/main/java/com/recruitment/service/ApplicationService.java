package com.recruitment.service;

import com.recruitment.dto.ApplicationDTOs.*;
import com.recruitment.entity.Application;
import com.recruitment.entity.Candidate;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CandidateRepository;
import com.recruitment.repository.VacancyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                               CandidateRepository candidateRepository,
                               VacancyRepository vacancyRepository,
                               NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.vacancyRepository = vacancyRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ApplicationResponse apply(String candidateEmail, ApplicationCreateRequest req) {
        Candidate candidate = candidateRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Vacancy vacancy = vacancyRepository.findById(req.getVacancyId())
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        if (applicationRepository.existsByVacancy_VacancyIdAndCandidate_CandidateIdAndStatusNot(vacancy.getVacancyId(), candidate.getCandidateId(), "Withdrawn")) {
            throw new IllegalArgumentException("Already applied");
        }
        // Enforce 3-month cooldown after withdrawal
        applicationRepository.findByVacancy_VacancyIdAndCandidate_CandidateId(vacancy.getVacancyId(), candidate.getCandidateId())
                .ifPresent(prev -> {
                    java.time.LocalDateTime withdrawnAt = prev.getWithdrawnAt();
                    java.time.LocalDateTime earliestReapply = (withdrawnAt != null ? withdrawnAt : prev.getAppliedAt())
                            .plusMonths(3);
                    if (java.time.LocalDateTime.now().isBefore(earliestReapply)) {
                        java.time.LocalDate reapplyDate = earliestReapply.toLocalDate();
                        throw new IllegalArgumentException(
                            "You cannot re-apply for this position for 3 months after withdrawing. You may apply again from " + reapplyDate + "."
                        );
                    }
                    // Cooldown passed — remove old withdrawn record
                    applicationRepository.delete(prev);
                    applicationRepository.flush();
                });
        Application app = new Application();
        app.setVacancy(vacancy);
        app.setCandidate(candidate);
        app.setCoverNote(req.getCoverNote());
        ApplicationResponse res = toResponse(applicationRepository.save(app));

        String vacancyTitle = vacancy.getDesignation();
        String candidateName = candidate.getFullName();
        String employerEmail = vacancy.getEmployer().getEmail();

        // Notify candidate — confirmation of application
        notificationService.notify(
            candidateEmail,
            "Candidate",
            "Application Submitted — " + vacancyTitle,
            "Your application for " + vacancyTitle + " at " + vacancy.getEmployer().getOrgName() + " has been submitted successfully.",
            "APPLICATION_SUBMITTED"
        );

        // Notify employer — new application received
        notificationService.notify(
            employerEmail,
            "Employer",
            "New Application — " + vacancyTitle,
            candidateName + " has applied for the position of " + vacancyTitle + ".",
            "APPLICATION_SUBMITTED"
        );

        return res;
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

    @Transactional
    public ApplicationResponse updateStatus(String employerEmail, Integer applicationId, ApplicationStatusUpdateRequest req) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!app.getVacancy().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }
        app.setStatus(req.getStatus());
        ApplicationResponse res = toResponse(applicationRepository.save(app));

        // Notify candidate of any status change
        String candidateEmail = app.getCandidate().getEmail();
        String candidateName = app.getCandidate().getFullName();
        String vacancyTitle = app.getVacancy().getDesignation();
        String newStatus = req.getStatus();

        String subject = "Application Update — " + vacancyTitle;
        String body = "Dear " + candidateName + ", your application for " + vacancyTitle +
                " has been updated to: " + newStatus + ".";

        if ("Rejected".equals(newStatus)) {
            subject = "Application Not Selected — " + vacancyTitle;
            body = "Dear " + candidateName + ", we regret to inform you that your application for " +
                   vacancyTitle + " has not been selected at this time.";
        } else if ("Shortlisted".equals(newStatus)) {
            subject = "Congratulations! You've been Shortlisted — " + vacancyTitle;
            body = "Dear " + candidateName + ", congratulations! You have been shortlisted for " + vacancyTitle + ".";
        } else if ("Selected".equals(newStatus)) {
            subject = "Selected! — " + vacancyTitle;
            body = "Dear " + candidateName + ", congratulations! You have been selected for " + vacancyTitle + ". The employer will reach out with next steps.";
        } else if ("Offered".equals(newStatus)) {
            subject = "Offer Extended — " + vacancyTitle;
            body = "Dear " + candidateName + ", congratulations! An offer has been extended to you for the position of " + vacancyTitle + ". Please check with the employer for offer details.";
        } else if ("Recruited".equals(newStatus)) {
            subject = "Welcome Aboard! — " + vacancyTitle;
            body = "Dear " + candidateName + ", congratulations and welcome! You have been successfully recruited for " + vacancyTitle + ". We wish you great success in your new role.";
        }

        notificationService.notify(candidateEmail, "Candidate", subject, body, "STATUS_CHANGED");

        return res;
    }

    @Transactional
    public ApplicationResponse withdrawApplication(String candidateEmail, Integer applicationId, String reason) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!app.getCandidate().getEmail().equals(candidateEmail)) {
            throw new SecurityException("Access denied");
        }
        if (app.getStatus().equals("Withdrawn")) {
            throw new IllegalArgumentException("Application already withdrawn");
        }
        app.setStatus("Withdrawn");
        app.setWithdrawnAt(java.time.LocalDateTime.now());
        ApplicationResponse res = toResponse(applicationRepository.save(app));

        // Notify employer — include reason if provided
        String employerEmail = app.getVacancy().getEmployer().getEmail();
        String candidateName = app.getCandidate().getFullName();
        String vacancyTitle = app.getVacancy().getDesignation();
        String body = candidateName + " has withdrawn their application for the position of " + vacancyTitle + ".";
        if (reason != null && !reason.isBlank()) {
            body += " Reason: " + reason;
        }
        notificationService.notify(
            employerEmail,
            "Employer",
            "Application Withdrawn — " + vacancyTitle,
            body,
            "APPLICATION_WITHDRAWN"
        );

        return res;
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
        r.setAiScore(app.getAiScore());
        r.setAiSummary(app.getAiSummary());
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
