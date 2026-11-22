package com.recruitment.controller;

import com.recruitment.dto.InterviewDTOs.*;
import com.recruitment.service.InterviewService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse schedule(@AuthenticationPrincipal String employerEmail,
                                      @RequestBody InterviewCreateRequest req) {
        return interviewService.schedule(employerEmail, req);
    }

    @PatchMapping("/{id}/outcome")
    public InterviewResponse updateOutcome(@AuthenticationPrincipal String employerEmail,
                                           @PathVariable Integer id,
                                           @RequestBody InterviewOutcomeRequest req) {
        return interviewService.updateOutcome(employerEmail, id, req);
    }
}
