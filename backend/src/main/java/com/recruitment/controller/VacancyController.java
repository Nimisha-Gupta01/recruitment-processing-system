package com.recruitment.controller;

import com.recruitment.dto.VacancyDTOs.*;
import com.recruitment.service.VacancyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer/vacancies")
public class VacancyController {

    private final VacancyService vacancyService;

    public VacancyController(VacancyService vacancyService) {
        this.vacancyService = vacancyService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VacancyResponse create(@AuthenticationPrincipal String employerEmail,
                                   @Valid @RequestBody VacancyCreateRequest req) {
        return vacancyService.create(employerEmail, req);
    }

    @GetMapping
    public List<VacancyResponse> list(@AuthenticationPrincipal String employerEmail) {
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
        return vacancyService.update(employerEmail, id, req);
    }

    @PatchMapping("/{id}/close")
    public VacancyResponse close(@AuthenticationPrincipal String employerEmail,
                                  @PathVariable Integer id) {
        return vacancyService.close(employerEmail, id);
    }
}
