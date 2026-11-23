package com.recruitment.controller;

import com.recruitment.dto.InterviewDTOs.*;
import com.recruitment.service.InterviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer/interviews")
public class InterviewController {

    private static final Logger log = LoggerFactory.getLogger(InterviewController.class);
    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse schedule(@AuthenticationPrincipal String employerEmail,
                                      @RequestBody InterviewCreateRequest req) {
        log.info("Scheduling interview for application id={} by employer: {}", req.getApplicationId(), employerEmail);
        InterviewResponse res = interviewService.schedule(employerEmail, req);
        log.info("Interview id={} scheduled for application id={}", res.getInterviewId(), req.getApplicationId());
        return res;
    }

    @PatchMapping("/{id}/outcome")
    public InterviewResponse updateOutcome(@AuthenticationPrincipal String employerEmail,
                                           @PathVariable Integer id,
                                           @RequestBody InterviewOutcomeRequest req) {
        log.info("Updating outcome for interview id={} to '{}' by employer: {}", id, req.getOutcome(), employerEmail);
        return interviewService.updateOutcome(employerEmail, id, req);
    }
}
