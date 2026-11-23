package com.recruitment.controller;

import com.recruitment.dto.VacancyDTOs.*;
import com.recruitment.service.VacancyService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer/vacancies")
public class VacancyController {

    private static final Logger log = LoggerFactory.getLogger(VacancyController.class);
    private final VacancyService vacancyService;

    public VacancyController(VacancyService vacancyService) {
        this.vacancyService = vacancyService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VacancyResponse create(@AuthenticationPrincipal String employerEmail,
                                   @Valid @RequestBody VacancyCreateRequest req) {
        log.info("Creating vacancy '{}' for employer: {}", req.getDesignation(), employerEmail);
        VacancyResponse res = vacancyService.create(employerEmail, req);
        log.info("Vacancy created with id={} for employer: {}", res.getVacancyId(), employerEmail);
        return res;
    }

    @GetMapping
    public List<VacancyResponse> list(@AuthenticationPrincipal String employerEmail) {
        log.info("Listing vacancies for employer: {}", employerEmail);
        return vacancyService.listByEmployer(employerEmail);
    }

    @GetMapping("/{id}")
    public VacancyResponse getOne(@AuthenticationPrincipal String employerEmail,
                                   @PathVariable Integer id) {
        return vacancyService.getOne(employerEmail, id);
    }

    @PutMapping("/{id}")
    public VacancyResponse update(@AuthenticationPrincipal String employerEmail,
                                   @PathVariable Integer id,
                                   @RequestBody VacancyUpdateRequest req) {
        log.info("Updating vacancy id={} for employer: {}", id, employerEmail);
        return vacancyService.update(employerEmail, id, req);
    }

    @PatchMapping("/{id}/close")
    public VacancyResponse close(@AuthenticationPrincipal String employerEmail,
                                  @PathVariable Integer id) {
        log.info("Closing vacancy id={} for employer: {}", id, employerEmail);
        return vacancyService.close(employerEmail, id);
    }
}
