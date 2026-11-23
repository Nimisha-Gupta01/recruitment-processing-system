package com.recruitment.controller;

import com.recruitment.dto.AdminDTOs.*;
import com.recruitment.dto.ReportDTOs.ReportSummary;
import com.recruitment.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin", description = "Super admin operations — requires ADMIN role")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @Operation(summary = "Get platform statistics")
    @GetMapping("/stats")
    public StatsResponse getStats() {
        return adminService.getStats();
    }

    @Operation(summary = "List all candidates")
    @GetMapping("/candidates")
    public List<CandidateSummary> listCandidates() {
        return adminService.listCandidates();
    }

    @Operation(summary = "List all employers")
    @GetMapping("/employers")
    public List<EmployerSummary> listEmployers() {
        return adminService.listEmployers();
    }

    @Operation(summary = "Get reports filed against a candidate")
    @GetMapping("/candidates/{id}/reports")
    public List<ReportSummary> candidateReports(@PathVariable Integer id) {
        return adminService.getReportsForCandidate(id);
    }

    @Operation(summary = "Get reports filed against an employer")
    @GetMapping("/employers/{id}/reports")
    public List<ReportSummary> employerReports(@PathVariable Integer id) {
        return adminService.getReportsForEmployer(id);
    }

    @Operation(summary = "Deactivate a candidate account")
    @PatchMapping("/candidates/{id}/deactivate")
    public void deactivateCandidate(@PathVariable Integer id) {
        adminService.setActiveCandidate(id, false);
    }

    @Operation(summary = "Activate a candidate account")
    @PatchMapping("/candidates/{id}/activate")
    public void activateCandidate(@PathVariable Integer id) {
        adminService.setActiveCandidate(id, true);
    }

    @Operation(summary = "Deactivate an employer account")
    @PatchMapping("/employers/{id}/deactivate")
    public void deactivateEmployer(@PathVariable Integer id) {
        adminService.setActiveEmployer(id, false);
    }

    @Operation(summary = "Activate an employer account")
    @PatchMapping("/employers/{id}/activate")
    public void activateEmployer(@PathVariable Integer id) {
        adminService.setActiveEmployer(id, true);
    }
}

