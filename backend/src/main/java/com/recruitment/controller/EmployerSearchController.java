package com.recruitment.controller;

import com.recruitment.dto.EmployerSearchDTOs.CandidateSearchResponse;
import com.recruitment.service.EmployerSearchService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/employer/candidates")
public class EmployerSearchController {

    private final EmployerSearchService service;

    public EmployerSearchController(EmployerSearchService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public List<CandidateSearchResponse> search(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal salaryMax,
            @RequestParam(required = false) String qualification,
            @RequestParam(required = false) BigDecimal minPercentage) {
        return service.searchCandidates(role, location, salaryMax, qualification, minPercentage);
    }
}
