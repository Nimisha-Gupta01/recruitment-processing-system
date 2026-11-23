package com.recruitment.controller;

import com.recruitment.dto.CandidateDTOs.*;
import com.recruitment.service.CandidateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Candidate Profile", description = "Candidate profile management")
@RestController
@RequestMapping("/api/candidate/profile")
public class CandidateController {

    private static final Logger log = LoggerFactory.getLogger(CandidateController.class);
    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    public ProfileResponse getProfile(@AuthenticationPrincipal String candidateEmail) {
        log.info("Fetching profile for candidate: {}", candidateEmail);
        return candidateService.getProfile(candidateEmail);
    }

    @PutMapping
    public ProfileResponse updateProfile(@AuthenticationPrincipal String candidateEmail,
                                          @RequestBody ProfileUpdateRequest req) {
        log.info("Updating profile for candidate: {}", candidateEmail);
        return candidateService.updateProfile(candidateEmail, req);
    }
}
