package com.recruitment.controller;

import com.recruitment.dto.ApplicationDTOs.ApplicationResponse;
import com.recruitment.service.AiAnalysisService;
import com.recruitment.service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer")
public class AiAnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisController.class);
    private final AiAnalysisService aiAnalysisService;
    private final ApplicationService applicationService;

    public AiAnalysisController(AiAnalysisService aiAnalysisService, ApplicationService applicationService) {
        this.aiAnalysisService = aiAnalysisService;
        this.applicationService = applicationService;
    }

    @PostMapping("/vacancies/{vacancyId}/ai-analyse")
    public List<ApplicationResponse> analyse(@AuthenticationPrincipal String employerEmail,
                                              @PathVariable Integer vacancyId) {
        log.info("AI analysis requested for vacancy {} by employer {}", vacancyId, employerEmail);
        return aiAnalysisService.analyseVacancy(employerEmail, vacancyId, applicationService);
    }
}
