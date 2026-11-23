package com.recruitment.controller;

import com.recruitment.dto.EmployerSearchDTOs.CandidateSearchResponse;
import com.recruitment.service.EmployerSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Candidate Search", description = "Employer-side candidate search")
@RestController
@RequestMapping("/api/employer/candidates")
public class EmployerSearchController {

    private static final Logger log = LoggerFactory.getLogger(EmployerSearchController.class);
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
        log.info("Searching candidates — role={}, location={}, salaryMax={}, qualification={}, minPercentage={}",
                role, location, salaryMax, qualification, minPercentage);
        List<CandidateSearchResponse> results = service.searchCandidates(role, location, salaryMax, qualification, minPercentage);
        log.info("Candidate search returned {} results", results.size());
        return results;
    }
}
