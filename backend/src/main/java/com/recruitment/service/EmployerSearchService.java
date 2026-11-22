package com.recruitment.service;

import com.recruitment.dto.EmployerSearchDTOs.CandidateSearchResponse;
import com.recruitment.entity.Candidate;
import com.recruitment.repository.CandidateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployerSearchService {

    private final CandidateRepository candidateRepo;

    public EmployerSearchService(CandidateRepository candidateRepo) {
        this.candidateRepo = candidateRepo;
    }

    @Transactional(readOnly = true)
    public List<CandidateSearchResponse> searchCandidates(
            String role,
            String location,
            BigDecimal salaryMax,
            String qualification,
            BigDecimal minPercentage) {

        List<Candidate> candidates = candidateRepo.findByIsActiveTrue();

        return candidates.stream()
            .filter(c -> {
                if (role == null) return true;
                String r = role.toLowerCase();
                return c.getRolePrefs() != null && c.getRolePrefs().stream()
                    .anyMatch(p -> p.getPreferredRole().toLowerCase().contains(r));
            })
            .filter(c -> {
                if (location == null) return true;
                String l = location.toLowerCase();
                return c.getLocationPrefs() != null && c.getLocationPrefs().stream()
                    .anyMatch(p -> p.getLocation().toLowerCase().contains(l));
            })
            .filter(c -> {
                if (salaryMax == null) return true;
                if (c.getExpectedSalMin() == null) return false;
                return c.getExpectedSalMin().compareTo(salaryMax) <= 0;
            })
            .filter(c -> {
                if (qualification == null) return true;
                if (c.getDegree() == null) return false;
                return c.getDegree().toLowerCase().contains(qualification.toLowerCase());
            })
            .filter(c -> {
                if (minPercentage == null) return true;
                if (c.getPercentage() == null) return false;
                return c.getPercentage().compareTo(minPercentage) >= 0;
            })
            .sorted(Comparator.comparing(
                Candidate::getPercentage,
                Comparator.nullsLast(Comparator.reverseOrder())
            ))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private CandidateSearchResponse toResponse(Candidate c) {
        CandidateSearchResponse resp = new CandidateSearchResponse();
        resp.setCandidateId(c.getCandidateId());
        resp.setFullName(c.getFullName());
        resp.setEmail(c.getEmail());
        resp.setPhone(c.getPhone());
        resp.setDegree(c.getDegree());
        resp.setInstitution(c.getInstitution());
        resp.setPercentage(c.getPercentage());
        resp.setTotalExpYrs(c.getTotalExpYrs());
        resp.setExpectedSalMin(c.getExpectedSalMin());
        resp.setExpectedSalMax(c.getExpectedSalMax());
        resp.setSkills(c.getSkills() == null ? List.of() :
            c.getSkills().stream().map(s -> s.getSkillName()).collect(Collectors.toList()));
        resp.setLocationPrefs(c.getLocationPrefs() == null ? List.of() :
            c.getLocationPrefs().stream().map(p -> p.getLocation()).collect(Collectors.toList()));
        resp.setRolePrefs(c.getRolePrefs() == null ? List.of() :
            c.getRolePrefs().stream().map(p -> p.getPreferredRole()).collect(Collectors.toList()));
        return resp;
    }
}
