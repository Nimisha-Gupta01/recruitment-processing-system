package com.recruitment.controller;

import com.recruitment.dto.InterviewDTOs.*;
import com.recruitment.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Interviews", description = "Schedule and manage interviews")
@RestController
@RequestMapping("/api")
public class InterviewController {

    private static final Logger log = LoggerFactory.getLogger(InterviewController.class);
    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }
//schedule interview
    @PostMapping("/employer/interviews")
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse schedule(@AuthenticationPrincipal String employerEmail,
                                      @RequestBody InterviewCreateRequest req) {
        log.info("Scheduling interview for application id={} by employer: {}", req.getApplicationId(), employerEmail);
        InterviewResponse res = interviewService.schedule(employerEmail, req);
        log.info("Interview id={} scheduled for application id={}", res.getInterviewId(), req.getApplicationId());
        return res;
    }
//updatedOutcome
    @PatchMapping("/employer/interviews/{id}/outcome")
    public InterviewResponse updateOutcome(@AuthenticationPrincipal String employerEmail,
                                           @PathVariable Integer id,
                                           @RequestBody InterviewOutcomeRequest req) {
        log.info("Updating outcome for interview id={} to '{}' by employer: {}", id, req.getOutcome(), employerEmail);
        return interviewService.updateOutcome(employerEmail, id, req);
    }
    //byApplication
    @GetMapping("/employer/interviews")
    public List<InterviewResponse> byApplication(@AuthenticationPrincipal String employerEmail,
                                                  @RequestParam Integer applicationId) {
        log.info("Fetching interviews for application id={} by employer: {}", applicationId, employerEmail);
        return interviewService.getByApplication(employerEmail, applicationId);
    }
    //myinterviews
    @GetMapping("/candidate/interviews")
    public List<InterviewResponse> myInterviews(@AuthenticationPrincipal Sring candidateEmail) {
        log.info("Fetching interviews for candidate: {}", candidateEmail);
        return interviewService.getCandidateInterviews(candidateEmail);
    }
}
