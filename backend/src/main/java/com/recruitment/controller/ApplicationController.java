package com.recruitment.controller;

import com.recruitment.dto.ApplicationDTOs.*;
import com.recruitment.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(@AuthenticationPrincipal String candidateEmail,
                                     @RequestBody ApplicationCreateRequest req) {
        return applicationService.apply(candidateEmail, req);
    }

    @GetMapping("/applications/my")
    public List<ApplicationResponse> myApplications(@AuthenticationPrincipal String candidateEmail) {
        return applicationService.getCandidateApplications(candidateEmail);
    }

    @GetMapping("/employer/applications")
    public List<ApplicationResponse> vacancyApplications(@AuthenticationPrincipal String employerEmail,
                                                          @RequestParam Integer vacancyId) {
        return applicationService.getVacancyApplications(employerEmail, vacancyId);
    }

    @PatchMapping("/employer/applications/{id}/status")
    public ApplicationResponse updateStatus(@AuthenticationPrincipal String employerEmail,
                                             @PathVariable Integer id,
                                             @RequestBody ApplicationStatusUpdateRequest req) {
        return applicationService.updateStatus(employerEmail, id, req);
    }
}
