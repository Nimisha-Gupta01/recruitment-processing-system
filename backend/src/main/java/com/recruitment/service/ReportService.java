package com.recruitment.service;

import com.recruitment.dto.ReportDTOs.*;
import com.recruitment.entity.Report;
import com.recruitment.repository.CandidateRepository;
import com.recruitment.repository.EmployerRepository;
import com.recruitment.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepo;
    private final CandidateRepository candidateRepo;
    private final EmployerRepository employerRepo;

    public ReportService(ReportRepository reportRepo, CandidateRepository candidateRepo,
                         EmployerRepository employerRepo) {
        this.reportRepo = reportRepo;
        this.candidateRepo = candidateRepo;
        this.employerRepo = employerRepo;
    }

    public void reportEmployer(String candidateEmail, Integer employerId, String reason) {
        Integer candidateId = candidateRepo.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"))
                .getCandidateId();
        if (reportRepo.existsByReporterTypeAndReporterIdAndReportedTypeAndReportedId(
                Report.PartyType.CANDIDATE, candidateId, Report.PartyType.EMPLOYER, employerId)) {
            throw new IllegalArgumentException("You have already reported this employer");
        }
        Report r = new Report();
        r.setReporterType(Report.PartyType.CANDIDATE);
        r.setReporterId(candidateId);
        r.setReportedType(Report.PartyType.EMPLOYER);
        r.setReportedId(employerId);
        r.setReason(reason);
        reportRepo.save(r);
    }

    public void reportCandidate(String employerEmail, Integer candidateId, String reason) {
        Integer employerId = employerRepo.findByEmail(employerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Employer not found"))
                .getEmployerId();
        if (reportRepo.existsByReporterTypeAndReporterIdAndReportedTypeAndReportedId(
                Report.PartyType.EMPLOYER, employerId, Report.PartyType.CANDIDATE, candidateId)) {
            throw new IllegalArgumentException("You have already reported this candidate");
        }
        Report r = new Report();
        r.setReporterType(Report.PartyType.EMPLOYER);
        r.setReporterId(employerId);
        r.setReportedType(Report.PartyType.CANDIDATE);
        r.setReportedId(candidateId);
        r.setReason(reason);
        reportRepo.save(r);
    }

    public List<ReportSummary> getReportsFor(Report.PartyType type, Integer id) {
        return reportRepo.findByReportedTypeAndReportedId(type, id).stream()
                .map(r -> {
                    String name = resolveReporterName(r.getReporterType(), r.getReporterId());
                    return new ReportSummary(r.getReportId(), r.getReporterType().name(),
                            r.getReporterId(), name, r.getReason(),
                            r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
                })
                .collect(Collectors.toList());
    }

    public int countReportsFor(Report.PartyType type, Integer id) {
        return reportRepo.countByReportedTypeAndReportedId(type, id);
    }

    private String resolveReporterName(Report.PartyType type, Integer id) {
        if (type == Report.PartyType.CANDIDATE) {
            return candidateRepo.findById(id).map(c -> c.getFullName()).orElse("Unknown");
        } else {
            return employerRepo.findById(id).map(e -> e.getOrgName()).orElse("Unknown");
        }
    }
}
