package com.recruitment.service;

import com.recruitment.dto.InterviewDTOs.*;
import com.recruitment.entity.Application;
import com.recruitment.entity.Interview;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.InterviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public InterviewService(InterviewRepository interviewRepository,
                             ApplicationRepository applicationRepository,
                             NotificationService notificationService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getByApplication(String employerEmail, Integer applicationId) {
        return interviewRepository.findByApplication_ApplicationId(applicationId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getCandidateInterviews(String candidateEmail) {
        return interviewRepository.findByApplication_Candidate_Email(candidateEmail)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InterviewResponse schedule(String employerEmail, InterviewCreateRequest req) {
        Application app = applicationRepository.findById(req.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!app.getVacancy().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }

        Interview interview = new Interview();
        interview.setApplication(app);
        // Auto-calculate round number based on existing interviews for this application
        int existingCount = interviewRepository.findByApplication_ApplicationId(req.getApplicationId()).size();
        interview.setRoundNumber(existingCount + 1);
        interview.setInterviewDatetime(LocalDateTime.parse(req.getInterviewDatetime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        interview.setMode(req.getMode());
        interview.setVenue(req.getVenue());
        interview.setInterviewerName(req.getInterviewerName());
        interview.setOutcome("Scheduled");
        Interview saved = interviewRepository.save(interview);

        app.setStatus("Interview Scheduled");
        applicationRepository.save(app);

        // Notify candidate with date/time/mode details
        String candidateEmail = app.getCandidate().getEmail();
        String candidateName = app.getCandidate().getFullName();
        String vacancyTitle = app.getVacancy().getDesignation();
        String formattedDatetime = saved.getInterviewDatetime()
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        String body = "Dear " + candidateName + ", your interview for " + vacancyTitle +
                " (Round " + saved.getRoundNumber() + ") has been scheduled on " +
                formattedDatetime + " (" + saved.getMode() + ")." +
                (saved.getVenue() != null && !saved.getVenue().isBlank() ? " Venue: " + saved.getVenue() + "." : "") +
                " Interviewer: " + saved.getInterviewerName() + ".";

        notificationService.notify(candidateEmail, "Candidate",
                "Interview Scheduled — " + vacancyTitle, body, "STATUS_CHANGED");

        return toResponse(saved);
    }

    @Transactional
    public InterviewResponse updateOutcome(String employerEmail, Integer interviewId, InterviewOutcomeRequest req) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));
        if (!interview.getApplication().getVacancy().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }
        interview.setOutcome(req.getOutcome());
        interview.setRemarks(req.getRemarks());
        Interview saved = interviewRepository.save(interview);

        Application app = interview.getApplication();
        if ("Selected".equals(req.getOutcome())) {
            app.setStatus("Selected");
        } else if ("Rejected".equals(req.getOutcome())) {
            app.setStatus("Rejected");
        } else if ("Completed".equals(req.getOutcome())) {
            app.setStatus("Interview Completed");
        }
        applicationRepository.save(app);

        return toResponse(saved);
    }

    private InterviewResponse toResponse(Interview i) {
        InterviewResponse r = new InterviewResponse();
        r.setInterviewId(i.getInterviewId());
        r.setApplicationId(i.getApplication().getApplicationId());
        r.setRoundNumber(i.getRoundNumber());
        r.setInterviewDatetime(i.getInterviewDatetime() != null ? i.getInterviewDatetime().toString() : null);
        r.setMode(i.getMode());
        r.setVenue(i.getVenue());
        r.setInterviewerName(i.getInterviewerName());
        r.setOutcome(i.getOutcome());
        r.setRemarks(i.getRemarks());
        r.setCreatedAt(i.getCreatedAt() != null ? i.getCreatedAt().toString() : null);
        return r;
    }
}
