package com.recruitment.controller;

import com.recruitment.dto.ApplicationDTOs.*;
import com.recruitment.service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private static final Logger log = LoggerFactory.getLogger(ApplicationController.class);
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(@AuthenticationPrincipal String candidateEmail,
                                     @RequestBody ApplicationCreateRequest req) {
        log.info("Candidate {} applying to vacancy id={}", candidateEmail, req.getVacancyId());
        ApplicationResponse res = applicationService.apply(candidateEmail, req);
        log.info("Application id={} created for candidate: {}", res.getApplicationId(), candidateEmail);
        return res;
    }

    @GetMapping("/applications/my")
    public List<ApplicationResponse> myApplications(@AuthenticationPrincipal String candidateEmail) {
        log.info("Fetching applications for candidate: {}", candidateEmail);
        return applicationService.getCandidateApplications(candidateEmail);
    }

    @GetMapping("/employer/applications")
    public List<ApplicationResponse> vacancyApplications(@AuthenticationPrincipal String employerEmail,
                                                          @RequestParam Integer vacancyId) {
        log.info("Fetching applications for vacancy id={} by employer: {}", vacancyId, employerEmail);
        return applicationService.getVacancyApplications(employerEmail, vacancyId);
    }

    @PatchMapping("/employer/applications/{id}/status")
    public ApplicationResponse updateStatus(@AuthenticationPrincipal String employerEmail,
                                             @PathVariable Integer id,
                                             @RequestBody ApplicationStatusUpdateRequest req) {
        log.info("Updating application id={} status to '{}' by employer: {}", id, req.getStatus(), employerEmail);
        return applicationService.updateStatus(employerEmail, id, req);
    }
}
