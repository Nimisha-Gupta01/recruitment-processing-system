package com.recruitment.controller;

import com.recruitment.dto.CandidateDTOs.*;
import com.recruitment.service.CandidateService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/profile")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    public ProfileResponse getProfile(@AuthenticationPrincipal String candidateEmail) {
        return candidateService.getProfile(candidateEmail);
    }

    @PutMapping
    public ProfileResponse updateProfile(@AuthenticationPrincipal String candidateEmail,
                                          @RequestBody ProfileUpdateRequest req) {
        return candidateService.updateProfile(candidateEmail, req);
    }
}
