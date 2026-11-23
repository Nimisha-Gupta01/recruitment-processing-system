package com.recruitment.controller;

import com.recruitment.dto.VacancyDTOs.VacancyResponse;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.VacancyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Public", description = "Public endpoints — no authentication required")
@RestController
@RequestMapping("/api/vacancies")
public class PublicVacancyController {

    private final VacancyRepository vacancyRepository;

    public PublicVacancyController(VacancyRepository vacancyRepository) {
        this.vacancyRepository = vacancyRepository;
    }

    @Operation(summary = "List all open vacancies (public, no login needed)")
    @GetMapping("/open")
    public List<VacancyResponse> openVacancies(@RequestParam(required = false) String location,
                                                @RequestParam(required = false) BigDecimal salaryMax) {
        List<Vacancy> vacancies = vacancyRepository.findByStatusOrderByPostedAtDesc(Vacancy.VacancyStatus.Open);
        return vacancies.stream()
                .filter(v -> location == null || (v.getLocation() != null && v.getLocation().equalsIgnoreCase(location)))
                .filter(v -> salaryMax == null || (v.getSalaryMin() != null && v.getSalaryMin().compareTo(salaryMax) <= 0))
                .map(VacancyResponse::new)
                .collect(Collectors.toList());
    }
}
