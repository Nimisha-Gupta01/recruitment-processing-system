package com.recruitment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartyType reporterType;

    @Column(nullable = false)
    private Integer reporterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartyType reportedType;

    @Column(nullable = false)
    private Integer reportedId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PartyType { CANDIDATE, EMPLOYER }

    public Integer getReportId() { return reportId; }
    public PartyType getReporterType() { return reporterType; }
    public void setReporterType(PartyType reporterType) { this.reporterType = reporterType; }
    public Integer getReporterId() { return reporterId; }
    public void setReporterId(Integer reporterId) { this.reporterId = reporterId; }
    public PartyType getReportedType() { return reportedType; }
    public void setReportedType(PartyType reportedType) { this.reportedType = reportedType; }
    public Integer getReportedId() { return reportedId; }
    public void setReportedId(Integer reportedId) { this.reportedId = reportedId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
