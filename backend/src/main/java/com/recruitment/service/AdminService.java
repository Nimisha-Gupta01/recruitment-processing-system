package com.recruitment.service;

import com.recruitment.dto.AdminDTOs.*;
import com.recruitment.dto.ReportDTOs.ReportSummary;
import com.recruitment.entity.Candidate;
import com.recruitment.entity.Employer;
import com.recruitment.entity.Report;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CandidateRepository;
import com.recruitment.repository.EmployerRepository;
import com.recruitment.repository.VacancyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final CandidateRepository candidateRepo;
    private final EmployerRepository employerRepo;
    private final VacancyRepository vacancyRepo;
    private final ApplicationRepository applicationRepo;
    private final ReportService reportService;

    public AdminService(CandidateRepository candidateRepo, EmployerRepository employerRepo,
                        VacancyRepository vacancyRepo, ApplicationRepository applicationRepo,
                        ReportService reportService) {
        this.candidateRepo = candidateRepo;
        this.employerRepo = employerRepo;
        this.vacancyRepo = vacancyRepo;
        this.applicationRepo = applicationRepo;
        this.reportService = reportService;
    }

    public StatsResponse getStats() {
        int totalCandidates = (int) candidateRepo.count();
        int totalEmployers = (int) employerRepo.count();
        int totalVacancies = (int) vacancyRepo.count();
        int totalApplications = (int) applicationRepo.count();
        int openVacancies = vacancyRepo.findByStatusOrderByPostedAtDesc(Vacancy.VacancyStatus.Open).size();
        return new StatsResponse(totalCandidates, totalEmployers, totalVacancies, totalApplications, openVacancies);
    }

    public List<CandidateSummary> listCandidates() {
        return candidateRepo.findAll().stream()
                .map(c -> new CandidateSummary(
                        c.getCandidateId(), c.getFullName(), c.getEmail(),
                        c.getRole() != null ? c.getRole() : "CANDIDATE",
                        Boolean.TRUE.equals(c.getIsActive()),
                        reportService.countReportsFor(Report.PartyType.CANDIDATE, c.getCandidateId()),
                        c.getPhone(),
                        c.getDob() != null ? c.getDob().toString() : null,
                        c.getGender() != null ? c.getGender().name() : null,
                        c.getAddress(), c.getDegree(), c.getInstitution(),
                        c.getYearOfPassing(), c.getPercentage(), c.getTotalExpYrs(),
                        c.getExpectedSalMin(), c.getExpectedSalMax(),
                        c.getCreatedAt() != null ? c.getCreatedAt().toString() : null))
                .collect(Collectors.toList());
    }

    public List<EmployerSummary> listEmployers() {
        return employerRepo.findAll().stream()
                .map(e -> new EmployerSummary(
                        e.getEmployerId(), e.getOrgName(), e.getEmail(),
                        Boolean.TRUE.equals(e.getIsActive()),
                        reportService.countReportsFor(Report.PartyType.EMPLOYER, e.getEmployerId()),
                        e.getContactName(), e.getPhone(), e.getAddress(), e.getWebsite(),
                        e.getEstablishedYr(), e.getNumEmployees(), e.getAnnualTurnover(),
                        e.getCreatedAt() != null ? e.getCreatedAt().toString() : null))
                .collect(Collectors.toList());
    }

    public List<ReportSummary> getReportsForCandidate(Integer id) {
        return reportService.getReportsFor(Report.PartyType.CANDIDATE, id);
    }

    public List<ReportSummary> getReportsForEmployer(Integer id) {
        return reportService.getReportsFor(Report.PartyType.EMPLOYER, id);
    }

    @Transactional
    public void setActiveCandidate(Integer id, boolean active) {
        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found: " + id));
        c.setIsActive(active);
        candidateRepo.save(c);
    }

    @Transactional
    public void setActiveEmployer(Integer id, boolean active) {
        Employer e = employerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employer not found: " + id));
        e.setIsActive(active);
        employerRepo.save(e);
    }
}
