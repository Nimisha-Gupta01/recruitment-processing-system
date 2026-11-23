package com.recruitment.repository;

import com.recruitment.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Integer> {
    List<Report> findByReportedTypeAndReportedId(Report.PartyType reportedType, Integer reportedId);
    int countByReportedTypeAndReportedId(Report.PartyType reportedType, Integer reportedId);
    boolean existsByReporterTypeAndReporterIdAndReportedTypeAndReportedId(
            Report.PartyType reporterType, Integer reporterId,
            Report.PartyType reportedType, Integer reportedId);
}
