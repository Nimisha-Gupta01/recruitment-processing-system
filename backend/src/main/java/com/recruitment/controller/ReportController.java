package com.recruitment.controller;

import com.recruitment.dto.ReportDTOs.*;
import com.recruitment.entity.Report;
import com.recruitment.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reports", description = "Report employers or candidates")
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(summary = "Candidate reports an employer")
    @PostMapping("/employer/{employerId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void reportEmployer(@AuthenticationPrincipal String email,
                               @PathVariable Integer employerId,
                               @RequestBody SubmitReportRequest req) {
        reportService.reportEmployer(email, employerId, req.getReason());
    }

    @Operation(summary = "Employer reports a candidate")
    @PostMapping("/candidate/{candidateId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void reportCandidate(@AuthenticationPrincipal String email,
                                @PathVariable Integer candidateId,
                                @RequestBody SubmitReportRequest req) {
        reportService.reportCandidate(email, candidateId, req.getReason());
    }
}
