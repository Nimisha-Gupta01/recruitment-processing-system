package com.recruitment.service;

import com.recruitment.dto.InterviewDTOs.*;
import com.recruitment.entity.Application;
import com.recruitment.entity.Interview;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.InterviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;

    public InterviewService(InterviewRepository interviewRepository,
                             ApplicationRepository applicationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
    }

    public InterviewResponse schedule(String employerEmail, InterviewCreateRequest req) {
        Application app = applicationRepository.findById(req.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!app.getVacancy().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }
        Interview interview = new Interview();
        interview.setApplication(app);
        interview.setRoundNumber(req.getRoundNumber() != null ? req.getRoundNumber() : 1);
        interview.setInterviewDatetime(LocalDateTime.parse(req.getInterviewDatetime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        interview.setMode(req.getMode());
        interview.setVenue(req.getVenue());
        interview.setInterviewerName(req.getInterviewerName());
        interview.setOutcome("Scheduled");
        Interview saved = interviewRepository.save(interview);

        app.setStatus("Interview Scheduled");
        applicationRepository.save(app);

        return toResponse(saved);
    }

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
